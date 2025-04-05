require("dotenv").config();
import { v2 as cloudinary } from "cloudinary";

import { databaseConnection } from "../utils/database";
import productSchema from "../models/products";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createProducts = async (body, file, barberId) => {
  await databaseConnection();

  const existingProductsCount = await productSchema.countDocuments({
    barbearia_id: barberId,
  });

  const MAX_PRODUCTS = 3;

  if (existingProductsCount >= MAX_PRODUCTS) {
    throw {
      status: 403,
      message: `Limite de ${MAX_PRODUCTS} produtos atingido.`,
    };
  }

  const uploadToCloudinary = async (file, attempt = 1) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads", timeout: 180000 }, // Timeout de 3 minutos
        (error, result) => {
          if (error) {
            console.error(
              `❌ Erro no Cloudinary (Tentativa ${attempt}):`,
              error
            );
            return reject(error);
          }
          console.log(
            `✅ Upload bem-sucedido (Tentativa ${attempt}):`,
            result.secure_url
          );
          resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });
  };

  let uploadResults;
  let maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      uploadResults = await uploadToCloudinary(file, attempt);
      if (uploadResults) break; // Sai do loop se der certo
    } catch (error) {
      if (attempt < maxAttempts) {
        console.log(
          `⏳ Aguardando antes de tentar novamente (${attempt}/${maxAttempts})...`
        );
        await new Promise((res) => setTimeout(res, 2000 * attempt)); // Espera progressiva: 2s, 4s, 6s
      } else {
        console.error("❌ Todas as tentativas falharam. Abortando upload.");
        throw {
          status: 504,
          message: "Cloudinary demorou muito para responder. Tente novamente.",
          error,
        };
      }
    }
  }

  if (!uploadResults) throw new Error("❌ Falha no upload da imagem");

  console.log("💾 Salvando imagem no banco de dados...");
  const newImage = new productSchema({
    barbearia_id: barberId,
    name: body.name,
    description: body.description,
    price: body.price,
    counter: body.counter,
    image: {
      name: file.originalname,
      url: uploadResults.secure_url,
      cloudinary_id: uploadResults.public_id,
    },
  });

  await newImage.save();

  console.log("✅ Produto salvo com sucesso no banco!");
  return newImage;
};

export const updateProduct = async (productId, body, file) => {
  await databaseConnection();

  const uploadToCloudinary = (file, attempt = 1) => {
    return new Promise((resolve, reject) => {
      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "uploads" },
          (error, result) => {
            if (error) {
              console.error(
                `❌ Erro no Cloudinary (Tentativa ${attempt}):`,
                error
              );
              return reject(error);
            }
            console.log(
              `✅ Upload bem-sucedido (Tentativa ${attempt}):`,
              result.secure_url
            );
            resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      } catch (err) {
        reject(err); // pega erro inesperado fora do callback
      }
    });
  };

  const tryCloudinaryUpload = async (file, maxAttempts = 3) => {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await uploadToCloudinary(file, attempt);
        return result;
      } catch (err) {
        lastError = err;
        if (attempt < maxAttempts) {
          console.log(
            `⏳ Tentando novamente o upload (${attempt}/${maxAttempts})...`
          );
          await new Promise((res) => setTimeout(res, 2000 * attempt));
        }
      }
    }
    throw {
      status: 504,
      message: "❌ Falha ao enviar imagem após múltiplas tentativas",
      error: lastError,
    };
  };

  try {
    const product = await productSchema.findById(productId);
    if (!product) {
      throw { status: 404, message: "Produto não encontrado" };
    }

    // Copia os dados existentes
    const updatedData = Object.assign({}, product.toObject());

    // Atualiza campos do body se existirem
    for (const key in body) {
      if (body[key] !== undefined && body[key] !== null) {
        updatedData[key] = body[key];
      }
    }

    // Se veio imagem, tenta fazer upload no Cloudinary com retries
    if (file) {
      if (product.image && product.image.cloudinary_id) {
        await cloudinary.uploader.destroy(product.image.cloudinary_id);
      }

      const uploadResults = await tryCloudinaryUpload(file);

      updatedData.image = {
        name: file.originalname,
        url: uploadResults.secure_url,
        cloudinary_id: uploadResults.public_id,
      };
    }

    // Atualiza o produto no banco
    const updatedProduct = await productSchema.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );

    return updatedProduct;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Erro ao atualizar produto",
      error,
    };
  }
};

export const deleteProduct = async (productId) => {
  await databaseConnection();

  const deleteFromCloudinary = async (publicId, attempt = 1) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        timeout: 180000,
      });

      console.log(`🧹 Deleção (Tentativa ${attempt}):`, result);

      if (result.result !== "ok") {
        throw new Error(`Erro na deleção: ${result.result}`);
      }

      return result;
    } catch (error) {
      console.error(`❌ Erro ao deletar imagem (Tentativa ${attempt}):`, error);
      throw error;
    }
  };

  try {
    const product = await productSchema.findById(productId);
    if (!product) {
      throw { status: 404, message: "Produto não encontrado" };
    }

    if (product.image && product.image.cloudinary_id) {
      const publicId = product.image.cloudinary_id;

      const maxAttempts = 3;
      let deleteResult = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          deleteResult = await deleteFromCloudinary(publicId, attempt);
          if (deleteResult) break; // sucesso
        } catch (error) {
          if (attempt < maxAttempts) {
            console.log(
              `⏳ Tentando deletar imagem novamente (${attempt}/${maxAttempts})...`
            );
            await new Promise((res) => setTimeout(res, 2000 * attempt)); // 2s, 4s, 6s
          } else {
            console.error("❌ Todas as tentativas de deletar imagem falharam.");
            // Continua mesmo se falhar todas, pra não travar a deleção do produto
          }
        }
      }
    }

    await productSchema.findByIdAndDelete(productId);

    console.log("✅ Produto deletado com sucesso do banco.");
    return { message: "Produto deletado com sucesso" };
  } catch (error) {
    console.error("❌ Erro ao deletar produto:", error);
    throw { status: 500, message: "Erro ao deletar produto", error };
  }
};

export const getProducts = async (barberId) => {
  await databaseConnection();

  const Produto = await productSchema.find({ barbearia_id: barberId });

  if (!Produto) {
    throw new Error("Produto não encontrado!");
  }

  return Produto;
};
