import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

import router from "./controllers/user";
import routerAddress from "./controllers/address";
import routerEmployees from "./controllers/employees";
import routerServices from "./controllers/services";
import routerReserve from "./controllers/reservas";
import routerProducts from "./controllers/products";
import routerUpload from "./controllers/uploadPerfil";
import routerPayments from "./controllers/payments";
import routerWebhook from "./controllers/webhook";

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

/* ["http://localhost:3000", "https://barberly-back.vercel.app"] */

app.use(
  cors({
    origin: ["http://localhost:3000", "https://barberly.netlify.app"],
    credentials: true,
  })
);

app.use("/webhooks", express.raw({ type: "application/json" }), routerWebhook);

app.use(bodyParser.json());
app.use("/user", router);
app.use("/address", routerAddress);
app.use("/employees", routerEmployees);
app.use("/services", routerServices);
app.use("/products", routerProducts);
app.use("/reserve", routerReserve);
app.use("/upload", routerUpload);
app.use("/payment", routerPayments);

const server = app.listen(PORT, () => {
  console.log(`App rodando em http://localhost:${PORT}`);
});

// Tratar erro de porta ocupada
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Erro: Porta ${PORT} já está em uso.`);
    process.exit(1);
  }
});
