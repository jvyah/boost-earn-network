import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable, submissionsTable } from "@workspace/db";
import { eq, and, gt, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/platform-counts", requireAuth, async (req, res) => {
  const now = new Date();
  const tasks = await db.select({
    platform: tasksTable.platform,
  }).from(tasksTable).where(and(eq(tasksTable.isActive, true), gt(tasksTable.expiresAt, now)));

  const counts = { tiktok: 0, facebook: 0, youtube: 0, instagram: 0 };
  for (const task of tasks) {
    const p = task.platform.toLowerCase() as keyof typeof counts;
    if (p in counts) counts[p]++;
  }
  res.json(counts);
});

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  const now = new Date();
  const platform = req.query["platform"] as string | undefined;

  let conditions = and(eq(tasksTable.isActive, true), gt(tasksTable.expiresAt, now));
  if (platform) {
    conditions = and(conditions, eq(tasksTable.platform, platform.toLowerCase()));
  }

  const allTasks = await db.select().from(tasksTable).where(conditions).orderBy(tasksTable.createdAt);
  
  // Filter out tasks already submitted by this user
  const submittedTaskIds = (await db.select({ taskId: submissionsTable.taskId })
    .from(submissionsTable)
    .where(eq(submissionsTable.userId, userId)))
    .map(s => s.taskId);

  const tasks = allTasks.filter(t => !submittedTaskIds.includes(t.id));

  res.json(tasks.map(t => ({
    id: t.id,
    link: t.link,
    platform: t.platform,
    taskName: t.taskName,
    durationDays: t.durationDays,
    expiresAt: t.expiresAt.toISOString(),
    isActive: t.isActive,
    createdAt: t.createdAt.toISOString(),
  })));
});

router.get("/:taskId", requireAuth, async (req, res) => {
  const id = Number(req.params["taskId"]);
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.id, id)).limit(1);
  if (!tasks.length) {
    res.status(404).json({ error: "Tâche non trouvée" });
    return;
  }
  const t = tasks[0]!;
  res.json({
    id: t.id, link: t.link, platform: t.platform, taskName: t.taskName,
    durationDays: t.durationDays, expiresAt: t.expiresAt.toISOString(),
    isActive: t.isActive, createdAt: t.createdAt.toISOString(),
  });
});

router.post("/", requireAdmin, async (req, res) => {
  req.log.info({ body: req.body }, "Create task");
  const { link, platform, taskName, durationDays } = req.body || {};
  if (!link || !platform || !taskName || !durationDays) {
    res.status(400).json({ error: "Tous les champs sont requis" });
    return;
  }
  const days = Number(durationDays);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const [task] = await db.insert(tasksTable).values({
    link: String(link),
    platform: String(platform).toLowerCase(),
    taskName: String(taskName),
    durationDays: days,
    expiresAt,
    isActive: true,
  }).returning();

  res.status(201).json({
    id: task!.id, link: task!.link, platform: task!.platform, taskName: task!.taskName,
    durationDays: task!.durationDays, expiresAt: task!.expiresAt.toISOString(),
    isActive: task!.isActive, createdAt: task!.createdAt.toISOString(),
  });
});

router.put("/:taskId", requireAdmin, async (req, res) => {
  const id = Number(req.params["taskId"]);
  const { link, platform, taskName, durationDays, isActive } = req.body || {};

  const updates: Record<string, any> = {};
  if (link !== undefined) updates["link"] = String(link);
  if (platform !== undefined) updates["platform"] = String(platform).toLowerCase();
  if (taskName !== undefined) updates["taskName"] = String(taskName);
  if (durationDays !== undefined) {
    updates["durationDays"] = Number(durationDays);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(durationDays));
    updates["expiresAt"] = expiresAt;
  }
  if (isActive !== undefined) updates["isActive"] = Boolean(isActive);

  const [task] = await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id)).returning();
  if (!task) {
    res.status(404).json({ error: "Tâche non trouvée" });
    return;
  }
  res.json({
    id: task.id, link: task.link, platform: task.platform, taskName: task.taskName,
    durationDays: task.durationDays, expiresAt: task.expiresAt.toISOString(),
    isActive: task.isActive, createdAt: task.createdAt.toISOString(),
  });
});

router.delete("/:taskId", requireAdmin, async (req, res) => {
  const id = Number(req.params["taskId"]);
  await db.delete(tasksTable).where(eq(tasksTable.id, id));
  res.json({ message: "Tâche supprimée" });
});

export default router;
