import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

export interface MongoDbStatus {
  configured: boolean;
  connected: boolean;
  mode: 'mongodb_cluster' | 'emulated_local';
  databaseName: string;
  maskedUri?: string;
  pingMs?: number;
  collectionsCount: number;
  collections: Record<string, number>;
  lastMigratedAt?: string;
  message?: string;
  error?: string;
  ipWhitelistRequired?: boolean;
  egressIp?: string;
}

export interface CollectionMigrationReport {
  collection: string;
  count: number;
  status: 'migrated' | 'skipped';
}

export interface MongoMigrationResult {
  success: boolean;
  error?: string;
  totalMasterRecords: number;
  totalTransactionRecords: number;
  collectionCounts: Record<string, number>;
  collectionsReport: CollectionMigrationReport[];
  migratedAt: string;
  durationMs: number;
  databaseName: string;
  target: string;
}

let mongoClient: MongoClient | null = null;
let activeDb: Db | null = null;
let lastKnownMigratedAt: string | null = null;

// Local fallback file storage for when MONGODB_URI is not configured yet
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_VAULT_FILE = path.join(DATA_DIR, 'mongodb_local_vault.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

function readLocalVault(): Record<string, any> {
  try {
    ensureDataDir();
    if (fs.existsSync(LOCAL_VAULT_FILE)) {
      const content = fs.readFileSync(LOCAL_VAULT_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Could not read local MongoDB vault file:', err);
  }
  return {};
}

function writeLocalVault(data: Record<string, any>): void {
  try {
    ensureDataDir();
    fs.writeFileSync(LOCAL_VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Could not write local MongoDB vault file:', err);
  }
}

function maskMongoUri(uri: string): string {
  try {
    // Mask password in mongodb://user:pass@host or mongodb+srv://user:pass@host
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1••••••••$3');
  } catch {
    return 'mongodb://••••••••';
  }
}

function formatMongoError(err: any): { error: string; ipWhitelistRequired: boolean } {
  const msg = err?.message || String(err || '');
  if (msg.includes('SSL alert number 80') || msg.includes('tlsv1 alert') || msg.includes('ECONNRESET')) {
    return {
      error: 'MongoDB Atlas rejected TLS connection (SSL Alert 80): In MongoDB Atlas, go to "Network Access" -> "IP Access List" -> Click "Add IP Address" -> Select "Allow Access from Anywhere" (0.0.0.0/0).',
      ipWhitelistRequired: true,
    };
  }
  if (msg.includes('bad auth') || msg.includes('Authentication failed') || msg.includes('auth failed')) {
    return {
      error: 'MongoDB authentication failed. Please verify the database user credentials in your connection string.',
      ipWhitelistRequired: false,
    };
  }
  if (msg.includes('ENOTFOUND') || msg.includes('querySrv')) {
    return {
      error: 'Could not resolve MongoDB cluster hostname. Verify the cluster address in your connection string.',
      ipWhitelistRequired: false,
    };
  }
  return {
    error: msg || 'Failed to connect to MongoDB cluster',
    ipWhitelistRequired: false,
  };
}

export function updateMongoConfig(newUri: string, newDbName?: string): { success: boolean; error?: string } {
  try {
    const trimmed = newUri.trim();
    if (!trimmed) {
      throw new Error('Connection URI cannot be empty');
    }
    process.env.MONGODB_URI = trimmed;
    if (newDbName && newDbName.trim()) {
      process.env.MONGODB_DB_NAME = newDbName.trim();
    }

    // Persist to .env file in project root
    try {
      const envPath = path.join(process.cwd(), '.env');
      let content = '';
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf-8');
      }
      // Replace or append MONGODB_URI
      if (/^MONGODB_URI=/m.test(content)) {
        content = content.replace(/^MONGODB_URI=.*/m, `MONGODB_URI="${trimmed}"`);
      } else {
        content += `\nMONGODB_URI="${trimmed}"`;
      }
      if (newDbName) {
        if (/^MONGODB_DB_NAME=/m.test(content)) {
          content = content.replace(/^MONGODB_DB_NAME=.*/m, `MONGODB_DB_NAME="${newDbName.trim()}"`);
        } else {
          content += `\nMONGODB_DB_NAME="${newDbName.trim()}"`;
        }
      }
      fs.writeFileSync(envPath, content.trim() + '\n', 'utf-8');
    } catch (e) {
      console.warn('Could not persist to .env:', e);
    }

    // Reset current active connection so next request reconnects
    if (mongoClient) {
      mongoClient.close().catch(() => {});
    }
    mongoClient = null;
    activeDb = null;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update MongoDB configuration' };
  }
}

export function getTargetDatabaseName(): string {
  return process.env.MONGODB_DB_NAME || 'alphaerp';
}

/**
 * Lazy initialization of MongoDB client
 */
export async function getMongoClient(): Promise<{ client: MongoClient; db: Db } | null> {
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
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
    });

    await mongoClient.connect();
    activeDb = mongoClient.db(dbName);
    console.log(`Connected to MongoDB database "${dbName}" successfully`);
    return { client: mongoClient, db: activeDb };
  } catch (err: any) {
    console.error('Failed to connect to MongoDB cluster:', err?.message || err);
    mongoClient = null;
    activeDb = null;
    throw new Error(`MongoDB connection failed: ${err?.message || err}`);
  }
}

