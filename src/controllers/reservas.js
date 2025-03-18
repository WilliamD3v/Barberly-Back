import express from "express";
import { createReserva } from "../server/reservas";
import { getScheduling } from "../server/reservas";
import { getAllScheduling } from "../server/reservas";
import { updataStatusScheduling } from "../server/reservas";
import { deleteAllReserverForDay } from "../server/reservas";

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

router.get("/getAll/:barbeId", async (req, res) => {
  const barbeId = req.params.barbeId;

  try {
    const results = await getAllScheduling(barbeId);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.get("/getAll/client/:barbeId/:employeeId", async (req, res) => {
  const barbeId = req.params.barbeId;
  const employeeId = req.params.employeeId;

  try {
    const results = await getScheduling(barbeId, employeeId);
    res.status(200).json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar agendamentos", error: error.message });
  }
});

router.put("/updata/status/scheduling/:barberId/:employeeId/:schedulingId", async (req, res) => {
  const body = req.body
  const barbeId = req.params.barberId
  const employeeId = req.params.employeeId
  const schedulingId = req.params.schedulingId
  const statusScheduling = body.statusScheduling

  try {
    const results = await updataStatusScheduling(barbeId, employeeId, schedulingId, statusScheduling)
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ message: error})
  }
})

router.get("/delete/allReserva-day", async (req, res) => {
  try {
    const results = await deleteAllReserverForDay()
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ message: error})
  }
})

export default router;
