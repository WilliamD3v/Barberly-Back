import { databaseConnection } from "../utils/database";
import employeesSchema from "../models/employees";
import Reserva from "../models/reservas";

export const registerEmployees = async (body, userId) => {
  await databaseConnection();

  const createEmployees = await employeesSchema.create({
    barbearia_id: userId,
    name: body.name,
    schedules: body.schedules,
    ativo: true,
  });
  return createEmployees;
};

export const getEmployees = async (userId) => {
  await databaseConnection();

  const employeesAll = await employeesSchema.find({ barbearia_id: userId });

  if (!employeesAll || employeesAll.length === 0) {
    console.log("Serviços não encontrados para essa barbearia");
    return;
  }

  console.log(employeesAll);

  return employeesAll;
};

export const updateEmployee = async (employeeId, updatedData) => {
  await databaseConnection();

  const employee = await employeesSchema.findById(employeeId);
  if (!employee) {
    throw new Error("Funcionário não encontrado");
  }

  const updates = {};

  // Atualiza nome, se for diferente
  if (updatedData.name && updatedData.name !== employee.name) {
    updates.name = updatedData.name;
  }

  // Atualiza schedules, se for diferente
  if (
    updatedData.schedules &&
    JSON.stringify(updatedData.schedules) !== JSON.stringify(employee.schedules)
  ) {
    updates.schedules = updatedData.schedules;
  }

  // Se houver alguma modificação, atualiza
  if (Object.keys(updates).length > 0) {
    await employeesSchema.updateOne({ _id: employeeId }, { $set: updates });
    return { success: true, updated: updates };
  } else {
    return {
      success: true,
      updated: null,
      message: "Nenhuma alteração detectada",
    };
  }
};

export const getEmployeeById = async (userId, employeesId) => {
  await databaseConnection();

  // Encontra todos os funcionários da barbearia
  const employees = await employeesSchema.find({ barbearia_id: userId });

  if (!employees || employees.length === 0) {
    console.log("Nenhum funcionário encontrado para essa barbearia");
    return;
  }

  // Encontra o funcionário específico pelo ID
  const employee = employees.find((emp) => emp._id.toString() === employeesId);

  if (!employee) {
    console.log("Funcionário não encontrado");
    return;
  }

  console.log(employee);
  return employee;
};

export const deleteEmployees = async (barbeariaId, employeesId) => {
  await databaseConnection();

  const employees = await employeesSchema.find({ barbearia_id: barbeariaId });
  const reservas = await Reserva.find({ barbearia_id: barbeariaId });

  if (!employees || employees.length === 0) {
    console.log("Nenhum funcionário encontrado para essa barbearia");
    return;
  }

  const employee = employees.find((emp) => emp._id.toString() === employeesId);

  if (!employee) {
    console.log("Funcionário não encontrado");
    return;
  }

  // Filtra todas as reservas desse funcionário
  const employeeReservations = reservas.filter(
    (reserva) => reserva.funcionario_id.toString() === employeesId
  );

  console.log(
    "Reservas do funcionário a serem deletadas:",
    employeeReservations
  );

  // Deleta todas as reservas do funcionário
  await Reserva.deleteMany({ funcionario_id: employeesId });

  // Deleta o funcionário
  await employeesSchema.deleteOne({ _id: employeesId });

  console.log("Funcionário e reservas deletados com sucesso");

  return employee;
};
