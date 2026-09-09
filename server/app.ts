import express from "express";
import compression from "compression";
import dotenv from "dotenv";
import {
  getMongoStatus,
  migrateFullDatabaseToMongo,
  exportFullDatabaseFromMongo,
  getTargetDatabaseName,
  updateMongoConfig,
  getProjectsFromMongo,
  saveProjectsToMongo,
  saveSingleProjectToMongo,
} from "./mongodb";

dotenv.config();

export const app = express();

// Security: Disable X-Powered-By header to prevent fingerprinting
app.disable("x-powered-by");

// Performance: Enable GZIP/Deflate response compression
app.use(
  compression({
    level: 6,
    threshold: 1024, // only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Security: Apply Enterprise HTTP Security Headers
app.use((req, res, next) => {
  // Prevent MIME-sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Cross-Site Scripting protection for older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Limit referrer data leakage
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Enforce payload size limits for database backups & migration
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    model: "gemini-3.1-flash-live-preview",
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    mongoConfigured: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// MONGODB DATABASE LINKING & MIGRATION APIS
// ==========================================

// 1. Get MongoDB Connection Status & Collection Stats
app.get("/api/mongodb/status", async (req, res) => {
  try {
    const status = await getMongoStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({
      configured: !!process.env.MONGODB_URI,
      connected: false,
      databaseName: getTargetDatabaseName(),
      collectionsCount: 0,
      collections: {},
      error: err?.message || "Failed to retrieve MongoDB status",
    });
  }
});

// 2. Test Connection Ping
app.post("/api/mongodb/test", async (req, res) => {
  try {
    const status = await getMongoStatus();
    if (status.error) {
      res.status(400).json({ success: false, error: status.error, status });
    } else {
      res.json({
        success: true,
        pingMs: status.pingMs,
        databaseName: status.databaseName,
        mode: status.mode,
        message: status.message,
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "MongoDB ping test failed" });
  }
});

// 3. Migrate All Collections from Firebase / Active DB into MongoDB
app.post("/api/mongodb/migrate", async (req, res) => {
  try {
    const payload = req.body?.payload || req.body;
    if (!payload || typeof payload !== "object") {
      res.status(400).json({ success: false, error: "Invalid migration payload provided" });
      return;
    }

    const result = await migrateFullDatabaseToMongo(payload);
    res.json(result);
  } catch (err: any) {
    console.error("Migration error:", err);
    res.status(500).json({ success: false, error: err?.message || "Migration to MongoDB failed" });
  }
});

// 4. Export / Restore All Collections from MongoDB
app.get("/api/mongodb/export", async (req, res) => {
  try {
    const result = await exportFullDatabaseFromMongo();
    res.json(result);
  } catch (err: any) {
    console.error("Export error:", err);
    res.status(500).json({ success: false, error: err?.message || "Export from MongoDB failed" });
  }
});

// 5. Restore Database Endpoint
app.post("/api/mongodb/restore", async (req, res) => {
  try {
    const result = await exportFullDatabaseFromMongo();
    res.json(result);
  } catch (err: any) {
    console.error("Restore error:", err);
    res.status(500).json({ success: false, error: err?.message || "Restore from MongoDB failed" });
  }
});

// 6. Update MongoDB Configuration
app.post("/api/mongodb/config", async (req, res) => {
  try {
    const { uri, databaseName } = req.body;
    if (!uri) {
      res.status(400).json({ success: false, error: "MongoDB connection URI is required" });
      return;
    }
    const updateRes = updateMongoConfig(uri, databaseName);
    if (!updateRes.success) {
      res.status(400).json(updateRes);
      return;
    }
    const status = await getMongoStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to update MongoDB config" });
  }
});

// 7. Get Projects Directly from MongoDB
app.get("/api/mongodb/projects", async (req, res) => {
  try {
    const result = await getProjectsFromMongo();
    res.json(result);
  } catch (err: any) {
    console.error("Failed to get projects from MongoDB:", err);
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch projects" });
  }
});

// 8. Save / Persist Projects Array to MongoDB
app.post("/api/mongodb/projects", async (req, res) => {
  try {
    const { projects } = req.body;
    if (!Array.isArray(projects)) {
      res.status(400).json({ success: false, error: "Projects array is required in request body" });
      return;
    }
    const result = await saveProjectsToMongo(projects);
    res.json(result);
  } catch (err: any) {
    console.error("Failed to save projects to MongoDB:", err);
    res.status(500).json({ success: false, error: err?.message || "Failed to save projects to MongoDB" });
  }
});

// 9. Save / Upsert Single Project in MongoDB
app.post("/api/mongodb/project", async (req, res) => {
  try {
    const { project } = req.body;
    if (!project || typeof project !== "object") {
      res.status(400).json({ success: false, error: "Project object is required" });
      return;
    }
    const result = await saveSingleProjectToMongo(project);
    res.json(result);
  } catch (err: any) {
    console.error("Failed to upsert project to MongoDB:", err);
    res.status(500).json({ success: false, error: err?.message || "Failed to update project in MongoDB" });
  }
});

export default app;
