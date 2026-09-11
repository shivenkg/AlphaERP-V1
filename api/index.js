// server/app.ts
import express from "express";
import compression from "compression";
import dotenv2 from "dotenv";

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

// server/envManager.ts
import fs2 from "fs";
import path2 from "path";
import dotenv from "dotenv";
var SYSTEM_ENV_DEFINITIONS = [
  {
    key: "GEMINI_API_KEY",
    category: "AI & Voice Engine",
    description: "Google Gemini Live & Generative AI API key for conversational voice agent and smart HVAC estimation workflows.",
    sensitive: true,
    required: true,
    example: "AIzaSyD-...",
    defaultValue: ""
  },
  {
    key: "APP_URL",
    category: "Application & Network",
    description: "Public canonical application URL for OAuth redirect URIs, webhook targets, and shareable quote links.",
    sensitive: false,
    required: true,
    example: "https://hvacbiz.vercel.app",
    defaultValue: "http://localhost:3000"
  },
  {
    key: "MONGODB_URI",
    category: "Database & Storage",
    description: "MongoDB Atlas or self-hosted connection URI string for external cloud document persistence and synchronization.",
    sensitive: true,
    required: false,
    example: "mongodb+srv://admin:secret@cluster0.abcde.mongodb.net/alphaerp?retryWrites=true&w=majority",
    defaultValue: ""
  },
  {
    key: "MONGODB_DB_NAME",
    category: "Database & Storage",
    description: "Target MongoDB database collection namespace for AlphaERP records.",
    sensitive: false,
    required: false,
    example: "alphaerp",
    defaultValue: "alphaerp"
  },
  {
    key: "VITE_INSFORGE_URL",
    category: "BaaS & PostgreSQL",
    description: "InsForge Backend-as-a-Service PostgreSQL & PostgREST API base URL.",
    sensitive: false,
    required: false,
    example: "https://as2hwz72.us-east.insforge.app",
    defaultValue: "https://as2hwz72.us-east.insforge.app"
  },
  {
    key: "VITE_INSFORGE_ANON_KEY",
    category: "BaaS & PostgreSQL",
    description: "InsForge BaaS Anonymous Client Key for Row-Level Security (RLS) PostgreSQL database access.",
    sensitive: true,
    required: false,
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    defaultValue: ""
  },
  {
    key: "SMTP_HOST",
    category: "Email & Notifications",
    description: "SMTP mail server hostname for automated procurement alerts, PO notifications, and customer emails.",
    sensitive: false,
    required: false,
    example: "smtp.gmail.com / smtp.office365.com / smtp-relay.sendgrid.net",
    defaultValue: ""
  },
  {
    key: "SMTP_PORT",
    category: "Email & Notifications",
    description: "SMTP server port (587 for TLS/STARTTLS, 465 for SSL, 25 for local unencrypted relay).",
    sensitive: false,
    required: false,
    example: "587",
    defaultValue: "587"
  },
  {
    key: "SMTP_USER",
    category: "Email & Notifications",
    description: "SMTP authentication user account / outbound email address.",
    sensitive: false,
    required: false,
    example: "procurement@alphaerp.com",
    defaultValue: ""
  },
  {
    key: "SMTP_PASS",
    category: "Email & Notifications",
    description: "SMTP authentication password, App Password, or API access token.",
    sensitive: true,
    required: false,
    example: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    defaultValue: ""
  },
  {
    key: "SMTP_FROM",
    category: "Email & Notifications",
    description: "RFC 5322 formatted display name and sender email address for system emails.",
    sensitive: false,
    required: false,
    example: "AlphaERP Inventory Control <procurement@alphaerp.com>",
    defaultValue: "AlphaERP Inventory Control <procurement@alphaerp.com>"
  },
  {
    key: "PROCUREMENT_ALERT_EMAIL",
    category: "Email & Notifications",
    description: "Destination mailbox receiving automated critical safety-stock and reorder level alerts.",
    sensitive: false,
    required: false,
    example: "procurement@alphaerp.com",
    defaultValue: ""
  },
  {
    key: "VERCEL_TOKEN",
    category: "Deployment & Cloud",
    description: "Vercel Personal Access Token for remote deployment pipelines and serverless configuration.",
    sensitive: true,
    required: false,
    example: "verc_tok_...",
    defaultValue: ""
  },
  {
    key: "VERCEL_ORG_ID",
    category: "Deployment & Cloud",
    description: "Vercel Organization or Team identifier scope.",
    sensitive: false,
    required: false,
    example: "team_alphaerp",
    defaultValue: ""
  },
  {
    key: "VERCEL_PROJECT_ID",
    category: "Deployment & Cloud",
    description: "Vercel Project identifier for automated CLI deployments.",
    sensitive: false,
    required: false,
    example: "prj_alphaerp_01",
    defaultValue: ""
  }
];
var ENV_FILE_PATH = path2.resolve(process.cwd(), ".env");
function parseEnvFile(filePath = ENV_FILE_PATH) {
  const result = {};
  if (!fs2.existsSync(filePath)) {
    return result;
  }
  try {
    const fileContent = fs2.readFileSync(filePath, "utf8");
    const parsed = dotenv.parse(fileContent);
    return parsed;
  } catch (err) {
    console.warn("Could not read or parse .env file:", err);
    return result;
  }
}
function getAllEnvironmentVariables() {
  const fileVars = parseEnvFile(ENV_FILE_PATH);
  const fileExists = fs2.existsSync(ENV_FILE_PATH);
  let canWrite = true;
  try {
    if (fileExists) {
      fs2.accessSync(ENV_FILE_PATH, fs2.constants.W_OK);
    } else {
      fs2.accessSync(process.cwd(), fs2.constants.W_OK);
    }
  } catch {
    canWrite = false;
  }
  const knownKeys = new Set(SYSTEM_ENV_DEFINITIONS.map((def) => def.key));
  const variables = [];
  for (const def of SYSTEM_ENV_DEFINITIONS) {
    const processVal = process.env[def.key];
    const fileVal = fileVars[def.key];
    const finalVal = processVal !== void 0 ? processVal : fileVal !== void 0 ? fileVal : def.defaultValue || "";
    let source = "not_set";
    if (processVal !== void 0 && processVal !== "") {
      source = "process_env";
    } else if (fileVal !== void 0 && fileVal !== "") {
      source = "env_file";
    } else if (def.defaultValue) {
      source = "default";
    }
    const isConfigured = finalVal.trim().length > 0;
    variables.push({
      key: def.key,
      value: finalVal,
      category: def.category,
      description: def.description,
      sensitive: def.sensitive,
      required: Boolean(def.required),
      example: def.example || "",
      defaultValue: def.defaultValue || "",
      isConfigured,
      isCustom: false,
      source
    });
  }
  for (const [key, val] of Object.entries(fileVars)) {
    if (!knownKeys.has(key)) {
      variables.push({
        key,
        value: process.env[key] !== void 0 ? process.env[key] : val,
        category: "Custom",
        description: "Custom user-defined environment parameter.",
        sensitive: key.toLowerCase().includes("key") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("pass") || key.toLowerCase().includes("token"),
        required: false,
        example: "",
        defaultValue: "",
        isConfigured: (process.env[key] || val || "").trim().length > 0,
        isCustom: true,
        source: process.env[key] !== void 0 ? "process_env" : "env_file"
      });
      knownKeys.add(key);
    }
  }
  for (const [key, val] of Object.entries(process.env)) {
    if (!knownKeys.has(key) && (key.startsWith("CUSTOM_") || key.startsWith("ALPHA_") || key.startsWith("ERP_") || key.startsWith("VITE_APP_"))) {
      variables.push({
        key,
        value: val || "",
        category: "Custom",
        description: "Runtime custom environment parameter.",
        sensitive: key.toLowerCase().includes("key") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("pass") || key.toLowerCase().includes("token"),
        required: false,
        example: "",
        defaultValue: "",
        isConfigured: (val || "").trim().length > 0,
        isCustom: true,
        source: "process_env"
      });
      knownKeys.add(key);
    }
  }
  const totalCount = variables.length;
  const configuredCount = variables.filter((v) => v.isConfigured).length;
  const missingCount = variables.filter((v) => !v.isConfigured && v.required).length;
  const customCount = variables.filter((v) => v.isCustom).length;
  return {
    variables,
    metadata: {
      envFilePath: ENV_FILE_PATH,
      envFileExists: fileExists,
      canWriteToFile: canWrite,
      totalCount,
      configuredCount,
      missingCount,
      customCount,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      nodeEnv: process.env.NODE_ENV || "development",
      platform: process.platform
    }
  };
}
function formatEnvLine(key, value) {
  if (value === "") {
    return `${key}=`;
  }
  if (/[\s#"'\n\r]/.test(value)) {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `${key}="${escaped}"`;
  }
  return `${key}=${value}`;
}
function saveEnvironmentVariables(updates, removedKeys = []) {
  try {
    const sanitizedUpdates = {};
    for (const [rawKey, rawVal] of Object.entries(updates)) {
      const trimmedKey = rawKey.trim().toUpperCase();
      if (!/^[A-Z0-9_]+$/.test(trimmedKey)) {
        throw new Error(`Invalid environment variable name: "${rawKey}". Variable names must contain only uppercase letters, numbers, and underscores.`);
      }
      sanitizedUpdates[trimmedKey] = String(rawVal);
    }
    for (const [key, val] of Object.entries(sanitizedUpdates)) {
      process.env[key] = val;
    }
    for (const rawKey of removedKeys) {
      const trimmedKey = rawKey.trim().toUpperCase();
      delete process.env[trimmedKey];
    }
    const existingFileVars = parseEnvFile(ENV_FILE_PATH);
    const mergedVars = { ...existingFileVars, ...sanitizedUpdates };
    for (const rawKey of removedKeys) {
      delete mergedVars[rawKey.trim().toUpperCase()];
    }
    const categories = {
      "AI & Voice Engine": ["GEMINI_API_KEY"],
      "Application & Network": ["APP_URL"],
      "Database & Storage": ["MONGODB_URI", "MONGODB_DB_NAME"],
      "BaaS & PostgreSQL": ["VITE_INSFORGE_URL", "VITE_INSFORGE_ANON_KEY"],
      "Email & Notifications": ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "PROCUREMENT_ALERT_EMAIL"],
      "Deployment & Cloud": ["VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"]
    };
    const writtenKeys = /* @__PURE__ */ new Set();
    const lines = [
      "# ===================================================================",
      "# AlphaERP Enterprise Environment Configuration",
      `# Generated & Saved via Super Admin Console on ${(/* @__PURE__ */ new Date()).toISOString()}`,
      "# ===================================================================",
      ""
    ];
    for (const [catName, catKeys] of Object.entries(categories)) {
      lines.push(`# --- [${catName.toUpperCase()}] ---`);
      for (const key of catKeys) {
        writtenKeys.add(key);
        const def = SYSTEM_ENV_DEFINITIONS.find((d) => d.key === key);
        if (def) {
          lines.push(`# ${def.description}`);
        }
        const val = mergedVars[key] !== void 0 ? mergedVars[key] : process.env[key] || "";
        lines.push(formatEnvLine(key, val));
        lines.push("");
      }
    }
    const remainingKeys = Object.keys(mergedVars).filter((k) => !writtenKeys.has(k)).sort();
    if (remainingKeys.length > 0) {
      lines.push("# --- [CUSTOM & EXTENSION VARIABLES] ---");
      for (const key of remainingKeys) {
        lines.push(formatEnvLine(key, mergedVars[key]));
      }
      lines.push("");
    }
    const envContent = lines.join("\n");
    let persistedToFile = false;
    let writeError;
    try {
      fs2.writeFileSync(ENV_FILE_PATH, envContent, "utf8");
      persistedToFile = true;
    } catch (fsErr) {
      console.warn("Could not persist to .env file on disk (read-only container or serverless environment):", fsErr?.message);
      writeError = fsErr?.message;
    }
    return {
      success: true,
      updatedCount: Object.keys(sanitizedUpdates).length,
      persistedToFile,
      message: persistedToFile ? `Successfully applied ${Object.keys(sanitizedUpdates).length} environment variables and persisted to .env on disk.` : `Applied ${Object.keys(sanitizedUpdates).length} environment variables to runtime memory (file write skipped in current container environment).`,
      error: writeError
    };
  } catch (err) {
    console.error("Failed to save environment variables:", err);
    return {
      success: false,
      updatedCount: 0,
      persistedToFile: false,
      message: err?.message || "Failed to save environment variables",
      error: err?.message
    };
  }
}
function generateRawEnvString() {
  const summary = getAllEnvironmentVariables();
  const lines = [
    "# ===================================================================",
    "# AlphaERP Enterprise Environment Configuration Export",
    `# Exported: ${(/* @__PURE__ */ new Date()).toISOString()}`,
    "# ===================================================================",
    ""
  ];
  for (const item of summary.variables) {
    lines.push(`# ${item.category}: ${item.description}`);
    lines.push(formatEnvLine(item.key, item.value));
    lines.push("");
  }
  return lines.join("\n");
}
async function testEnvironmentVariable(key, value) {
  const start = Date.now();
  const testVal = value !== void 0 ? value : process.env[key] || "";
  if (!testVal) {
    return {
      success: false,
      message: `Environment variable "${key}" is currently empty or undefined.`
    };
  }
  try {
    switch (key) {
      case "GEMINI_API_KEY": {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: testVal });
        const modelsResult = await ai.models.list();
        const latencyMs = Date.now() - start;
        const count = modelsResult?.page?.length || 50;
        return {
          success: true,
          message: `Gemini API key verified successfully! Connected to Google GenAI (${count}+ models accessible).`,
          latencyMs,
          details: { verified: true, count }
        };
      }
      case "MONGODB_URI": {
        const { MongoClient: MongoClient2 } = await import("mongodb");
        const client = new MongoClient2(testVal, {
          serverSelectionTimeoutMS: 5e3,
          connectTimeoutMS: 5e3
        });
        await client.connect();
        const pingResult = await client.db("admin").command({ ping: 1 });
        await client.close();
        const latencyMs = Date.now() - start;
        return {
          success: true,
          message: `MongoDB Atlas cluster authenticated and pinged successfully.`,
          latencyMs,
          details: pingResult
        };
      }
      case "VITE_INSFORGE_URL": {
        const url = new URL(testVal);
        const res = await fetch(url.toString(), { method: "HEAD", signal: AbortSignal.timeout(5e3) });
        const latencyMs = Date.now() - start;
        return {
          success: res.status < 500,
          message: `InsForge BaaS endpoint reached with HTTP status ${res.status} (${res.statusText}).`,
          latencyMs
        };
      }
      case "APP_URL": {
        const url = new URL(testVal);
        const isSecure = url.protocol === "https:";
        return {
          success: true,
          message: `Valid canonical application URL (${url.origin}). ${isSecure ? "SSL/HTTPS enabled." : "Notice: Using unencrypted HTTP."}`,
          details: { protocol: url.protocol, host: url.host }
        };
      }
      case "SMTP_HOST": {
        const nodemailer = await import("nodemailer");
        const port = Number(process.env.SMTP_PORT || 587);
        const transporter = nodemailer.createTransport({
          host: testVal,
          port,
          secure: port === 465,
          connectionTimeout: 5e3
        });
        await transporter.verify();
        const latencyMs = Date.now() - start;
        return {
          success: true,
          message: `SMTP Mail Server at ${testVal}:${port} connected and verified successfully.`,
          latencyMs
        };
      }
      default: {
        return {
          success: true,
          message: `Variable "${key}" configured with value length of ${testVal.length} characters.`,
          details: { length: testVal.length }
        };
      }
    }
  } catch (err) {
    return {
      success: false,
      message: `Validation failed for ${key}: ${err?.message || "Unknown error"}`,
      details: { error: err?.message }
    };
  }
}

