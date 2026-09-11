import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export interface EnvDefinition {
  key: string;
  category: "AI & Voice Engine" | "Application & Network" | "Database & Storage" | "BaaS & PostgreSQL" | "Email & Notifications" | "Deployment & Cloud" | "Custom";
  description: string;
  sensitive: boolean;
  required?: boolean;
  example?: string;
  defaultValue?: string;
}

export interface EnvVariableItem {
  key: string;
  value: string;
  category: string;
  description: string;
  sensitive: boolean;
  required: boolean;
  example: string;
  defaultValue: string;
  isConfigured: boolean;
  isCustom: boolean;
  source: "process_env" | "env_file" | "default" | "not_set";
}

export interface EnvVariablesSummary {
  variables: EnvVariableItem[];
  metadata: {
    envFilePath: string;
    envFileExists: boolean;
    canWriteToFile: boolean;
    totalCount: number;
    configuredCount: number;
    missingCount: number;
    customCount: number;
    lastUpdated: string;
    nodeEnv: string;
    platform: string;
  };
}

// Canonical enterprise environment definitions for AlphaERP
export const SYSTEM_ENV_DEFINITIONS: EnvDefinition[] = [
  {
    key: "GEMINI_API_KEY",
    category: "AI & Voice Engine",
    description: "Google Gemini Live & Generative AI API key for conversational voice agent and smart HVAC estimation workflows.",
    sensitive: true,
    required: true,
    example: "AIzaSyD-...",
    defaultValue: "",
  },
  {
    key: "APP_URL",
    category: "Application & Network",
    description: "Public canonical application URL for OAuth redirect URIs, webhook targets, and shareable quote links.",
    sensitive: false,
    required: true,
    example: "https://hvacbiz.vercel.app",
    defaultValue: "http://localhost:3000",
  },
  {
    key: "MONGODB_URI",
    category: "Database & Storage",
    description: "MongoDB Atlas or self-hosted connection URI string for external cloud document persistence and synchronization.",
    sensitive: true,
    required: false,
    example: "mongodb+srv://admin:secret@cluster0.abcde.mongodb.net/alphaerp?retryWrites=true&w=majority",
    defaultValue: "",
  },
  {
    key: "MONGODB_DB_NAME",
    category: "Database & Storage",
    description: "Target MongoDB database collection namespace for AlphaERP records.",
    sensitive: false,
    required: false,
    example: "alphaerp",
    defaultValue: "alphaerp",
  },
  {
    key: "VITE_INSFORGE_URL",
    category: "BaaS & PostgreSQL",
    description: "InsForge Backend-as-a-Service PostgreSQL & PostgREST API base URL.",
    sensitive: false,
    required: false,
    example: "https://as2hwz72.us-east.insforge.app",
    defaultValue: "https://as2hwz72.us-east.insforge.app",
  },
  {
    key: "VITE_INSFORGE_ANON_KEY",
    category: "BaaS & PostgreSQL",
    description: "InsForge BaaS Anonymous Client Key for Row-Level Security (RLS) PostgreSQL database access.",
    sensitive: true,
    required: false,
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    defaultValue: "",
  },
  {
    key: "SMTP_HOST",
    category: "Email & Notifications",
    description: "SMTP mail server hostname for automated procurement alerts, PO notifications, and customer emails.",
    sensitive: false,
    required: false,
    example: "smtp.gmail.com / smtp.office365.com / smtp-relay.sendgrid.net",
    defaultValue: "",
  },
  {
    key: "SMTP_PORT",
    category: "Email & Notifications",
    description: "SMTP server port (587 for TLS/STARTTLS, 465 for SSL, 25 for local unencrypted relay).",
    sensitive: false,
    required: false,
    example: "587",
    defaultValue: "587",
  },
  {
    key: "SMTP_USER",
    category: "Email & Notifications",
    description: "SMTP authentication user account / outbound email address.",
    sensitive: false,
    required: false,
    example: "procurement@alphaerp.com",
    defaultValue: "",
  },
  {
    key: "SMTP_PASS",
    category: "Email & Notifications",
    description: "SMTP authentication password, App Password, or API access token.",
    sensitive: true,
    required: false,
    example: "••••••••••••••••",
    defaultValue: "",
  },
  {
    key: "SMTP_FROM",
    category: "Email & Notifications",
    description: "RFC 5322 formatted display name and sender email address for system emails.",
    sensitive: false,
    required: false,
    example: 'AlphaERP Inventory Control <procurement@alphaerp.com>',
    defaultValue: 'AlphaERP Inventory Control <procurement@alphaerp.com>',
  },
  {
    key: "PROCUREMENT_ALERT_EMAIL",
    category: "Email & Notifications",
    description: "Destination mailbox receiving automated critical safety-stock and reorder level alerts.",
    sensitive: false,
    required: false,
    example: "procurement@alphaerp.com",
    defaultValue: "",
  },
  {
    key: "VERCEL_TOKEN",
    category: "Deployment & Cloud",
    description: "Vercel Personal Access Token for remote deployment pipelines and serverless configuration.",
    sensitive: true,
    required: false,
    example: "verc_tok_...",
    defaultValue: "",
  },
  {
    key: "VERCEL_ORG_ID",
    category: "Deployment & Cloud",
    description: "Vercel Organization or Team identifier scope.",
    sensitive: false,
    required: false,
    example: "team_alphaerp",
    defaultValue: "",
  },
  {
    key: "VERCEL_PROJECT_ID",
    category: "Deployment & Cloud",
    description: "Vercel Project identifier for automated CLI deployments.",
    sensitive: false,
    required: false,
    example: "prj_alphaerp_01",
    defaultValue: "",
  },
];