/**
 * Test or retrieve current MongoDB status
 */
export async function getMongoStatus(): Promise<MongoDbStatus> {
  const uri = process.env.MONGODB_URI;
  const dbName = getTargetDatabaseName();

  if (!uri) {
    const localData = readLocalVault();
    const collections: Record<string, number> = {};
    let totalDocs = 0;

    for (const [colName, val] of Object.entries(localData)) {
      if (colName === '_meta') continue;
      if (Array.isArray(val)) {
        collections[colName] = val.length;
        totalDocs += val.length;
      } else if (typeof val === 'object' && val !== null) {
        collections[colName] = 1;
        totalDocs += 1;
      }
    }

    const lastMigrated = localData._meta?.migratedAt || lastKnownMigratedAt || undefined;

    return {
      configured: false,
      connected: true,
      mode: 'emulated_local',
      databaseName: dbName,
      maskedUri: undefined,
      collectionsCount: Object.keys(collections).length,
      collections,
      lastMigratedAt: lastMigrated,
      message: 'MONGODB_URI not detected in environment. Running in linked local emulated mode. Provide MONGODB_URI in Settings to connect to MongoDB Atlas.'
    };
  }

  const startTime = Date.now();
  try {
    const conn = await getMongoClient();
    if (!conn) {
      throw new Error('Client connection was null');
    }

    // Ping admin command
    await conn.db.command({ ping: 1 });
    const pingMs = Date.now() - startTime;

    // List collections and counts
    const collectionsCursor = await conn.db.listCollections().toArray();
    const collections: Record<string, number> = {};

    for (const col of collectionsCursor) {
      if (col.name.startsWith('system.')) continue;
      try {
        const count = await conn.db.collection(col.name).estimatedDocumentCount();
        collections[col.name] = count;
      } catch {
        collections[col.name] = 0;
      }
    }

    // Check meta collection for last migration timestamp
    try {
      const meta = await conn.db.collection('_meta_migration').findOne({ _id: 'latest_migration' as any });
      if (meta && meta.migratedAt) {
        lastKnownMigratedAt = meta.migratedAt;
      }
    } catch {}

    return {
      configured: true,
      connected: true,
      mode: 'mongodb_cluster',
      databaseName: dbName,
      maskedUri: maskMongoUri(uri),
      pingMs,
      collectionsCount: Object.keys(collections).length,
      collections,
      lastMigratedAt: lastKnownMigratedAt || undefined,
      message: `Successfully connected to MongoDB database "${dbName}"`
    };
  } catch (err: any) {
    const formatted = formatMongoError(err);
    return {
      configured: true,
      connected: false,
      mode: 'mongodb_cluster',
      databaseName: dbName,
      maskedUri: maskMongoUri(uri),
      collectionsCount: 0,
      collections: {},
      error: formatted.error,
      ipWhitelistRequired: formatted.ipWhitelistRequired,
    };
  }
}

/**
 * All Master Collections
 */
export const MASTER_COLLECTIONS = [
  'systemSettings',
  'clients',
  'vendors',
  'inventory',
  'salesReps',
  'costCenters',
  'taxSlabs',
  'paymentTerms',
  'chartOfAccounts',
  'employees',
  'departments',
  'designationGrades',
  'shifts',
  'companyHolidays',
  'policyDocuments',
  'biometricDevices',
  'trainingCourses',
  'numberSeries',
  'reportTemplates'
];

