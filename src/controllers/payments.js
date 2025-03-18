require("dotenv").config();
import express from "express";
import { createSubscription } from "../server/payments";
import { handlePlanUpdate } from "../server/payments";
import { hendleGetUserPayment } from "../server/payments";
import { cancelSubscriptionAndDeleteUser } from "../server/payments";

const router = express.Router();

router.post("/create-checkout-session/:barbeariaId", async (req, res) => {
  const barbeariaId = req.params.barbeariaId;
  const { userEmail, planId } = req.body;

  try {
    const session = await createSubscription(barbeariaId, userEmail, planId);
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/updata-payment", async (req, res) => {
  const body = req.body;
  const subscriptionId = body.subscriptionId;
  const newPriceId = body.newPriceId;

  try {
    await handlePlanUpdate(subscriptionId, newPriceId);
    res.status(200);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.get("/get-data-payments-user/:barbeariaId", async (req, res) => {
  const barbeariaId = req.params.barbeariaId;

  try {
    const results = await hendleGetUserPayment(barbeariaId);
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.delete("/delete-payment", async (req, res) => {
  const { subscriptionId, customerId, paymentId, barbeariaId } = req.body;

  try {
    await cancelSubscriptionAndDeleteUser(paymentId, subscriptionId, customerId, barbeariaId);
    res.status(200).json({ message: "Assinatura cancelada e usuário removido com sucesso." });
  } catch (error) {
    res.status(400).json({ message: "Erro ao processar a requisição.", error: error.message });
  }
});


export default router;
