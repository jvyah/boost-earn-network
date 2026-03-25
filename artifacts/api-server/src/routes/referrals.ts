import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/link", requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!users.length) {
    res.status(404).json({ error: "Utilisateur non trouvé" });
    return;
  }
  const user = users[0]!;

  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const referralLink = `${protocol}://${host}/register?ref=${user.referralCode}`;

  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(eq(usersTable.referredBy, userId));

  res.json({
    referralCode: user.referralCode,
    referralLink,
    totalReferrals: Number(countResult[0]?.count || 0),
  });
});

router.get("/team", requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  const team = await db.select({
    id: usersTable.id,
    fullName: usersTable.fullName,
    phone: usersTable.phone,
    balance: usersTable.balance,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.referredBy, userId)).orderBy(usersTable.createdAt);

  res.json(team.map(m => ({
    id: m.id,
    fullName: m.fullName,
    phone: m.phone,
    balance: Number(m.balance),
    createdAt: m.createdAt.toISOString(),
  })));
});

export default router;
