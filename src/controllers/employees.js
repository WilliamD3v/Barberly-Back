import express from "express";
import { registerEmployees } from "../server/employees";
import { getEmployees } from "../server/employees";
import { getEmployeeById } from "../server/employees";
import { deleteEmployees } from "../server/employees";
import { updateEmployee } from "../server/employees";

const router = express.Router();

router.post("/register/:userId", async (req, res) => {
  const userId = req.params.userId;
  const body = req.body;

  try {
    const results = await registerEmployees(body, userId);
    res.status(201).json(results);
  } catch (error) {
    res.status(500);
  }
});

router.get("/all-data-employees/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const results = await getEmployees(userId);
    res.status(201).json(results);
  } catch (error) {
    res.status(500);
  }
});

router.get("/data-employees/:userId/:employeesId", async (req, res) => {
  const userId = req.params.userId;
  const employeesId = req.params.employeesId;

  try {
    const results = await getEmployeeById(userId, employeesId);
    res.status(201).json(results);
  } catch (error) {
    res.status(500);
  }
});

router.put("/updata/:userId/:employeesId", async (req, res) => {
  const userId = req.params.userId;
  const employeesId = req.params.employeesId;
  const body = req.body;

  try {
    const results = await updataEmplouees(body, userId, employeesId);
    res.status(201).json(results);
  } catch (error) {
    res.status(500);
  }
});

/* updateEmployee */

router.put("/update-employees/:employeesId", async (req, res) => {
  const body = req.body;
  const employeeId = req.params.employeesId;

  console.log(body)

  try {
    const results = await updateEmployee(employeeId, body);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:userId/:employeesId", async (req, res) => {
  const userId = req.params.userId;
  const employeesId = req.params.employeesId;

  try {
    const results = await deleteEmployees(userId, employeesId);
    res.status(201).json(results);
  } catch (error) {
    res.status(500);
  }
});
export default router;
