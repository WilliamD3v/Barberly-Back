require("dotenv").config();
import { v2 as cloudinary } from "cloudinary";
import { databaseConnection } from "../utils/database";
import ImageProfile from "../models/uploadPerfil";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageProfile = async (file, barberId, type) => {
  await databaseConnection();

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
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      uploadResults = await uploadToCloudinary(file, attempt);
      if (uploadResults) break; // Sucesso
    } catch (error) {
      if (attempt < maxAttempts) {
        console.log(
          `⏳ Aguardando antes de tentar novamente (${attempt}/${maxAttempts})...`
        );
        await new Promise((res) => setTimeout(res, 2000 * attempt)); // 2s, 4s, 6s
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

  if (!uploadResults || typeof uploadResults !== "object") {
    throw new Error("Falha no upload da imagem");
  }

  try {
    const newImage = new ImageProfile({
      barbearia_id: barberId,
      name: file.originalname,
      url: uploadResults.secure_url,
      cloudinary_id: uploadResults.public_id,
      type: type,
    });

    await newImage.save();

    console.log("✅ Imagem de perfil salva com sucesso no banco!");
    return newImage;
  } catch (error) {
    console.error("Erro ao salvar no banco:", error);
    throw {
      status: 500,
      message: "Erro ao salvar no banco de dados",
      error,
    };
  }
};

export const updateImageProfile = async (file, barberId, imageId, type) => {
  await databaseConnection();

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
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      uploadResults = await uploadToCloudinary(file, attempt);
      if (uploadResults) break; // Sucesso
    } catch (error) {
      if (attempt < maxAttempts) {
        console.log(
          `⏳ Tentando novamente em ${
            2 * attempt
          }s (${attempt}/${maxAttempts})...`
        );
        await new Promise((res) => setTimeout(res, 2000 * attempt));
      } else {
        console.error("❌ Todas as tentativas de upload falharam.");
        throw {
          status: 504,
          message: "Cloudinary demorou muito para responder. Tente novamente.",
          error,
        };
      }
    }
  }

  if (!uploadResults || typeof uploadResults !== "object") {
    throw new Error("❌ Falha no upload da nova imagem");
  }

  try {
    const existingImage = await ImageProfile.findOne({
      _id: imageId,
      barbearia_id: barberId,
    });

    if (!existingImage) {
      throw {
        status: 404,
        message: "Imagem não encontrada",
      };
    }

    // Excluir imagem antiga do Cloudinary
    if (existingImage.cloudinary_id) {
      try {
        await cloudinary.uploader.destroy(existingImage.cloudinary_id);
        console.log("🗑️ Imagem antiga removida do Cloudinary");
      } catch (deleteError) {
        console.warn(
          "⚠️ Falha ao deletar imagem antiga do Cloudinary:",
          deleteError
        );
      }
    }

    // Atualizar dados
    existingImage.name = file.originalname;
    existingImage.url = uploadResults.secure_url;
    existingImage.cloudinary_id = uploadResults.public_id;
    existingImage.type = type;

    await existingImage.save();

    console.log("✅ Imagem atualizada com sucesso");
    return existingImage;
  } catch (error) {
    console.error("Erro ao atualizar imagem:", error);
    throw {
      status: 500,
      message: "Erro ao atualizar imagem no banco",
      error,
    };
  }
};

export const getImagesProfile = async (barberId) => {
  await databaseConnection();

  const barber = await ImageProfile.find({
    barbearia_id: barberId,
  });

  if (!barber) {
    throw new Error("Barbearia não encontrada");
  }

  return barber;
};
