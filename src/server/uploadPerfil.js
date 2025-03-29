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

  try {
    const uploadResults = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, result) => {
          if (error) {
            return reject({
              status: 500,
              message: "Erro ao enviar para o Cloudinary",
              error,
            });
          }
          resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });

    if (!uploadResults || typeof uploadResults !== "object") {
      throw new Error("Falha no upload da imagem");
    }

    // Agora utilizando o modelo correto
    const newImage = new ImageProfile({
      barbearia_id: barberId,
      name: file.originalname,
      url: uploadResults.secure_url,
      cloudinary_id: uploadResults.public_id,
      type: type,
    });

    await newImage.save();

    return newImage;
  } catch (error) {
    console.error("Erro ao fazer upload ou salvar no banco:", error);
    throw {
      status: 500,
      message: "Erro ao fazer upload ou salvar no banco",
      error,
    };
  }
};

export const getImagesProfile = async (barberId) => {
  await databaseConnection()

  const barber = await ImageProfile.find({
    barbearia_id: barberId
  })

  if (!barber) {
    throw new Error("Barbearia não encontrada")
  }

  return barber
}