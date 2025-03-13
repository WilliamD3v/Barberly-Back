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
    totalPrice: body.totalPrice,
    totalDuration: body.totalDuration,
    nameFuncionario: body.funcionario,
  });

  console.log(body);

  return registerUser;
};

export const getAllScheduling = async (barbeId, employeeId) => {
  await databaseConnection();

  const barber = await Reserva.find({ barbearia_id: barbeId });

  if (!barber || barber.length === 0) {
    console.log("Barbearia nao encontrada");
    return;
  }

  const employee = barber.filter(emp => emp.funcionario_id.toString() === employeeId)

  if (!employee) {
    console.log("Funcionário não encontrado");
    return;
  }

  console.log("testeando os dados:", employee)

  return employee;
};