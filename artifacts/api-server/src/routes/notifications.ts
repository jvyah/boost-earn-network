import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  const notifs = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(notificationsTable.createdAt);

  res.json(notifs.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  })));
});

router.post("/read-all", requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, userId));
  res.json({ message: "Toutes les notifications ont été lues" });
});

export default router;
