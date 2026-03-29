import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/api/uploads", express.static(uploadsDir));

app.use("/api", router);

// Initialize welcome task on startup
(async () => {
  try {
    const { db } = await import("@workspace/db");
    const { tasksTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");

    const existing = await db.select().from(tasksTable).where(eq(tasksTable.taskName, "Suivre notre page officielle")).limit(1);
    
    if (!existing.length) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 365);
      
      await db.insert(tasksTable).values({
        link: "https://www.facebook.com/share/1ByZtVkaL8/",
        platform: "facebook",
        taskName: "Suivre notre page officielle",
        durationDays: 365,
        expiresAt,
        isActive: true,
      });
      
      logger.info("Welcome task created successfully");
    }
  } catch (err) {
    logger.error({ err }, "Failed to initialize welcome task");
  }
})();

export default app;