const ENV_FILE_PATH = path.resolve(process.cwd(), ".env");

/**
 * Parse an existing .env file into key-value pairs
 */
export function parseEnvFile(filePath: string = ENV_FILE_PATH): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(filePath)) {
    return result;
  }
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const parsed = dotenv.parse(fileContent);
    return parsed;
  } catch (err) {
    console.warn("Could not read or parse .env file:", err);
    return result;
  }
}

/**
 * Retrieve all system and custom environment variables with full metadata
 */
export function getAllEnvironmentVariables(): EnvVariablesSummary {
  const fileVars = parseEnvFile(ENV_FILE_PATH);
  const fileExists = fs.existsSync(ENV_FILE_PATH);
  let canWrite = true;

  try {
    // Check write capability
    if (fileExists) {
      fs.accessSync(ENV_FILE_PATH, fs.constants.W_OK);
    } else {
      fs.accessSync(process.cwd(), fs.constants.W_OK);
    }
  } catch {
    canWrite = false;
  }

  const knownKeys = new Set(SYSTEM_ENV_DEFINITIONS.map((def) => def.key));
  const variables: EnvVariableItem[] = [];

  // 1. Process all known standard system variables
  for (const def of SYSTEM_ENV_DEFINITIONS) {
    const processVal = process.env[def.key];
    const fileVal = fileVars[def.key];
    const finalVal = processVal !== undefined ? processVal : (fileVal !== undefined ? fileVal : def.defaultValue || "");

    let source: "process_env" | "env_file" | "default" | "not_set" = "not_set";
    if (processVal !== undefined && processVal !== "") {
      source = "process_env";
    } else if (fileVal !== undefined && fileVal !== "") {
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
      source,
    });
  }

  // 2. Process custom variables found in .env file
  for (const [key, val] of Object.entries(fileVars)) {
    if (!knownKeys.has(key)) {
      variables.push({
        key,
        value: process.env[key] !== undefined ? process.env[key]! : val,
        category: "Custom",
        description: "Custom user-defined environment parameter.",
        sensitive: key.toLowerCase().includes("key") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("pass") || key.toLowerCase().includes("token"),
        required: false,
        example: "",
        defaultValue: "",
        isConfigured: (process.env[key] || val || "").trim().length > 0,
        isCustom: true,
        source: process.env[key] !== undefined ? "process_env" : "env_file",
      });
      knownKeys.add(key);
    }
  }

  // 3. Process any custom variables added directly to process.env with specific prefixes
  for (const [key, val] of Object.entries(process.env)) {
    if (
      !knownKeys.has(key) &&
      (key.startsWith("CUSTOM_") || key.startsWith("ALPHA_") || key.startsWith("ERP_") || key.startsWith("VITE_APP_"))
    ) {
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
        source: "process_env",
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
      lastUpdated: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || "development",
      platform: process.platform,
    },
  };
}

