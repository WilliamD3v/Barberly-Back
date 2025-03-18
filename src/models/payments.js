import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  client_reference_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String, required: true },
  stripe_subscription_id: { type: String, required: true },
  stripe_customer_id: { type: String, required: true },
});

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
