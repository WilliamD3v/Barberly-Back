import mongoose from "mongoose";

const barbeariaSchema  = new mongoose.Schema({
  name: String, // Nome da barbearia
  descricao: String, // Descrição breve
  logo_url: String, // URL do logo
  phone: String, // Número do WhatsApp
  email: String, // E-mail oficial
  password: String,
  horario_funcionamento: {
    abertura: String, // Ex.: "09:00"
    fechamento: String, // Ex.: "18:00"
    dias: [String] // Ex.: ["Segunda", "Terça", ...]
  },
  feriados_bloqueados: [Date], // Datas bloqueadas
  plano_assinado: String, // Ex.: "básico", "premium"
  data_expiracao_plano: Date, // Data de expiração do plano
  status_conta: { type: String },
  data_criacao: { type: Date, default: new Date() },
  data_atualizacao: Date
});

export default mongoose.models.User || mongoose.model("User", barbeariaSchema );