/**
 * All Transaction Collections
 */
export const TRANSACTION_COLLECTIONS = [
  'leads',
  'quotes',
  'projects',
  'workOrders',
  'prs',
  'pos',
  'payments',
  'goodsReceiptNotes',
  'journalVouchers',
  'attendance',
  'timesheets',
  'leaves',
  'payrollMonths',
  'resignations',
  'appraisals',
  'grievances',
  'auditLogs'
];

/**
 * Migrate full database payload (all master + transaction collections) to MongoDB
 */
export async function migrateFullDatabaseToMongo(payload: Record<string, any>): Promise<MongoMigrationResult> {
  const startTime = Date.now();
  const dbName = getTargetDatabaseName();
  const uri = process.env.MONGODB_URI;

  const collectionCounts: Record<string, number> = {};
  const collectionsReport: CollectionMigrationReport[] = [];
  let totalMaster = 0;
  let totalTransaction = 0;

  const migratedAt = new Date().toISOString();
  lastKnownMigratedAt = migratedAt;

  // 1. If real MongoDB URI is available, write directly to MongoDB collections
  if (uri) {
    const conn = await getMongoClient();
    if (!conn) {
      throw new Error('Could not establish connection to MongoDB');
    }

    const db = conn.db;

    // Helper to sanitize document for Mongo (ensure valid _id)
    const sanitizeDoc = (doc: any, index: number, colName: string) => {
      if (!doc || typeof doc !== 'object') return { _id: `${colName}_${index}`, value: doc };
      const clone = { ...doc };
      if (!clone._id && clone.id) {
        clone._id = String(clone.id);
      } else if (!clone._id) {
        clone._id = `${colName}_${index}_${Date.now()}`;
      }
      return clone;
    };

    // Process all collections present in payload
    for (const [colName, val] of Object.entries(payload)) {
      if (colName === '_meta' || colName === 'currentUser' || colName === 'isAuthenticated') continue;

      try {
        const mongoCol = db.collection(colName);

        if (Array.isArray(val)) {
          if (val.length > 0) {
            const docs = val.map((item, idx) => sanitizeDoc(item, idx, colName));
            // Replace collection contents for full clean migration
            await mongoCol.deleteMany({});
            await mongoCol.insertMany(docs);
            collectionCounts[colName] = docs.length;
            collectionsReport.push({ collection: colName, count: docs.length, status: 'migrated' });
          } else {
            collectionCounts[colName] = 0;
            collectionsReport.push({ collection: colName, count: 0, status: 'skipped' });
          }
        } else if (typeof val === 'object' && val !== null) {
          // Singleton object like systemSettings
          const doc = { ...val, _id: 'global_config' };
          await mongoCol.replaceOne({ _id: 'global_config' as any }, doc, { upsert: true });
          collectionCounts[colName] = 1;
          collectionsReport.push({ collection: colName, count: 1, status: 'migrated' });
        }
      } catch (err: any) {
        console.error(`Error migrating collection ${colName}:`, err);
        throw new Error(`Failed to migrate collection ${colName}: ${err.message}`);
      }
    }

    // Record migration metadata in MongoDB
    try {
      await db.collection('_meta_migration').replaceOne(
        { _id: 'latest_migration' as any },
        {
          _id: 'latest_migration',
          migratedAt,
          source: 'AlphaERP Firebase & Active State',
          databaseName: dbName,
          collectionCounts,
          durationMs: Date.now() - startTime
        },
        { upsert: true }
      );
    } catch (err) {
      console.warn('Could not record migration meta:', err);
    }
  } else {
    // 2. Fallback: Write to local persistent vault
    const localStore = {
      _meta: {
        migratedAt,
        source: 'AlphaERP Firebase & Active State (Local Emulated)',
        databaseName: dbName,
      },
      ...payload
    };

    writeLocalVault(localStore);

    for (const [colName, val] of Object.entries(payload)) {
      if (colName === '_meta' || colName === 'currentUser' || colName === 'isAuthenticated') continue;
      const count = Array.isArray(val) ? val.length : (typeof val === 'object' && val !== null ? 1 : 0);
      collectionCounts[colName] = count;
      collectionsReport.push({ collection: colName, count, status: count > 0 ? 'migrated' : 'skipped' });
    }
  }

  // Calculate totals
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
    target: uri ? `MongoDB Cluster (${maskMongoUri(uri)})` : 'Local Emulated MongoDB Store (Ready for Atlas URI)'
  };
}

