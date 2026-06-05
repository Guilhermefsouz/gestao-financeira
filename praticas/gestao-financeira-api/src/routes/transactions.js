import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../schemas/transactionSchema.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

// Todas as rotas de transação exigem autenticação
router.use(authenticate);

/**
 * GET /transactions?month=6&year=2026
 * Lista transações do usuário autenticado, com filtro opcional de mês/ano.
 */
router.get("/", async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const where = { userId: req.userId };

    if (month && year) {
      const m   = parseInt(month, 10);
      const y   = parseInt(year,  10);
      const from = new Date(y, m - 1, 1);
      const to   = new Date(y, m, 1);
      where.date = { gte: from, lt: to };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include:  { category: true },
      orderBy:  { date: "desc" },
    });
    res.json(transactions);
  } catch (e) { next(e); }
});

// POST /transactions — cria uma nova transação para o usuário logado
router.post("/", async (req, res, next) => {
  try {
    const data = createTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.create({
      data:    { ...data, userId: req.userId },
      include: { category: true },
    });
    res.status(201).json(transaction);
  } catch (e) { next(e); }
});

// PUT /transactions/:id — atualiza (apenas do próprio usuário)
router.put("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.transaction.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }
    const data = updateTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.update({
      where:   { id: req.params.id },
      data,
      include: { category: true },
    });
    res.json(transaction);
  } catch (e) { next(e); }
});

// DELETE /transactions/:id — exclui (apenas do próprio usuário)
router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.transaction.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