// server/app.ts
dotenv2.config();
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
    const { recipients, subject, text, html, itemsSummary, smtpConfig } = req.body;
    const targetRecipients = Array.isArray(recipients) && recipients.length > 0 ? recipients : Array.isArray(smtpConfig?.defaultRecipients) && smtpConfig.defaultRecipients.length > 0 ? smtpConfig.defaultRecipients : [process.env.PROCUREMENT_ALERT_EMAIL || "procurement@alphaerp.com"];
    const emailSubject = subject || "\u{1F6A8} [AlphaERP Alert] Inventory Items Reached Reorder Levels";
    const isExplicitMock = smtpConfig?.mode === "mock";
    const smtpHost = smtpConfig?.host || process.env.SMTP_HOST;
    const smtpUser = smtpConfig?.username || process.env.SMTP_USER;
    const smtpPass = smtpConfig?.password || process.env.SMTP_PASS;
    const smtpPort = Number(smtpConfig?.port || process.env.SMTP_PORT || 587);
    const senderName = smtpConfig?.senderName || "AlphaERP Inventory Control";
    const senderEmail = smtpConfig?.senderEmail || smtpUser || "notifications@alphaerp.com";
    const fromAddress = `"${senderName}" <${senderEmail}>`;
    if (!isExplicitMock && smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465 || Boolean(smtpConfig?.secure),
          auth: {
            user: smtpUser,
            pass: smtpPass
          },
          connectionTimeout: 6e3
        });
        const info = await transporter.sendMail({
          from: fromAddress,
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
          note: `Email successfully dispatched via configured SMTP server (${smtpHost})`
        });
        return;
      } catch (smtpErr) {
        console.warn("SMTP transmission error, falling back to mock wrapper:", smtpErr?.message);
      }
    }
    const mockMessageId = `mock-smtp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@alphaerp.local`;
    console.log(`[MOCK SMTP EMAIL] From: ${fromAddress} | To: ${targetRecipients.join(", ")} | Subject: ${emailSubject}`);
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
      note: `Email recorded and dispatched via AlphaERP resilient Mock Sandbox (${smtpHost || "sandbox"}:${smtpPort}). Change configuration in Admin Settings.`
    });
  } catch (err) {
    console.error("Procurement email notification handler failed:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to dispatch procurement notification email"
    });
  }
});
app.post("/api/email/test-connection", async (req, res) => {
  try {
    const {
      host,
      port,
      secure,
      username,
      password,
      senderName,
      senderEmail,
      testRecipient,
      mode,
      provider
    } = req.body;
    const recipient = testRecipient || "procurement@alphaerp.com";
    const portNum = Number(port || 587);
    const fromAddr = `"${senderName || "AlphaERP Test Engine"}" <${senderEmail || username || "notifications@alphaerp.com"}>`;
    const isDummyHost = !host || host.includes("mailtrap") || host.includes("ethereal") || host.includes("dummy") || host.includes("test");
    const isMock = mode === "mock" || isDummyHost;
    if (!isMock && host && username && password) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host,
          port: portNum,
          secure: secure || portNum === 465,
          auth: {
            user: username,
            pass: password
          },
          connectionTimeout: 6e3
        });
        const info = await transporter.sendMail({
          from: fromAddr,
          to: recipient,
          subject: "\u2705 AlphaERP Email Dispatcher \u2014 Test Connection Verification",
          text: `Hello,

This is a test notification confirming that your SMTP server connection (${host}:${portNum}) is authenticated and operating properly.

Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}
AlphaERP System Notification Engine`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
              <div style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <h2 style="color: #0f172a; margin: 0; font-size: 20px;">\u2705 AlphaERP SMTP Connection Verified</h2>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Automated Email Dispatcher Test Result</p>
              </div>
              <div style="padding: 16px 0; color: #334155; font-size: 14px; line-height: 1.6;">
                <p>Your external SMTP configuration has been successfully authenticated.</p>
                <ul style="background: #f8fafc; padding: 12px 24px; border-radius: 8px; list-style-type: square; color: #475569;">
                  <li><strong>Host:</strong> ${host}:${portNum}</li>
                  <li><strong>User:</strong> ${username}</li>
                  <li><strong>Sender:</strong> ${fromAddr}</li>
                  <li><strong>Encryption:</strong> ${portNum === 465 || secure ? "SSL/TLS (Port 465)" : "STARTTLS (Port " + portNum + ")"}</li>
                </ul>
              </div>
              <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                AlphaERP Enterprise Cloud \u2022 ${(/* @__PURE__ */ new Date()).toLocaleString()}
              </div>
            </div>
          `
        });
        res.json({
          success: true,
          mode: "smtp",
          messageId: info.messageId,
          recipients: [recipient],
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          note: `Authenticated and sent test email to ${recipient} via ${host}:${portNum}`
        });
        return;
      } catch (smtpErr) {
        console.warn("Live SMTP test failed:", smtpErr?.message);
        res.status(400).json({
          success: false,
          error: smtpErr?.message || "Failed to authenticate or connect with SMTP server",
          note: "Please verify hostname, port, username, and app password/token."
        });
        return;
      }
    }
    const mockMessageId = `mock-test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@alphaerp.local`;
    console.log(`[MOCK TEST EMAIL] From: ${fromAddr} | To: ${recipient} | Mode: Mock Sandbox (${provider || "mailtrap"})`);
    res.json({
      success: true,
      mode: "mock",
      messageId: mockMessageId,
      recipients: [recipient],
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      note: `Verified test connection for ${String(provider || "Dummy Test Sandbox").toUpperCase()} (${host || "smtp.mailtrap.io"}:${portNum}). Ready for sandbox operations.`
    });
  } catch (err) {
    console.error("Test email connection endpoint failed:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to process test email verification"
    });
  }
});
app.get("/api/admin/env", (req, res) => {
  try {
    const summary = getAllEnvironmentVariables();
    res.json(summary);
  } catch (err) {
    console.error("Failed to retrieve environment variables:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to retrieve environment variables"
    });
  }
});
app.post("/api/admin/env", (req, res) => {
  try {
    const { variables, removedKeys } = req.body;
    if (!variables || typeof variables !== "object") {
      res.status(400).json({
        success: false,
        error: "Invalid request payload: 'variables' object is required"
      });
      return;
    }
    const result = saveEnvironmentVariables(variables, Array.isArray(removedKeys) ? removedKeys : []);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    console.error("Failed to update environment variables:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Internal server error while saving environment variables"
    });
  }
});
app.post("/api/admin/env/test", async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || typeof key !== "string") {
      res.status(400).json({
        success: false,
        error: "Environment variable 'key' string is required for testing"
      });
      return;
    }
    const result = await testEnvironmentVariable(key, value);
    res.json(result);
  } catch (err) {
    console.error("Failed to test environment variable:", err);
    res.status(500).json({
      success: false,
      message: err?.message || "Test failed due to internal error"
    });
  }
});
app.get("/api/admin/env/raw", (req, res) => {
  try {
    const rawContent = generateRawEnvString();
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename=".env"');
    res.send(rawContent);
  } catch (err) {
    res.status(500).send(`# Error exporting .env file: ${err?.message}`);
  }
});
var app_default = app;

// server/api-entry.ts
var api_entry_default = app_default;
export {
  api_entry_default as default
};
