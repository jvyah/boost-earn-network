import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth.js";

const router = Router();

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.post("/register", async (req, res) => {
  req.log.info({ body: req.body }, "Register attempt");
  const { fullName, phone, password, referralCode } = req.body || {};

  if (!fullName || !phone || !password) {
    res.status(400).json({ error: "fullName, phone et password sont requis" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.phone, String(phone))).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Ce numéro est déjà enregistré" });
    return;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  let myCode = generateReferralCode();
  while (true) {
    const exists = await db.select().from(usersTable).where(eq(usersTable.referralCode, myCode)).limit(1);
    if (exists.length === 0) break;
    myCode = generateReferralCode();
  }

  let referredById: number | null = null;
  if (referralCode) {
    const referrer = await db.select().from(usersTable).where(eq(usersTable.referralCode, String(referralCode))).limit(1);
    if (referrer.length > 0) {
      referredById = referrer[0]!.id;
    }
  }

  const [user] = await db.insert(usersTable).values({
    fullName: String(fullName),
    phone: String(phone),
    passwordHash,
    referralCode: myCode,
    referredBy: referredById,
    isAdmin: false,
    isSuspended: false,
  }).returning();

  if (!user) {
    res.status(500).json({ error: "Erreur lors de la création du compte" });
    return;
  }

  const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      balance: Number(user.balance),
      referralCode: user.referralCode,
      isAdmin: user.isAdmin,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.post("/login", async (req, res) => {
  req.log.info({ body: { phone: req.body?.phone } }, "Login attempt");
  const { phone, password } = req.body || {};

  if (!phone || !password) {
    res.status(400).json({ error: "Numéro et mot de passe requis" });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.phone, String(phone))).limit(1);
  if (users.length === 0) {
    res.status(401).json({ error: "Numéro ou mot de passe incorrect" });
    return;
  }

  const user = users[0]!;
  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Numéro ou mot de passe incorrect" });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: "Votre compte est suspendu" });
    return;
  }

  const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      balance: Number(user.balance),
      referralCode: user.referralCode,
      isAdmin: user.isAdmin,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (users.length === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const user = users[0]!;
  res.json({
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    balance: Number(user.balance),
    referralCode: user.referralCode,
    isAdmin: user.isAdmin,
    isSuspended: user.isSuspended,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
