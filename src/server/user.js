import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { databaseConnection } from "../utils/database";
import barbeariaSchema from "../models/user";

const SECRET = process.env.SECRET_TOKEN;

function createToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    SECRET,
    { expiresIn: "30d" } // O token expira em 30 dias
  );
}

// Função para ler e verificar o token JWT
function readToken(token) {
  try {
    console.log("Verificando token:", token);
    return jwt.verify(token, SECRET);
  } catch (err) {
    console.error("Erro na verificação do token:", err);
    throw new Error("Token inválido");
  }
}

export function verifica(token) {
  try {
    console.log("Dentro da função de verificação do token")
    if(!token) {
      throw new Error("Token não encontrado")
    }
    return readToken(token)
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    throw new Error("Erro na verificação do token");
  }
}

export const register = async (body) => {
  await databaseConnection();

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const newBarbearia = await barbeariaSchema.create({
    name: body.name,
    descricao: body.descricao,
    logo_url: body.logo_url,
    phone: body.phone,
    email: body.email,
    endereco: body.endereco,
    horario_funcionamento: body.horario_funcionamento,
    feriados_bloqueados: body.feriados_bloqueados,
    plano_assinado: "",
    data_expiracao_plano: body.data_expiracao_plano,
    status_conta: "inativo",
    password: hashedPassword,
  });

  console.log("Barbearia registrada:", newBarbearia);
  return newBarbearia;
};

export const login = async (body) => {
  await databaseConnection();

  const user = await barbeariaSchema.findOne({ email: body.email });

  if (!user) {
    throw new Error("Usuário inválido");
  }

  const passwordMatch = await bcrypt.compare(body.password, user.password);

  if (!passwordMatch) {
    throw new Error("Senha incorreta");
  }

  const token = createToken(user);

  return { token };
};

export const getUserById = async (userId) => {
  await databaseConnection();
  const user = await barbeariaSchema.findById(userId);
  if (!user) {
    console.log("Usuário não encontrado");
    return;
  }

  return user
};