/**
 * Export all collections from MongoDB for restore
 */
export async function exportFullDatabaseFromMongo(): Promise<{
  success: boolean;
  data: Record<string, any>;
  exportedAt: string;
  source: string;
}> {
  const uri = process.env.MONGODB_URI;
  const exportedAt = new Date().toISOString();

  if (uri) {
    const conn = await getMongoClient();
    if (!conn) {
      throw new Error('Could not establish connection to MongoDB');
    }

    const db = conn.db;
    const collectionsCursor = await db.listCollections().toArray();
    const data: Record<string, any> = {};

    for (const col of collectionsCursor) {
      if (col.name.startsWith('system.') || col.name === '_meta_migration') continue;

      const docs = await db.collection(col.name).find({}).toArray();

      // If singleton collection (like systemSettings with single global_config doc)
      if (col.name === 'systemSettings') {
        const found = docs.find((d: any) => d._id === 'global_config') || docs[0];
        if (found) {
          const { _id, ...rest } = found;
          data[col.name] = rest;
        }
      } else {
        // Array of items
        data[col.name] = docs.map((d: any) => {
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
    // Read from local vault
    const local = readLocalVault();
    const { _meta, ...rest } = local;
    return {
      success: true,
      data: rest,
      exportedAt,
      source: 'Local Emulated MongoDB Store'
    };
  }
}

/**
 * Fetch all projects directly from MongoDB
 */
export async function getProjectsFromMongo(): Promise<{
  success: boolean;
  projects: any[];
  count: number;
  source: string;
  error?: string;
}> {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      const conn = await getMongoClient();
      if (!conn) throw new Error('Could not establish connection to MongoDB');
      const docs = await conn.db.collection('projects').find({}).toArray();
      const projects = docs.map((d: any) => {
        const { _id, ...rest } = d;
        return { id: rest.id || _id, ...rest };
      });
      return {
        success: true,
        projects,
        count: projects.length,
        source: `MongoDB Atlas (${getTargetDatabaseName()})`
      };
    } catch (err: any) {
      console.error('Failed to get projects from MongoDB:', err);
      const local = readLocalVault();
      return {
        success: true,
        projects: local.projects || [],
        count: (local.projects || []).length,
        source: 'Local Emulated Fallback',
        error: err.message
      };
    }
  } else {
    const local = readLocalVault();
    return {
      success: true,
      projects: local.projects || [],
      count: (local.projects || []).length,
      source: 'Local Emulated Store'
    };
  }
}

/**
 * Persist/upsert full projects list to MongoDB
 */
export async function saveProjectsToMongo(projects: any[]): Promise<{
  success: boolean;
  count: number;
  savedAt: string;
  target: string;
}> {
  const savedAt = new Date().toISOString();
  const uri = process.env.MONGODB_URI;

  if (uri) {
    const conn = await getMongoClient();
    if (!conn) throw new Error('Could not establish connection to MongoDB');
    const db = conn.db;
    const mongoCol = db.collection('projects');

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
      // Upsert each project
      const operations = docs.map((doc) => ({
        replaceOne: {
          filter: { _id: doc._id as any },
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
      target: 'Local Emulated MongoDB Store'
    };
  }
}

/**
 * Upsert a single project in MongoDB
 */
export async function saveSingleProjectToMongo(project: any): Promise<{
  success: boolean;
  projectId: string;
  savedAt: string;
  target: string;
}> {
  const savedAt = new Date().toISOString();
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
    if (!conn) throw new Error('Could not establish connection to MongoDB');
    const db = conn.db;
    await db.collection('projects').replaceOne({ _id: docId as any }, doc, { upsert: true });

    return {
      success: true,
      projectId: docId,
      savedAt,
      target: `MongoDB Atlas Database (${getTargetDatabaseName()})`
    };
  } else {
    const local = readLocalVault();
    const existing = local.projects || [];
    const idx = existing.findIndex((p: any) => p.id === docId);
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
      target: 'Local Emulated MongoDB Store'
    };
  }
}
