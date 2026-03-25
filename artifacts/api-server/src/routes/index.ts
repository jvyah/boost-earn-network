import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import tasksRouter from "./tasks.js";
import submissionsRouter from "./submissions.js";
import withdrawalsRouter from "./withdrawals.js";
import notificationsRouter from "./notifications.js";
import depositsRouter from "./deposits.js";
import adminRouter from "./admin.js";
import referralsRouter from "./referrals.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/tasks", tasksRouter);
router.use("/submissions", submissionsRouter);
router.use("/withdrawals", withdrawalsRouter);
router.use("/notifications", notificationsRouter);
router.use("/deposits", depositsRouter);
router.use("/admin", adminRouter);
router.use("/referrals", referralsRouter);

export default router;
