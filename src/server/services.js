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
