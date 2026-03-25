import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/users", requireAdmin, async (req, res) => {
  const users = await db.select({
    id: usersTable.id,
    fullName: usersTable.fullName,
    phone: usersTable.phone,
    balance: usersTable.balance,
    referralCode: usersTable.referralCode,
    isAdmin: usersTable.isAdmin,
    isSuspended: usersTable.isSuspended,
    referredBy: usersTable.referredBy,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.createdAt);

  const teamCounts = await db.select({
    referredBy: usersTable.referredBy,
    count: sql<number>`count(*)`,
  }).from(usersTable).groupBy(usersTable.referredBy);

  const countMap: Record<number, number> = {};
  for (const row of teamCounts) {
    if (row.referredBy) countMap[row.referredBy] = Number(row.count);
  }

  res.json(users.map(u => ({
    id: u.id,
    fullName: u.fullName,
    phone: u.phone,
    balance: Number(u.balance),
    referralCode: u.referralCode,
    isAdmin: u.isAdmin,
    isSuspended: u.isSuspended,
    teamCount: countMap[u.id] || 0,
    createdAt: u.createdAt.toISOString(),
  })));
});

router.post("/users/:userId/balance", requireAdmin, async (req, res) => {
  req.log.info({ body: req.body }, "Adjust user balance");
  const userId = Number(req.params["userId"]);
  const { amount, operation } = req.body || {};

  if (!amount || !operation) {
    res.status(400).json({ error: "amount et operation requis" });
    return;
  }

  const amountNum = Number(amount);
  if (operation === "add") {
    await db.update(usersTable).set({
      balance: sql`${usersTable.balance} + ${amountNum}`,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));
  } else if (operation === "subtract") {
    await db.update(usersTable).set({
      balance: sql`GREATEST(${usersTable.balance} - ${amountNum}, 0)`,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));
  } else {
    res.status(400).json({ error: "operation doit être 'add' ou 'subtract'" });
    return;
  }

  res.json({ message: "Solde mis à jour" });
});

router.post("/users/:userId/suspend", requireAdmin, async (req, res) => {
  const userId = Number(req.params["userId"]);
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!users.length) {
    res.status(404).json({ error: "Utilisateur non trouvé" });
    return;
  }
  const user = users[0]!;
  await db.update(usersTable).set({
    isSuspended: !user.isSuspended,
    updatedAt: new Date(),
  }).where(eq(usersTable.id, userId));
  res.json({ message: user.isSuspended ? "Suspension levée" : "Compte suspendu" });
});

router.post("/users/:userId/reset-password", requireAdmin, async (req, res) => {
  req.log.info({ userId: req.params["userId"] }, "Reset password");
  const userId = Number(req.params["userId"]);
  const { newPassword } = req.body || {};
  if (!newPassword) {
    res.status(400).json({ error: "newPassword requis" });
    return;
  }
  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  await db.update(usersTable).set({ passwordHash, updatedAt: new Date() }).where(eq(usersTable.id, userId));
  res.json({ message: "Mot de passe réinitialisé" });
});

export default router;
