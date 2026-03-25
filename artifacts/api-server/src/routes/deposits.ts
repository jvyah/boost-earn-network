import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { depositsTable, tasksTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `deposit-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Images only"));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  const deposits = await db.select({
    id: depositsTable.id,
    userId: depositsTable.userId,
    link: depositsTable.link,
    platform: depositsTable.platform,
    taskType: depositsTable.taskType,
    durationDays: depositsTable.durationDays,
    paymentProofUrl: depositsTable.paymentProofUrl,
    status: depositsTable.status,
    createdAt: depositsTable.createdAt,
    userName: usersTable.fullName,
  })
    .from(depositsTable)
    .leftJoin(usersTable, eq(depositsTable.userId, usersTable.id))
    .orderBy(depositsTable.createdAt);

  res.json(deposits.map(d => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
  })));
});

router.post("/", requireAuth, upload.single("paymentProof"), async (req, res) => {
  req.log.info({ body: req.body }, "Create deposit");
  const userId = (req as any).userId as number;
  const { link, platform, taskType, durationDays } = req.body || {};
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!link || !platform || !taskType || !durationDays) {
    res.status(400).json({ error: "Tous les champs sont requis" });
    return;
  }
  if (!file) {
    res.status(400).json({ error: "Preuve de paiement requise" });
    return;
  }

  const paymentProofUrl = `/api/uploads/${file.filename}`;

  const [deposit] = await db.insert(depositsTable).values({
    userId,
    link: String(link),
    platform: String(platform).toLowerCase(),
    taskType: String(taskType),
    durationDays: Number(durationDays),
    paymentProofUrl,
    status: "pending",
  }).returning();

  res.status(201).json({
    ...deposit,
    createdAt: deposit!.createdAt.toISOString(),
  });
});

router.post("/:depositId/approve", requireAdmin, async (req, res) => {
  const id = Number(req.params["depositId"]);
  const { taskName, durationDays } = req.body || {};

  if (!taskName || !durationDays) {
    res.status(400).json({ error: "taskName et durationDays requis" });
    return;
  }

  const deposits = await db.select().from(depositsTable).where(eq(depositsTable.id, id)).limit(1);
  if (!deposits.length) {
    res.status(404).json({ error: "Dépôt non trouvé" });
    return;
  }
  const deposit = deposits[0]!;

  await db.update(depositsTable).set({ status: "approved" }).where(eq(depositsTable.id, id));

  const days = Number(durationDays);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  await db.insert(tasksTable).values({
    link: deposit.link,
    platform: deposit.platform,
    taskName: String(taskName),
    durationDays: days,
    expiresAt,
    isActive: true,
  });

  res.json({ message: "Dépôt approuvé et tâche publiée" });
});

export default router;
