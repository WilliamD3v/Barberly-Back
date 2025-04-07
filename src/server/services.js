import { databaseConnection } from "../utils/database";
import servicoSchema from "../models/services";

export const registerService = async (body, userId) => {
  await databaseConnection();

  const createService = await servicoSchema.create({
    barbearia_id: userId,
    name: body.name,
    description: body.description,
    price: body.price,
    duration: body.duration,
  });

  return createService;
};

export const updataService = async (body, serviceId) => {
  await databaseConnection()

  const existingService = await servicoSchema.findById({ _id: serviceId })
  if (!existingService) {
    throw new Error("Serviço não encontrado");
  }

  const updates = {};

  if (body.name && body.name !== existingService.name) {
    updates.name = body.name;
  }

  if (typeof body.price === "number" && body.price !== existingService.price) {
    updates.price = body.price;
  }

  if (body.description && body.description !== existingService.description) {
    updates.description = body.description;
  }

  const durationNumber = Number(body.duration);
  if (!isNaN(durationNumber) && durationNumber !== existingService.duration) {
    updates.duration = durationNumber;
  }

  if (Object.keys(updates).length === 0) {
    return { message: "Nenhuma alteração detectada." };
  }

  const updated = await servicoSchema.findByIdAndUpdate(
    serviceId,
    { $set: updates },
    { new: true }
  );

  return updated;
}

export const deleteService = async (userId, serviceId) => {
  await databaseConnection()

  const barbearia = await servicoSchema.find({ barbearia_id: userId })

  if (!barbearia) {
    console.log("Barbearia não encontrada");
    return { success: false, message: "Barbearia não encontrada" };
  }

  const result = await servicoSchema.findOneAndDelete({
    barbearia_id: userId,
    _id: serviceId,
  });

  if (!result) {
    console.log("Serviço não encontrado para o usuário na barbearia");
    return { success: false, message: "Serviço não encontrado" };
  }

  console.log("Serviço deletado com sucesso:", result);
  return result
}


export const getServiceByClientId = async (userId) => {
  try {
    await databaseConnection();

    const services = await servicoSchema.find({ barbearia_id: userId });

    if (!services || services.length === 0) {
      console.log("Serviços não encontrados para essa barbearia");
      return { message: "Nenhum serviço encontrado" }; // Retorne uma mensagem para o cliente
    }

    return services;
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    throw new Error("Falha ao buscar serviços");
  }
};