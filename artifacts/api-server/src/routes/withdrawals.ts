import { Router } from "express";
import { db } from "@workspace/db";
import { withdrawalsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/admin", requireAdmin, async (req, res) => {
  const withdrawals = await db.select({
    id: withdrawalsTable.id,
    userId: withdrawalsTable.userId,
    amount: withdrawalsTable.amount,
    phone: withdrawalsTable.phone,
    name: withdrawalsTable.name,
    operator: withdrawalsTable.operator,
    status: withdrawalsTable.status,
    createdAt: withdrawalsTable.createdAt,
    userName: usersTable.fullName,
  })
    .from(withdrawalsTable)
    .leftJoin(usersTable, eq(withdrawalsTable.userId, usersTable.id))
    .orderBy(withdrawalsTable.createdAt);

  res.json(withdrawals.map(w => ({
    ...w,
    amount: Number(w.amount),
    createdAt: w.createdAt.toISOString(),
  })));
});

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  const withdrawals = await db.select().from(withdrawalsTable)
    .where(eq(withdrawalsTable.userId, userId))
    .orderBy(withdrawalsTable.createdAt);

  res.json(withdrawals.map(w => ({
    ...w,
    amount: Number(w.amount),
    createdAt: w.createdAt.toISOString(),
  })));
});

router.post("/", requireAuth, async (req, res) => {
  req.log.info({ body: req.body }, "Create withdrawal");
  const userId = (req as any).userId as number;
  const { amount, phone, name, operator } = req.body || {};

  if (!amount || !phone || !name || !operator) {
    res.status(400).json({ error: "Tous les champs sont requis" });
    return;
  }

  const amountNum = Number(amount);
  if (amountNum < 6000) {
    res.status(400).json({ error: "Le montant minimum de retrait est 6000 CDF" });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!users.length) {
    res.status(404).json({ error: "Utilisateur non trouvé" });
    return;
  }
  const user = users[0]!;
  if (Number(user.balance) < amountNum) {
    res.status(400).json({ error: "Solde insuffisant" });
    return;
  }

  await db.update(usersTable).set({
    balance: sql`${usersTable.balance} - ${amountNum}`,
    updatedAt: new Date(),
  }).where(eq(usersTable.id, userId));

  const [withdrawal] = await db.insert(withdrawalsTable).values({
    userId,
    amount: String(amountNum),
    phone: String(phone),
    name: String(name),
    operator: String(operator),
    status: "pending",
  }).returning();

  res.status(201).json({
    ...withdrawal,
    amount: Number(withdrawal!.amount),
    createdAt: withdrawal!.createdAt.toISOString(),
  });
});

router.post("/:withdrawalId/approve", requireAdmin, async (req, res) => {
  const id = Number(req.params["withdrawalId"]);
  const rows = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Retrait non trouvé" });
    return;
  }
  const w = rows[0]!;
  await db.update(withdrawalsTable).set({ status: "approved" }).where(eq(withdrawalsTable.id, id));
  await db.insert(notificationsTable).values({
    userId: w.userId,
    message: `Votre retrait de ${Number(w.amount)} CDF a été approuvé. Traitement sous 24-72h.`,
    type: "success",
    isRead: false,
  });
  res.json({ message: "Retrait approuvé" });
});

router.post("/:withdrawalId/reject", requireAdmin, async (req, res) => {
  const id = Number(req.params["withdrawalId"]);
  const { reason } = req.body || {};
  const rows = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Retrait non trouvé" });
    return;
  }
  const w = rows[0]!;

  await db.update(withdrawalsTable).set({ status: "rejected" }).where(eq(withdrawalsTable.id, id));
  await db.update(usersTable).set({
    balance: sql`${usersTable.balance} + ${Number(w.amount)}`,
    updatedAt: new Date(),
  }).where(eq(usersTable.id, w.userId));

  await db.insert(notificationsTable).values({
    userId: w.userId,
    message: `Votre retrait de ${Number(w.amount)} CDF a été rejeté${reason ? `. Raison : ${reason}` : ""}. Le montant a été recrédité.`,
    type: "error",
    isRead: false,
  });
  res.json({ message: "Retrait rejeté" });
});

export default router;
