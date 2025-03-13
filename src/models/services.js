import mongoose from "mongoose";

const servicoSchema = new mongoose.Schema({
  barbearia_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  name: String, // Nome do serviço
  description: String, // Descrição breve
  price: Number, // Preço do serviço
  duration: Number, // Duração em minutos
  ativo: { type: Boolean, default: true }, // Status do serviço
});

export default mongoose.models.Service ||
  mongoose.model("Service", servicoSchema);