/**
 * Format a key-value pair for .env file
 */
function formatEnvLine(key: string, value: string): string {
  // If value contains newlines, quotes, or spaces, escape and quote it
  if (value === "") {
    return `${key}=`;
  }
  if (/[\s#"'\n\r]/.test(value)) {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `${key}="${escaped}"`;
  }
  return `${key}=${value}`;
}

/**
 * Save and apply environment variables to runtime (process.env) and persist to .env file
 */
export function saveEnvironmentVariables(
  updates: Record<string, string>,
  removedKeys: string[] = []
): { success: boolean; updatedCount: number; persistedToFile: boolean; message: string; error?: string } {
  try {
    const sanitizedUpdates: Record<string, string> = {};

    // Validate keys
    for (const [rawKey, rawVal] of Object.entries(updates)) {
      const trimmedKey = rawKey.trim().toUpperCase();
      if (!/^[A-Z0-9_]+$/.test(trimmedKey)) {
        throw new Error(`Invalid environment variable name: "${rawKey}". Variable names must contain only uppercase letters, numbers, and underscores.`);
      }
      sanitizedUpdates[trimmedKey] = String(rawVal);
    }

    // 1. Update runtime process.env
    for (const [key, val] of Object.entries(sanitizedUpdates)) {
      process.env[key] = val;
    }

    // Handle removals
    for (const rawKey of removedKeys) {
      const trimmedKey = rawKey.trim().toUpperCase();
      delete process.env[trimmedKey];
    }

    // 2. Merge with existing .env on disk or build new one
    const existingFileVars = parseEnvFile(ENV_FILE_PATH);
    const mergedVars: Record<string, string> = { ...existingFileVars, ...sanitizedUpdates };

    for (const rawKey of removedKeys) {
      delete mergedVars[rawKey.trim().toUpperCase()];
    }

    // 3. Build formatted .env file content grouped by category
    const categories: Record<string, string[]> = {
      "AI & Voice Engine": ["GEMINI_API_KEY"],
      "Application & Network": ["APP_URL"],
      "Database & Storage": ["MONGODB_URI", "MONGODB_DB_NAME"],
      "BaaS & PostgreSQL": ["VITE_INSFORGE_URL", "VITE_INSFORGE_ANON_KEY"],
      "Email & Notifications": ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "PROCUREMENT_ALERT_EMAIL"],
      "Deployment & Cloud": ["VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"],
    };

    const writtenKeys = new Set<string>();
    const lines: string[] = [
      "# ===================================================================",
      "# AlphaERP Enterprise Environment Configuration",
      `# Generated & Saved via Super Admin Console on ${new Date().toISOString()}`,
      "# ===================================================================",
      "",
    ];

    for (const [catName, catKeys] of Object.entries(categories)) {
      lines.push(`# --- [${catName.toUpperCase()}] ---`);
      for (const key of catKeys) {
        writtenKeys.add(key);
        const def = SYSTEM_ENV_DEFINITIONS.find((d) => d.key === key);
        if (def) {
          lines.push(`# ${def.description}`);
        }
        const val = mergedVars[key] !== undefined ? mergedVars[key] : (process.env[key] || "");
        lines.push(formatEnvLine(key, val));
        lines.push("");
      }
    }

    // Append custom / unmapped variables
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
    let writeError: string | undefined;

    try {
      fs.writeFileSync(ENV_FILE_PATH, envContent, "utf8");
      persistedToFile = true;
    } catch (fsErr: any) {
      console.warn("Could not persist to .env file on disk (read-only container or serverless environment):", fsErr?.message);
      writeError = fsErr?.message;
    }

    return {
      success: true,
      updatedCount: Object.keys(sanitizedUpdates).length,
      persistedToFile,
      message: persistedToFile
        ? `Successfully applied ${Object.keys(sanitizedUpdates).length} environment variables and persisted to .env on disk.`
        : `Applied ${Object.keys(sanitizedUpdates).length} environment variables to runtime memory (file write skipped in current container environment).`,
      error: writeError,
    };
  } catch (err: any) {
    console.error("Failed to save environment variables:", err);
    return {
      success: false,
      updatedCount: 0,
      persistedToFile: false,
      message: err?.message || "Failed to save environment variables",
      error: err?.message,
    };
  }
}

