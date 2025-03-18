require("dotenv").config();
import express from "express";
import Stripe from "stripe";
import { handleCheckoutSessionCompleted } from "../server/payments";
import { handleSubscriptionSessionCompleted } from "../server/payments";
import { handleCancelPlan } from "../server/payments";

// Rodar o Stripe CLI
/* stripe listen --forward-to http://localhost:5000/webhooks/webhook */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event)
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionSessionCompleted(event)
          break;
        case 'customer.subscription.deleted':
          await handleCancelPlan(event)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      res.json({ received: true });
    } catch (err) {
      console.error("Erro no webhook:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
