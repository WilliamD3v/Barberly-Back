import express from "express";
import multer from "multer";

import { createProducts } from "../server/products";
import { updateProduct } from "../server/products";
import { deleteProduct } from "../server/products";
import { getProducts } from "../server/products";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/create-products/:barberId",
  upload.single("image"),
  async (req, res) => {
    const body = req.body;
    const barberId = req.params.barberId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
    }

    try {
      const results = await createProducts(body, file, barberId);
      res.status(200).json(results);
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.put(
  "/updata-product/:productId",
  upload.single("image"),
  async (req, res) => {
    const productId = req.params.productId;
    const body = req.body;
    const file = req.file;

    console.log(file)

    try {
      const result = await updateProduct(productId, body, file);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete("/delete-product/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const result = await deleteProduct(productId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-product/:barberId", async (req, res) => {
  const barberId = req.params.barberId;

  try {
    const results = await getProducts(barberId);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
