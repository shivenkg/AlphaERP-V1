import { Project, GoogleSheetsSyncConfig, MongoDbStatus } from '../types';
import { mongoService } from './mongoService';
import { googleSheetsService } from './googleSheets';
import { storageService } from './storageService';

export interface UnifiedSyncResult {
  success: boolean;
  syncedAt: string;
  mongo: {
    success: boolean;
    count: number;
    target: string;
    message: string;
    savedAt?: string;
  };
  sheets: {
    success: boolean;
    linked: boolean;
    spreadsheetUrl?: string | null;
    spreadsheetName?: string;
    message: string;
    error?: string;
  };
}

export class UnifiedProjectSyncService {
  private static instance: UnifiedProjectSyncService;

  public static getInstance(): UnifiedProjectSyncService {
    if (!UnifiedProjectSyncService.instance) {
      UnifiedProjectSyncService.instance = new UnifiedProjectSyncService();
    }
    return UnifiedProjectSyncService.instance;
  }

  /**
   * Save all active projects into MongoDB Atlas
   */
  public async saveProjectsToMongo(customProjects?: Project[]): Promise<{
    success: boolean;
    count: number;
    savedAt: string;
    target: string;
    error?: string;
  }> {
    const list = customProjects || storageService.getProjects();
    const result = await mongoService.saveProjects(list);
    if (result.success) {
      storageService.logAudit(
        'UPDATE',
        'PROJECT',
        'MONGODB_SYNC',
        `Persisted ${result.count} project records into MongoDB Atlas (${result.target}).`
      );
    }
    return result;
  }

  /**
   * Hydrate / fetch latest projects directly from MongoDB Atlas into active state
   */
  public async loadProjectsFromMongo(): Promise<{
    success: boolean;
    projects: Project[];
    count: number;
    source: string;
    error?: string;
  }> {
    const res = await mongoService.getProjects();
    if (res.success && Array.isArray(res.projects) && res.projects.length > 0) {
      storageService.setProjects(res.projects as Project[]);
      storageService.logAudit(
        'UPDATE',
        'PROJECT',
        'MONGODB_HYDRATE',
        `Hydrated ${res.projects.length} project records from ${res.source} into active AlphaERP state.`
      );
      return {
        success: true,
        projects: res.projects as Project[],
        count: res.projects.length,
        source: res.source
      };
    }
    return {
      success: false,
      projects: [],
      count: 0,
      source: res.source || 'MongoDB',
      error: res.error || 'No project records found in MongoDB'
    };
  }

  /**
   * Sync projects to linked Google Sheet
   */
  public async syncProjectsToGoogleSheet(targetSheetId?: string): Promise<{
    success: boolean;
    linked: boolean;
    spreadsheetUrl?: string | null;
    spreadsheetName?: string;
    message: string;
    error?: string;
  }> {
    const sheetsConfig = storageService.getGoogleSheetsConfig();
    const sheetId = targetSheetId || sheetsConfig.spreadsheetId;

    if (!sheetId) {
      return {
        success: false,
        linked: false,
        message: 'No Google Sheet currently linked. Please link a Google Sheet in Admin Settings or click "Sync BOQ".'
      };
    }

    try {
      const result = await googleSheetsService.syncToGoogleSheet(sheetId);
      const updatedConfig = storageService.getGoogleSheetsConfig();
      return {
        success: true,
        linked: true,
        spreadsheetUrl: result.spreadsheetUrl,
        spreadsheetName: updatedConfig.spreadsheetName || 'Master Database Spreadsheet',
        message: `Successfully synchronized projects to linked Google Sheet.`
      };
    } catch (err: any) {
      return {
        success: false,
        linked: true,
        message: err.message || 'Failed to sync with linked Google Sheet',
        error: err.message
      };
    }
  }

