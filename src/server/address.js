import { databaseConnection } from "../utils/database";
import addressSchema from "../models/address";

export const createAddress = async (body, barberId) => {
  await databaseConnection();

  const barber = await addressSchema.create({
    barbearia_id: barberId,
    street: body.street,
    number: body.number,
    neighborhood: body.neighborhood,
    city: body.city,
    zipcode: body.zipcode,
  });

  return barber;
};

export const getAddress = async (barberId) => {
  await databaseConnection();

  const barber = await addressSchema.find({ barbearia_id: barberId });

  if (!barber) {
    throw new Error("Endereço de barbearia nao encontrado!")
  }

  return barber;
};