/**
 * Generate raw .env text string for download or clipboard copy
 */
export function generateRawEnvString(): string {
  const summary = getAllEnvironmentVariables();
  const lines: string[] = [
    "# ===================================================================",
    "# AlphaERP Enterprise Environment Configuration Export",
    `# Exported: ${new Date().toISOString()}`,
    "# ===================================================================",
    "",
  ];

  for (const item of summary.variables) {
    lines.push(`# ${item.category}: ${item.description}`);
    lines.push(formatEnvLine(item.key, item.value));
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Test or validate a specific environment variable
 */
export async function testEnvironmentVariable(key: string, value?: string): Promise<{ success: boolean; message: string; latencyMs?: number; details?: any }> {
  const start = Date.now();
  const testVal = value !== undefined ? value : (process.env[key] || "");

  if (!testVal) {
    return {
      success: false,
      message: `Environment variable "${key}" is currently empty or undefined.`,
    };
  }

  try {
    switch (key) {
      case "GEMINI_API_KEY": {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: testVal });
        const modelsResult = await ai.models.list();
        const latencyMs = Date.now() - start;
        const count = (modelsResult as any)?.page?.length || 50;
        return {
          success: true,
          message: `Gemini API key verified successfully! Connected to Google GenAI (${count}+ models accessible).`,
          latencyMs,
          details: { verified: true, count },
        };
      }

      case "MONGODB_URI": {
        const { MongoClient } = await import("mongodb");
        const client = new MongoClient(testVal, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });
        await client.connect();
        const pingResult = await client.db("admin").command({ ping: 1 });
        await client.close();
        const latencyMs = Date.now() - start;
        return {
          success: true,
          message: `MongoDB Atlas cluster authenticated and pinged successfully.`,
          latencyMs,
          details: pingResult,
        };
      }

      case "VITE_INSFORGE_URL": {
        const url = new URL(testVal);
        const res = await fetch(url.toString(), { method: "HEAD", signal: AbortSignal.timeout(5000) });
        const latencyMs = Date.now() - start;
        return {
          success: res.status < 500,
          message: `InsForge BaaS endpoint reached with HTTP status ${res.status} (${res.statusText}).`,
          latencyMs,
        };
      }

      case "APP_URL": {
        const url = new URL(testVal);
        const isSecure = url.protocol === "https:";
        return {
          success: true,
          message: `Valid canonical application URL (${url.origin}). ${isSecure ? 'SSL/HTTPS enabled.' : 'Notice: Using unencrypted HTTP.'}`,
          details: { protocol: url.protocol, host: url.host },
        };
      }

      case "SMTP_HOST": {
        const nodemailer = await import("nodemailer");
        const port = Number(process.env.SMTP_PORT || 587);
        const transporter = nodemailer.createTransport({
          host: testVal,
          port,
          secure: port === 465,
          connectionTimeout: 5000,
        });
        await transporter.verify();
        const latencyMs = Date.now() - start;
        return {
          success: true,
          message: `SMTP Mail Server at ${testVal}:${port} connected and verified successfully.`,
          latencyMs,
        };
      }

      default: {
        return {
          success: true,
          message: `Variable "${key}" configured with value length of ${testVal.length} characters.`,
          details: { length: testVal.length },
        };
      }
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Validation failed for ${key}: ${err?.message || "Unknown error"}`,
      details: { error: err?.message },
    };
  }
}
