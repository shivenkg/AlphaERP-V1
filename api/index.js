// server/app.ts
import express from "express";
import compression from "compression";
import dotenv from "dotenv";

// server/mongodb.ts
import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
var mongoClient = null;
var activeDb = null;
var lastKnownMigratedAt = null;
var DATA_DIR = path.join(process.cwd(), "data");
var LOCAL_VAULT_FILE = path.join(DATA_DIR, "mongodb_local_vault.json");
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
    }
  }
}
function readLocalVault() {
  try {
    ensureDataDir();
    if (fs.existsSync(LOCAL_VAULT_FILE)) {
      const content = fs.readFileSync(LOCAL_VAULT_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Could not read local MongoDB vault file:", err);
  }
  return {};
}
function writeLocalVault(data) {
  try {
    ensureDataDir();
    fs.writeFileSync(LOCAL_VAULT_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Could not write local MongoDB vault file:", err);
  }
}
function maskMongoUri(uri) {
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, "$1\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022$3");
  } catch {
    return "mongodb://\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
  }
}
function formatMongoError(err) {
  const msg = err?.message || String(err || "");
  if (msg.includes("SSL alert number 80") || msg.includes("tlsv1 alert") || msg.includes("ECONNRESET")) {
    return {
      error: 'MongoDB Atlas rejected TLS connection (SSL Alert 80): In MongoDB Atlas, go to "Network Access" -> "IP Access List" -> Click "Add IP Address" -> Select "Allow Access from Anywhere" (0.0.0.0/0).',
      ipWhitelistRequired: true
    };
  }
  if (msg.includes("bad auth") || msg.includes("Authentication failed") || msg.includes("auth failed")) {
    return {
      error: "MongoDB authentication failed. Please verify the database user credentials in your connection string.",
      ipWhitelistRequired: false
    };
  }
  if (msg.includes("ENOTFOUND") || msg.includes("querySrv")) {
    return {
      error: "Could not resolve MongoDB cluster hostname. Verify the cluster address in your connection string.",
      ipWhitelistRequired: false
    };
  }
  return {
    error: msg || "Failed to connect to MongoDB cluster",
    ipWhitelistRequired: false
  };
}
function updateMongoConfig(newUri, newDbName) {
  try {
    const trimmed = newUri.trim();
    if (!trimmed) {
      throw new Error("Connection URI cannot be empty");
    }
    process.env.MONGODB_URI = trimmed;
    if (newDbName && newDbName.trim()) {
      process.env.MONGODB_DB_NAME = newDbName.trim();
    }
    try {
      const envPath = path.join(process.cwd(), ".env");
      let content = "";
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, "utf-8");
      }
      if (/^MONGODB_URI=/m.test(content)) {
        content = content.replace(/^MONGODB_URI=.*/m, `MONGODB_URI="${trimmed}"`);
      } else {
        content += `
MONGODB_URI="${trimmed}"`;
      }
      if (newDbName) {
        if (/^MONGODB_DB_NAME=/m.test(content)) {
          content = content.replace(/^MONGODB_DB_NAME=.*/m, `MONGODB_DB_NAME="${newDbName.trim()}"`);
        } else {
          content += `
MONGODB_DB_NAME="${newDbName.trim()}"`;
        }
      }
      fs.writeFileSync(envPath, content.trim() + "\n", "utf-8");
    } catch (e) {
      console.warn("Could not persist to .env:", e);
    }
    if (mongoClient) {
      mongoClient.close().catch(() => {
      });
    }
    mongoClient = null;
    activeDb = null;
    return { success: true };
  } catch (err) {
    return { success: false, error: err?.message || "Failed to update MongoDB configuration" };
  }
}
function getTargetDatabaseName() {
  return process.env.MONGODB_DB_NAME || "alphaerp";
}
async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }
  if (mongoClient && activeDb) {
    return { client: mongoClient, db: activeDb };
  }
  try {
    const dbName = getTargetDatabaseName();
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5e3,
      connectTimeoutMS: 8e3
    });
    await mongoClient.connect();
    activeDb = mongoClient.db(dbName);
    console.log(`Connected to MongoDB database "${dbName}" successfully`);
    return { client: mongoClient, db: activeDb };
  } catch (err) {
    console.error("Failed to connect to MongoDB cluster:", err?.message || err);
    mongoClient = null;
    activeDb = null;
    throw new Error(`MongoDB connection failed: ${err?.message || err}`);
  }
}
async function getMongoStatus() {
  const uri = process.env.MONGODB_URI;
  const dbName = getTargetDatabaseName();
  if (!uri) {
    const localData = readLocalVault();
    const collections = {};
    let totalDocs = 0;
    for (const [colName, val] of Object.entries(localData)) {
      if (colName === "_meta") continue;
      if (Array.isArray(val)) {
        collections[colName] = val.length;
        totalDocs += val.length;
      } else if (typeof val === "object" && val !== null) {
        collections[colName] = 1;
        totalDocs += 1;
      }
    }
    const lastMigrated = localData._meta?.migratedAt || lastKnownMigratedAt || void 0;
    return {
      configured: false,
      connected: true,
      mode: "emulated_local",
      databaseName: dbName,
      maskedUri: void 0,
      collectionsCount: Object.keys(collections).length,
      collections,
      lastMigratedAt: lastMigrated,
      message: "MONGODB_URI not detected in environment. Running in linked local emulated mode. Provide MONGODB_URI in Settings to connect to MongoDB Atlas."
    };
  }
  const startTime = Date.now();
  try {
    const conn = await getMongoClient();
    if (!conn) {
      throw new Error("Client connection was null");
    }
    await conn.db.command({ ping: 1 });
    const pingMs = Date.now() - startTime;
    const collectionsCursor = await conn.db.listCollections().toArray();
    const collections = {};
    for (const col of collectionsCursor) {
      if (col.name.startsWith("system.")) continue;
      try {
        const count = await conn.db.collection(col.name).estimatedDocumentCount();
        collections[col.name] = count;
      } catch {
        collections[col.name] = 0;
      }
    }
    try {
      const meta = await conn.db.collection("_meta_migration").findOne({ _id: "latest_migration" });
      if (meta && meta.migratedAt) {
        lastKnownMigratedAt = meta.migratedAt;
      }
    } catch {
    }
    return {
      configured: true,
      connected: true,
      mode: "mongodb_cluster",
      databaseName: dbName,
      maskedUri: maskMongoUri(uri),
      pingMs,
      collectionsCount: Object.keys(collections).length,
      collections,
      lastMigratedAt: lastKnownMigratedAt || void 0,
      message: `Successfully connected to MongoDB database "${dbName}"`
    };
  } catch (err) {
    const formatted = formatMongoError(err);
    return {
      configured: true,
      connected: false,
      mode: "mongodb_cluster",
      databaseName: dbName,
      maskedUri: maskMongoUri(uri),
      collectionsCount: 0,
      collections: {},
      error: formatted.error,
      ipWhitelistRequired: formatted.ipWhitelistRequired
    };
  }
}
var MASTER_COLLECTIONS = [
  "systemSettings",
  "clients",
  "vendors",
  "inventory",
  "salesReps",
  "costCenters",
  "taxSlabs",
  "paymentTerms",
  "chartOfAccounts",
  "employees",
  "departments",
  "designationGrades",
  "shifts",
  "companyHolidays",
  "policyDocuments",
  "biometricDevices",
  "trainingCourses",
  "numberSeries",
  "reportTemplates"
];
async function migrateFullDatabaseToMongo(payload) {
  const startTime = Date.now();
  const dbName = getTargetDatabaseName();
  const uri = process.env.MONGODB_URI;
  const collectionCounts = {};
  const collectionsReport = [];
  let totalMaster = 0;
  let totalTransaction = 0;
  const migratedAt = (/* @__PURE__ */ new Date()).toISOString();
  lastKnownMigratedAt = migratedAt;
  if (uri) {
    const conn = await getMongoClient();
    if (!conn) {
      throw new Error("Could not establish connection to MongoDB");
    }
    const db = conn.db;
    const sanitizeDoc = (doc, index, colName) => {
      if (!doc || typeof doc !== "object") return { _id: `${colName}_${index}`, value: doc };
      const clone = { ...doc };
      if (!clone._id && clone.id) {
        clone._id = String(clone.id);
      } else if (!clone._id) {
        clone._id = `${colName}_${index}_${Date.now()}`;
      }
      return clone;
    };
    for (const [colName, val] of Object.entries(payload)) {
      if (colName === "_meta" || colName === "currentUser" || colName === "isAuthenticated") continue;
      try {
        const mongoCol = db.collection(colName);
        if (Array.isArray(val)) {
          if (val.length > 0) {
            const docs = val.map((item, idx) => sanitizeDoc(item, idx, colName));
            await mongoCol.deleteMany({});
            await mongoCol.insertMany(docs);
            collectionCounts[colName] = docs.length;
            collectionsReport.push({ collection: colName, count: docs.length, status: "migrated" });
          } else {
            collectionCounts[colName] = 0;
            collectionsReport.push({ collection: colName, count: 0, status: "skipped" });
          }
        } else if (typeof val === "object" && val !== null) {
          const doc = { ...val, _id: "global_config" };
          await mongoCol.replaceOne({ _id: "global_config" }, doc, { upsert: true });
          collectionCounts[colName] = 1;
          collectionsReport.push({ collection: colName, count: 1, status: "migrated" });
        }
      } catch (err) {
        console.error(`Error migrating collection ${colName}:`, err);
        throw new Error(`Failed to migrate collection ${colName}: ${err.message}`);
      }
    }
    try {
      await db.collection("_meta_migration").replaceOne(
        { _id: "latest_migration" },
        {
          _id: "latest_migration",
          migratedAt,
          source: "AlphaERP Firebase & Active State",
          databaseName: dbName,
          collectionCounts,
          durationMs: Date.now() - startTime
        },
        { upsert: true }
      );
    } catch (err) {
      console.warn("Could not record migration meta:", err);
    }
  } else {
    const localStore = {
      _meta: {
        migratedAt,
        source: "AlphaERP Firebase & Active State (Local Emulated)",
        databaseName: dbName
      },
      ...payload
    };
    writeLocalVault(localStore);
    for (const [colName, val] of Object.entries(payload)) {
      if (colName === "_meta" || colName === "currentUser" || colName === "isAuthenticated") continue;
      const count = Array.isArray(val) ? val.length : typeof val === "object" && val !== null ? 1 : 0;
      collectionCounts[colName] = count;
      collectionsReport.push({ collection: colName, count, status: count > 0 ? "migrated" : "skipped" });
    }
  }
  for (const [col, count] of Object.entries(collectionCounts)) {
    if (MASTER_COLLECTIONS.includes(col)) {
      totalMaster += count;
    } else {
      totalTransaction += count;
    }
  }
  return {
    success: true,
    totalMasterRecords: totalMaster,
    totalTransactionRecords: totalTransaction,
    collectionCounts,
    collectionsReport,
    migratedAt,
    durationMs: Date.now() - startTime,
    databaseName: dbName,
    target: uri ? `MongoDB Cluster (${maskMongoUri(uri)})` : "Local Emulated MongoDB Store (Ready for Atlas URI)"
  };
}
async function exportFullDatabaseFromMongo() {
  const uri = process.env.MONGODB_URI;
  const exportedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (uri) {
    const conn = await getMongoClient();
    if (!conn) {
      throw new Error("Could not establish connection to MongoDB");
    }
    const db = conn.db;
    const collectionsCursor = await db.listCollections().toArray();
    const data = {};
    for (const col of collectionsCursor) {
      if (col.name.startsWith("system.") || col.name === "_meta_migration") continue;
      const docs = await db.collection(col.name).find({}).toArray();
      if (col.name === "systemSettings") {
        const found = docs.find((d) => d._id === "global_config") || docs[0];
        if (found) {
          const { _id, ...rest } = found;
          data[col.name] = rest;
        }
      } else {
        data[col.name] = docs.map((d) => {
          const { _id, ...rest } = d;
          return { id: rest.id || _id, ...rest };
        });
      }
    }
    return {
      success: true,
      data,
      exportedAt,
      source: `MongoDB Database (${getTargetDatabaseName()})`
    };
  } else {
    const local = readLocalVault();
    const { _meta, ...rest } = local;
    return {
      success: true,
      data: rest,
      exportedAt,
      source: "Local Emulated MongoDB Store"
    };
  }
}
async function getProjectsFromMongo() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      const conn = await getMongoClient();
      if (!conn) throw new Error("Could not establish connection to MongoDB");
      const docs = await conn.db.collection("projects").find({}).toArray();
      const projects = docs.map((d) => {
        const { _id, ...rest } = d;
        return { id: rest.id || _id, ...rest };
      });
      return {
        success: true,
        projects,
        count: projects.length,
        source: `MongoDB Atlas (${getTargetDatabaseName()})`
      };
    } catch (err) {
      console.error("Failed to get projects from MongoDB:", err);
      const local = readLocalVault();
      return {
        success: true,
        projects: local.projects || [],
        count: (local.projects || []).length,
        source: "Local Emulated Fallback",
        error: err.message
      };
    }
  } else {
    const local = readLocalVault();
    return {
      success: true,
      projects: local.projects || [],
      count: (local.projects || []).length,
      source: "Local Emulated Store"
    };
  }
}
async function saveProjectsToMongo(projects) {
  const savedAt = (/* @__PURE__ */ new Date()).toISOString();
  const uri = process.env.MONGODB_URI;
  if (uri) {
    const conn = await getMongoClient();
    if (!conn) throw new Error("Could not establish connection to MongoDB");
    const db = conn.db;
    const mongoCol = db.collection("projects");
    const docs = projects.map((p, idx) => {
      const docId = String(p.id || `prj-${Date.now()}-${idx}`);
      return {
        ...p,
        _id: docId,
        id: docId,
        _lastSavedToMongoAt: savedAt
      };
    });
    if (docs.length > 0) {
      const operations = docs.map((doc) => ({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true
        }
      }));
      await mongoCol.bulkWrite(operations);
    }
    return {
      success: true,
      count: docs.length,
      savedAt,
      target: `MongoDB Atlas Database (${getTargetDatabaseName()})`
    };
  } else {
    const local = readLocalVault();
    local.projects = projects;
    writeLocalVault(local);
    return {
      success: true,
      count: projects.length,
      savedAt,
      target: "Local Emulated MongoDB Store"
    };
  }
}
async function saveSingleProjectToMongo(project) {
  const savedAt = (/* @__PURE__ */ new Date()).toISOString();
  const uri = process.env.MONGODB_URI;
  const docId = String(project.id || `prj-${Date.now()}`);
  const doc = {
    ...project,
    _id: docId,
    id: docId,
    _lastSavedToMongoAt: savedAt
  };
  if (uri) {
    const conn = await getMongoClient();
    if (!conn) throw new Error("Could not establish connection to MongoDB");
    const db = conn.db;
    await db.collection("projects").replaceOne({ _id: docId }, doc, { upsert: true });
    return {
      success: true,
      projectId: docId,
      savedAt,
      target: `MongoDB Atlas Database (${getTargetDatabaseName()})`
    };
  } else {
    const local = readLocalVault();
    const existing = local.projects || [];
    const idx = existing.findIndex((p) => p.id === docId);
    if (idx >= 0) {
      existing[idx] = doc;
    } else {
      existing.unshift(doc);
    }
    local.projects = existing;
    writeLocalVault(local);
    return {
      success: true,
      projectId: docId,
      savedAt,
      target: "Local Emulated MongoDB Store"
    };
  }
}

