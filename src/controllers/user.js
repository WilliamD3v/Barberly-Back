import express from "express";
import { register } from '../server/user'
import { login } from '../server/user'
import { verifica } from '../server/user'
import { getUserById } from '../server/user'

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const results = await register(req.body);
    console.log(req.body)
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json(error.message);
  }
})

router.post("/login", async (req, res) => {
  try {
    const results = await login(req.body);
    console.log(req.body)
    res.status(200).json({ message: "Login bem-sucedido", token: results.token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/users", (req, res) => {
  try {
    const authHeader = req.headers['authorization'].split(' ')[1];

    if (!authHeader) {
      return res.status(401).json({ error: "Cookie não encontrado" });
    }

    if (!authHeader) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const decodedData = verifica(authHeader);
    res.json({ data: decodedData });
  } catch (error) {
    console.error("Erro interno do servidor:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId
  try {
    const results = await getUserById(userId);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;