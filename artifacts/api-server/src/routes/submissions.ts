import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { submissionsTable, usersTable, tasksTable, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
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

router.get("/admin", requireAdmin, async (req, res) => {
  const subs = await db.select({
    id: submissionsTable.id,
    userId: submissionsTable.userId,
    taskId: submissionsTable.taskId,
    imageUrls: submissionsTable.imageUrls,
    status: submissionsTable.status,
    rejectionReason: submissionsTable.rejectionReason,
    createdAt: submissionsTable.createdAt,
    userName: usersTable.fullName,
    taskName: tasksTable.taskName,
    platform: tasksTable.platform,
  })
    .from(submissionsTable)
    .leftJoin(usersTable, eq(submissionsTable.userId, usersTable.id))
    .leftJoin(tasksTable, eq(submissionsTable.taskId, tasksTable.id))
    .orderBy(submissionsTable.createdAt);

  res.json(subs.map(s => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  })));
});

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  const subs = await db.select({
    id: submissionsTable.id,
    userId: submissionsTable.userId,
    taskId: submissionsTable.taskId,
    imageUrls: submissionsTable.imageUrls,
    status: submissionsTable.status,
    rejectionReason: submissionsTable.rejectionReason,
    createdAt: submissionsTable.createdAt,
    taskName: tasksTable.taskName,
    platform: tasksTable.platform,
  })
    .from(submissionsTable)
    .leftJoin(tasksTable, eq(submissionsTable.taskId, tasksTable.id))
    .where(eq(submissionsTable.userId, userId))
    .orderBy(submissionsTable.createdAt);

  res.json(subs.map(s => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  })));
});

router.post("/", requireAuth, upload.array("images", 3), async (req, res) => {
  req.log.info({ body: req.body }, "Create submission");
  const userId = (req as any).userId as number;
  const { taskId } = req.body || {};
  const files = (req as any).files as Express.Multer.File[] | undefined;

  if (!taskId) {
    res.status(400).json({ error: "taskId requis" });
    return;
  }
  if (!files || files.length === 0) {
    res.status(400).json({ error: "Au moins une capture est requise" });
    return;
  }

  const imageUrls = files.map(f => `/api/uploads/${f.filename}`);

  const [sub] = await db.insert(submissionsTable).values({
    userId,
    taskId: Number(taskId),
    imageUrls,
    status: "pending",
  }).returning();

  res.status(201).json({
    ...sub,
    createdAt: sub!.createdAt.toISOString(),
  });
});

router.post("/:submissionId/approve", requireAdmin, async (req, res) => {
  const id = Number(req.params["submissionId"]);

  const subs = await db.select().from(submissionsTable).where(eq(submissionsTable.id, id)).limit(1);
  if (!subs.length) {
    res.status(404).json({ error: "Soumission non trouvée" });
    return;
  }
  const sub = subs[0]!;
  if (sub.status !== "pending") {
    res.status(400).json({ error: "Déjà traité" });
    return;
  }

  await db.update(submissionsTable).set({ status: "approved", updatedAt: new Date() }).where(eq(submissionsTable.id, id));
  await db.update(usersTable).set({
    balance: sql`${usersTable.balance} + 200`,
    updatedAt: new Date(),
  }).where(eq(usersTable.id, sub.userId));

  await db.insert(notificationsTable).values({
    userId: sub.userId,
    message: "Félicitations ! Votre capture a été validée. +200 CDF ajoutés à votre solde.",
    type: "success",
    isRead: false,
  });

  res.json({ message: "Soumission approuvée" });
});

router.post("/:submissionId/reject", requireAdmin, async (req, res) => {
  const id = Number(req.params["submissionId"]);
  const { reason } = req.body || {};

  if (!reason) {
    res.status(400).json({ error: "La raison du rejet est obligatoire" });
    return;
  }

  const subs = await db.select().from(submissionsTable).where(eq(submissionsTable.id, id)).limit(1);
  if (!subs.length) {
    res.status(404).json({ error: "Soumission non trouvée" });
    return;
  }
  const sub = subs[0]!;

  await db.update(submissionsTable).set({
    status: "rejected",
    rejectionReason: String(reason),
    updatedAt: new Date(),
  }).where(eq(submissionsTable.id, id));

  await db.insert(notificationsTable).values({
    userId: sub.userId,
    message: `Votre soumission a été rejetée. Raison : ${reason}`,
    type: "error",
    isRead: false,
  });

  res.json({ message: "Soumission rejetée" });
});

export default router;