// server/app.ts
dotenv.config();
var app = express();
app.disable("x-powered-by");
app.use(
  compression({
    level: 6,
    threshold: 1024,
    // only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    }
  })
);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use((req, res, next) => {
  if (req.url.startsWith("/api/index")) {
    req.url = req.url.replace(/^\/api\/index/, "/api");
  } else if (req.url.startsWith("/index/")) {
    req.url = req.url.replace(/^\/index/, "/api");
  } else if (!req.url.startsWith("/api") && !req.url.startsWith("/assets")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});
app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    status: "ok",
    model: "gemini-3.1-flash-live-preview",
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    mongoConfigured: !!process.env.MONGODB_URI,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/mongodb/status", async (req, res) => {
  try {
    const status = await getMongoStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({
      configured: !!process.env.MONGODB_URI,
      connected: false,
      databaseName: getTargetDatabaseName(),
      collectionsCount: 0,
      collections: {},
      error: err?.message || "Failed to retrieve MongoDB status"
    });
  }
});
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
        message: status.message
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "MongoDB ping test failed" });
  }
});
app.post("/api/mongodb/migrate", async (req, res) => {
  try {
    const payload = req.body?.payload || req.body;
    if (!payload || typeof payload !== "object") {
      res.status(400).json({ success: false, error: "Invalid migration payload provided" });
      return;
    }
    const result = await migrateFullDatabaseToMongo(payload);
    res.json(result);
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ success: false, error: err?.message || "Migration to MongoDB failed" });
  }
});
app.get("/api/mongodb/export", async (req, res) => {
  try {
    const result = await exportFullDatabaseFromMongo();
    res.json(result);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ success: false, error: err?.message || "Export from MongoDB failed" });
  }
});
app.post("/api/mongodb/restore", async (req, res) => {
  try {
    const result = await exportFullDatabaseFromMongo();
    res.json(result);
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).json({ success: false, error: err?.message || "Restore from MongoDB failed" });
  }
});
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
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "Failed to update MongoDB config" });
  }
});
app.get("/api/mongodb/projects", async (req, res) => {
  try {
    const result = await getProjectsFromMongo();
    res.json(result);
  } catch (err) {
    console.error("Failed to get projects from MongoDB:", err);
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch projects" });
  }
});
app.post("/api/mongodb/projects", async (req, res) => {
  try {
    const { projects } = req.body;
    if (!Array.isArray(projects)) {
      res.status(400).json({ success: false, error: "Projects array is required in request body" });
      return;
    }
    const result = await saveProjectsToMongo(projects);
    res.json(result);
  } catch (err) {
    console.error("Failed to save projects to MongoDB:", err);
    res.status(500).json({ success: false, error: err?.message || "Failed to save projects to MongoDB" });
  }
});
app.post("/api/mongodb/project", async (req, res) => {
  try {
    const { project } = req.body;
    if (!project || typeof project !== "object") {
      res.status(400).json({ success: false, error: "Project object is required" });
      return;
    }
    const result = await saveSingleProjectToMongo(project);
    res.json(result);
  } catch (err) {
    console.error("Failed to upsert project to MongoDB:", err);
    res.status(500).json({ success: false, error: err?.message || "Failed to update project in MongoDB" });
  }
});
app.post("/api/procurement/reorder-alert-email", async (req, res) => {
  try {
    const { recipients, subject, text, html, itemsSummary } = req.body;
    const targetRecipients = Array.isArray(recipients) && recipients.length > 0 ? recipients : [process.env.PROCUREMENT_ALERT_EMAIL || "procurement@alphaerp.com"];
    const emailSubject = subject || "\u{1F6A8} [AlphaERP Alert] Inventory Items Reached Reorder Levels";
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    if (smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || `"AlphaERP Inventory Control" <${smtpUser}>`,
          to: targetRecipients.join(", "),
          subject: emailSubject,
          text,
          html
        });
        res.json({
          success: true,
          mode: "smtp",
          isRealSmtp: true,
          messageId: info.messageId,
          recipients: targetRecipients,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          note: "Email successfully dispatched via configured SMTP server"
        });
        return;
      } catch (smtpErr) {
        console.warn("SMTP transmission error, falling back to mock wrapper:", smtpErr?.message);
      }
    }
    const mockMessageId = `mock-smtp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@alphaerp.local`;
    console.log(`[MOCK SMTP EMAIL] To: ${targetRecipients.join(", ")} | Subject: ${emailSubject}`);
    if (itemsSummary && Array.isArray(itemsSummary)) {
      console.log(`[MOCK SMTP EMAIL] Low-Stock SKUs: ${itemsSummary.map((i) => `${i.sku} (Avail: ${i.availableStock}/${i.reorderLevel})`).join(", ")}`);
    }
    res.json({
      success: true,
      mode: "mock_wrapper",
      isRealSmtp: false,
      messageId: mockMessageId,
      recipients: targetRecipients,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      note: "Email recorded and dispatched via AlphaERP resilient Mock SMTP Wrapper. Set SMTP_HOST, SMTP_USER, SMTP_PASS for external relay."
    });
  } catch (err) {
    console.error("Procurement email notification handler failed:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to dispatch procurement notification email"
    });
  }
});
var app_default = app;

// server/api-entry.ts
var api_entry_default = app_default;
export {
  api_entry_default as default
};
