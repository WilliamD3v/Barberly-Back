import express from "express";
import { createReserva } from "../server/reservas";
import { getAllScheduling } from "../server/reservas";

const router = express.Router();

router.post(
  "/client/:barbeariaId/:funcionarioId/:serviceId",
  async (req, res) => {
    const barbeariaId = req.params.barbeariaId;
    const funcionarioId = req.params.funcionarioId;
    const serviceId = req.params.serviceId;
    const body = req.body;

    try {
      const results = await createReserva(
        body,
        barbeariaId,
        funcionarioId,
        serviceId
      );
      res.status(201).json({ message: "DateAgendamento", results });
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      res
        .status(500)
        .json({ message: "Erro ao criar reserva", error: error.message });
    }
  }
);

router.get("getAll/client/:barbeId/:employeeId", async (req, res) => {
  const barbeId = req.params.barbeId;
  const employeeId = req.params.employeeId;

  try {
    const results = await getAllScheduling(barbeId, employeeId);
    res.status(200).json({ message: "Todos os agendamento" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar agendamentos", error: error.message });
  }
});

export default router;
