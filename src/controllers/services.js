import express from "express";

import { registerService } from "../server/services";
import { updataService } from "../server/services";
import { deleteService } from "../server/services";
import { getServiceByClientId } from "../server/services";

const router = express.Router();

router.post("/register/:userId", async (req, res) => {
  const userId = req.params.userId;
  const body = req.body;

  try {
    const results = await registerService(body, userId);
    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: "Erro" });
  }
});

router.put("/update-service/:serviceId", async (req, res) => {
  const body = req.body;
  const serviceId = req.params.serviceId;

  console.log(body)

  try {
    const results = await updataService(body, serviceId);
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/delete/:userId/:serviceId", async (req, res) => {
  const userId = req.params.userId;
  const serviceId = req.params.serviceId;

  try {
    const results = await deleteService(userId, serviceId);
    res.status(201).json(results);
  } catch (error) {
    res.status(500).json(error, "Error ao cadastrar serviço");
  }
});

router.get("/data-service/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const results = await getServiceByClientId(userId);
    res.status(201).json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao cadastrar serviço", error: error.message });
  }
});

export default router;
