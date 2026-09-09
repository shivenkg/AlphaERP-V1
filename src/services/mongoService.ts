import {
  MongoDbStatus,
  MongoMigrationResult,
  MongoRestoreResult
} from '../types';
import { storageService } from './storageService';

export class MongoService {
  private static instance: MongoService;

  public static getInstance(): MongoService {
    if (!MongoService.instance) {
      MongoService.instance = new MongoService();
    }
    return MongoService.instance;
  }

  /**
   * Fetch current MongoDB connection status and collection document tallies
   */
  public async getStatus(): Promise<MongoDbStatus> {
    try {
      const res = await fetch('/api/mongodb/status');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}: Failed to get MongoDB status`);
      }
      return await res.json();
    } catch (err: any) {
      return {
        configured: false,
        connected: false,
        mode: 'emulated_local',
        databaseName: 'alphaerp',
        collectionsCount: 0,
        collections: {},
        error: err?.message || 'Failed to reach MongoDB backend service'
      };
    }
  }

  /**
   * Test live ping connectivity to MongoDB
   */
  public async testConnection(): Promise<{
    success: boolean;
    pingMs?: number;
    databaseName?: string;
    mode?: string;
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/mongodb/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Connection ping failed');
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error connecting to MongoDB backend'
      };
    }
  }

  /**
   * Update MongoDB connection URI or target database
   */
  public async updateConfig(uri: string, databaseName?: string): Promise<{
    success: boolean;
    status?: MongoDbStatus;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/mongodb/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri, databaseName })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update MongoDB configuration');
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to update MongoDB configuration'
      };
    }
  }

  /**
   * Migrate all data from Firebase / active local ERP database to MongoDB
   */
  public async migrateToMongoDB(customPayload?: any): Promise<MongoMigrationResult> {
    const payload = customPayload || storageService.getAllData();

    // Log start of migration in audit logs
    storageService.logAudit(
      'SYNC_SHEETS',
      'SYSTEM_SETTINGS',
      'MONGODB_MIGRATE',
      'Initiated database migration from Firebase/Active DB to MongoDB'
    );

    const res = await fetch('/api/mongodb/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payload })
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Database migration to MongoDB failed');
    }

    storageService.logAudit(
      'SYNC_SHEETS',
      'SYSTEM_SETTINGS',
      'MONGODB_MIGRATED',
      `Migrated ${result.totalMasterRecords} master records and ${result.totalTransactionRecords} transaction records to MongoDB (${result.databaseName}) in ${result.durationMs}ms.`
    );

    storageService.addNotification(
      'MongoDB Migration Complete',
      `Successfully migrated ${result.totalMasterRecords} master and ${result.totalTransactionRecords} transaction records to MongoDB (${result.databaseName}).`,
      'success',
      'system'
    );

    return result;
  }

  /**
   * Restore all database records from MongoDB into active AlphaERP state
   */
  public async restoreFromMongoDB(): Promise<MongoRestoreResult> {
    // 1. Guarantee safety: take an automatic safety snapshot before restoring
    storageService.recordCriticalSnapshot(
      'MANUAL_USER',
      'System',
      'Pre-MongoDB Restore Automatic Safety Snapshot'
    );

    const res = await fetch('/api/mongodb/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const exportData = await res.json();
    if (!res.ok || !exportData.success || !exportData.data) {
      throw new Error(exportData.error || 'Failed to fetch restore snapshot from MongoDB');
    }

    // 2. Import into active storage
    const report = storageService.importFullDatabaseWithReport(exportData.data);
    if (!report.success) {
      throw new Error(report.error || 'Failed to populate AlphaERP state from MongoDB payload');
    }

    const restoredAt = new Date().toISOString();
    const combinedCounts: Record<string, number> = {
      ...report.masterCounts,
      ...report.transactionCounts
    };

    storageService.logAudit(
      'UPDATE',
      'SYSTEM_SETTINGS',
      'MONGODB_RESTORE',
      `Restored ${report.totalMaster} master records and ${report.totalTransactions} transaction records from MongoDB (${exportData.source}).`
    );

    storageService.addNotification(
      'Restored from MongoDB',
      `Successfully restored ${report.totalMaster} master and ${report.totalTransactions} transaction records from MongoDB into AlphaERP.`,
      'success',
      'system'
    );

    return {
      success: true,
      totalMasterRecords: report.totalMaster,
      totalTransactionRecords: report.totalTransactions,
      collectionsRestored: combinedCounts,
      restoredAt,
      source: exportData.source || 'MongoDB Database'
    };
  }

  /**
   * Fetch all projects stored in MongoDB Atlas
   */
  public async getProjects(): Promise<{
    success: boolean;
    projects: any[];
    count: number;
    source: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/mongodb/projects');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}: Failed to fetch projects from MongoDB`);
      }
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        projects: [],
        count: 0,
        source: 'Error',
        error: err.message
      };
    }
  }

  /**
   * Persist active projects list into MongoDB Atlas
   */
  public async saveProjects(projects: any[]): Promise<{
    success: boolean;
    count: number;
    savedAt: string;
    target: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/mongodb/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save projects to MongoDB');
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        savedAt: new Date().toISOString(),
        target: 'Error',
        error: err.message
      };
    }
  }

  /**
   * Upsert single project document into MongoDB Atlas
   */
  public async saveSingleProject(project: any): Promise<{
    success: boolean;
    projectId: string;
    savedAt: string;
    target: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/mongodb/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upsert project to MongoDB');
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        projectId: project.id || '',
        savedAt: new Date().toISOString(),
        target: 'Error',
        error: err.message
      };
    }
  }
}

export const mongoService = MongoService.getInstance();
export default mongoService;