  /**
   * Unified Dual-Sync: Keep project data in MongoDB and sync the same with linked Google Sheet!
   */
  public async syncProjectsToBoth(customProjects?: Project[], targetSheetId?: string): Promise<UnifiedSyncResult> {
    const syncedAt = new Date().toISOString();
    const projectsToSync = customProjects || storageService.getProjects();

    // 1. Persist Projects to MongoDB Atlas
    let mongoSuccess = false;
    let mongoCount = projectsToSync.length;
    let mongoTarget = 'MongoDB Atlas';
    let mongoMessage = '';
    let mongoSavedAt = syncedAt;

    try {
      const mongoRes = await this.saveProjectsToMongo(projectsToSync);
      mongoSuccess = mongoRes.success;
      mongoCount = mongoRes.count || projectsToSync.length;
      mongoTarget = mongoRes.target || 'MongoDB Atlas';
      mongoSavedAt = mongoRes.savedAt || syncedAt;
      mongoMessage = mongoSuccess
        ? `Successfully saved ${mongoCount} project records to ${mongoTarget}`
        : mongoRes.error || 'Failed to save projects to MongoDB';
    } catch (err: any) {
      mongoSuccess = false;
      mongoMessage = err.message || 'Error communicating with MongoDB backend';
    }

    // 2. Synchronize to Linked Google Sheet
    let sheetsSuccess = false;
    let sheetsLinked = false;
    let spreadsheetUrl: string | null = null;
    let spreadsheetName: string | undefined;
    let sheetsMessage = '';
    let sheetsError: string | undefined;

    const sheetsConfig = storageService.getGoogleSheetsConfig();
    const sheetId = targetSheetId || sheetsConfig.spreadsheetId;

    if (!sheetId) {
      sheetsLinked = false;
      sheetsMessage = 'Google Sheet not yet linked. MongoDB persistence succeeded; link a Sheet anytime to sync both.';
    } else {
      sheetsLinked = true;
      try {
        const sheetRes = await this.syncProjectsToGoogleSheet(sheetId);
        sheetsSuccess = sheetRes.success;
        spreadsheetUrl = sheetRes.spreadsheetUrl || sheetsConfig.spreadsheetUrl;
        spreadsheetName = sheetRes.spreadsheetName || sheetsConfig.spreadsheetName;
        sheetsMessage = sheetRes.message;
        sheetsError = sheetRes.error;
      } catch (err: any) {
        sheetsSuccess = false;
        sheetsError = err.message;
        sheetsMessage = err.message || 'Google Sheet sync encountered an error';
      }
    }

    // 3. Log comprehensive audit and notification
    const totalSuccess = mongoSuccess && (!sheetsLinked || sheetsSuccess);
    storageService.logAudit(
      'SYNC_SHEETS',
      'PROJECT',
      'DUAL_SYNC',
      `Executed unified project sync: MongoDB Atlas (${mongoSuccess ? 'OK' : 'FAIL'}) + Google Sheet (${sheetsLinked ? (sheetsSuccess ? 'OK' : 'FAIL') : 'UNLINKED'}).`
    );

    storageService.addNotification(
      'Project Dual-Sync Completed',
      `MongoDB: ${mongoSuccess ? `${mongoCount} projects kept in cluster` : 'Error'}. Google Sheet: ${sheetsLinked ? (sheetsSuccess ? 'Synced' : 'Error') : 'Not linked'}.`,
      totalSuccess ? 'success' : 'alert',
      'projects'
    );

    return {
      success: totalSuccess,
      syncedAt,
      mongo: {
        success: mongoSuccess,
        count: mongoCount,
        target: mongoTarget,
        message: mongoMessage,
        savedAt: mongoSavedAt
      },
      sheets: {
        success: sheetsSuccess,
        linked: sheetsLinked,
        spreadsheetUrl,
        spreadsheetName,
        message: sheetsMessage,
        error: sheetsError
      }
    };
  }
}

export const unifiedProjectSyncService = UnifiedProjectSyncService.getInstance();
export default unifiedProjectSyncService;
