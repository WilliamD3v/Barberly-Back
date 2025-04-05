import express from "express";

import { createAddress } from "../server/address";
import { getAddress } from "../server/address";

const router = express.Router();

router.post("/register-address/:barberId", async (req, res) => {
  const body = req.body;
  const barberId = req.params.barberId;

  console.log("Teste do body", body)

  try {
    const results = await createAddress(body, barberId);
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/get-address/:barberId", async (req, res) => {
  const barberId = req.params.barberId

  try {
    const results = await getAddress(barberId)
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router;
