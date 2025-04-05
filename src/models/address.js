import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  barbearia_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  street: String,
  number: String,
  neighborhood: String,
  city: String,
  zipcode: String,
});

export default mongoose.models.address || mongoose.model("address", addressSchema);
