import nodemailer from "nodemailer";
import { format } from "date-fns";
import cron from "node-cron";

import { databaseConnection } from "../utils/database";
import Reserva from "../models/reservas";

export const createReserva = async (
  body,
  barbeariaId,
  funcionarioId,
  serviceId
) => {
  await databaseConnection();

  const registerUser = await Reserva.create({
    barbearia_id: barbeariaId,
    funcionario_id: funcionarioId,
    servico_id: serviceId,
    items: body.items,
    cliet: body.cliet,
    horarioSelecionados: body.horarioSelecionados,
    totalPrice: body.totalPrice,
    totalDuration: body.totalDuration,
    nameFuncionario: body.funcionario,
  });

  return registerUser;
};

export const getAllScheduling = async (barbeId) => {
  await databaseConnection();

  const barber = await Reserva.find({ barbearia_id: barbeId });

  if (!barber || barber.length === 0) {
    throw new Error("Agendamentos não encontrada");
  }

  console.log(barber);

  return barber;
};

export const getScheduling = async (barbeId, employeeId) => {
  await databaseConnection();

  const barber = await Reserva.find({ barbearia_id: barbeId });

  if (!barber || barber.length === 0) {
    console.log("Barbearia nao encontrada");
    return;
  }

  const employee = barber.filter(
    (emp) => emp.funcionario_id.toString() === employeeId
  );

  if (!employee) {
    console.log("Funcionário não encontrado");
    return;
  }

  return employee;
};

export const sendEmail = async (to, subject, text) => {
  try {
    // Configuração do transporte SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail", // Ou outro serviço de e-mail (Outlook, Yahoo, SMTP personalizado)
      auth: {
        user: "williangamerplay5666@gmail.com", // Seu e-mail
        pass: "jfnl uvxl iwnu aakh", // Senha do e-mail (ou App Password)
      },
    });

    // Configuração do e-mail
    const mailOptions = {
      from: "williangamerplay5666@gmail.com",
      to,
      subject,
      text, // Pode usar `html: "<h1>Olá</h1>"` para HTML no corpo do e-mail
    };

    // Envia o e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado: " + info.response);
  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
  }
};

export const updataStatusScheduling = async (
  barbeId,
  employeeId,
  schedulingId,
  statusScheduling
) => {
  await databaseConnection();

  const barber = await Reserva.findOne({
    barbearia_id: barbeId,
    funcionario_id: employeeId,
    _id: schedulingId,
  });

  const emailClient = barber.cliet.email;
  const nameFuncionario = barber.nameFuncionario;

  if (!barber) {
    throw new Error("Agendamento não encontrado");
  }

  if (statusScheduling === "cancelada") {
    await barber.deleteOne({ _id: schedulingId });
    sendEmail(
      emailClient,
      `Agendamento ${statusScheduling}`,
      `Seu agendamento foi ${statusScheduling} pelo funcionário: ${nameFuncionario}`
    );
    return;
  }

  const atualizado = await Reserva.findOneAndUpdate(
    { _id: schedulingId },
    { $set: { status: statusScheduling } },
    { new: true }
  );

  sendEmail(
    emailClient,
    `Agendamento ${statusScheduling}`,
    `Seu agendamento foi ${statusScheduling} pelo funcionário: ${nameFuncionario}`
  );

  return atualizado;
};

export const deleteAllReserverForDay = async () => {
  await databaseConnection();

  const diaFuturo = new Date();
  const dataFormatada = format(diaFuturo, "dd/MM/yyyy");

  const reservaForDay = await Reserva.find();

  const reservasFiltradas = reservaForDay.filter((reserva) => {
    const dataReserva = reserva.horarioSelecionados.data.date;

    if (dataReserva === dataFormatada) return dataReserva;
  });

  if (reservasFiltradas.length > 0) {
    await Reserva.deleteMany({
      "horarioSelecionados.data.date": dataFormatada,
    });
    console.log(`✅ Reservas do dia ${dataFormatada} foram deletadas.`);
  } else {
    console.log(`⚠️ Nenhuma reserva encontrada para ${dataFormatada}.`);
  }
};

cron.schedule("59 23 * * *", () => {
  console.log("🔄 Executando a limpeza de reservas...");
  deleteAllReserverForDay();
});