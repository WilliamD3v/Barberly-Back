import multer from "multer";
import express from "express";

import { uploadImageProfile } from "../server/uploadPerfil";
import  { getImagesProfile } from "../server/uploadPerfil"; 

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload-image/:barberId",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  async (req, res) => {
    const barberId = req.params.barberId;
    const profileFile =
      req.files && req.files.profile ? req.files.profile[0] : null;
    const bannerFile =
      req.files && req.files.banner ? req.files.banner[0] : null;

    if (!profileFile && !bannerFile) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }

    try {
      // Upload de cada imagem (caso existam)
      const profileUpload = profileFile
        ? await uploadImageProfile(profileFile, barberId, "profile")
        : null;
      const bannerUpload = bannerFile
        ? await uploadImageProfile(bannerFile, barberId, "banner")
        : null;

      res.status(200).json({
        message: "Upload realizado com sucesso!",
        profile: profileUpload ? profileUpload.url : null,
        banner: bannerUpload ? bannerUpload.url : null,
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ message: "Erro ao fazer upload", error });
    }
  }
);

router.get("/get-image/:barberId", async (req, res) => {
  const barberId = req.params.barberId

  try {
    const results = await getImagesProfile(barberId)
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
});

router.get("/updata-image/:barberId", async (req, res) => {});

router.get("/delete-image/:barberId", async (req, res) => {});

export default router;
