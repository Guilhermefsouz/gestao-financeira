import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter         from "./routes/auth.js";
import categoriesRouter   from "./routes/categories.js";
import transactionsRouter from "./routes/transactions.js";
import { errorHandler }   from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health-check
app.get("/", (req, res) => res.json({ ok: true, name: "gestao-financeira-api" }));

// Rotas públicas
app.use("/auth", authRouter);

// Rotas protegidas (autenticação via middleware interno de cada router)
app.use("/categories",   categoriesRouter);
app.use("/transactions", transactionsRouter);

app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
