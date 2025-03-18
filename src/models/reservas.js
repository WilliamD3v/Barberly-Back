import mongoose from "mongoose";

const reservaSchema = new mongoose.Schema({
  barbearia_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  funcionario_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  servico_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  nameFuncionario: String,
  totalPrice: Number,
  totalDuration: Number,
  items: [
    {
      barbearia_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
      name: String,
      description: String,
      price: Number,
      duration: Number,
      ativo: Boolean,
      __v: Number,
    },
  ],
  horarioSelecionados: {
    data: {
      date: String,
      day: String,
      horariosInicial: String,
      horariosFinal: String,
    }
  },
  status: {
    type: String,
    enum: ["pendente", "confirmada", "concluída", "cancelada"],
    default: "pendente",
  },
  cliet: {
    name: String,
    phone: String,
    email: String,
    password: String,
  },
  data_criacao: { type: Date, default: new Date() },
  data_expiracao: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});

const Reserva = mongoose.model("Reservas", reservaSchema);

export default Reserva;
