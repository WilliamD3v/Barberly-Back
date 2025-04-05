import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  barbearia_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  name: String,
  description: String,
  price: Number,
  counter: Number,
  image: {
    name: String,
    url: String,
    cloudinary_id: String,
  },
});

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
