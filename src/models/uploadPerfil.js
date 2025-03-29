import mongoose from "mongoose";

const uploadImageSchema = new mongoose.Schema({
  barbearia_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  name: String,
  url: String,
  cloudinary_id: String,
  type: { type: String, enum: ["profile", "banner"], required: true },
});

const ImageProfile =
  mongoose.models.ImageProfile ||
  mongoose.model("ImageProfile", uploadImageSchema);

export default ImageProfile;
