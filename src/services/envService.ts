import { AdminEnvSummary, AdminEnvTestResult } from '../types';

class EnvService {
  private cacheKey = 'alphaerp_admin_env_cache_v1';

  /**
   * Fetch environment variables and server metadata from the backend API
   */
  public async fetchEnvSummary(): Promise<AdminEnvSummary> {
    try {
      const res = await fetch('/api/admin/env', {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data: AdminEnvSummary = await res.json();
      // Cache for offline/preview fallback
      try {
        localStorage.setItem(this.cacheKey, JSON.stringify(data));
      } catch {}
      return data;
    } catch (err: any) {
      console.warn('Could not fetch from /api/admin/env, checking local cache:', err?.message);
      const cached = this.getCachedSummary();
      if (cached) {
        return cached;
      }
      throw err;
    }
  }

  /**
   * Save and apply changes to environment variables in server runtime and .env file
   */
  public async saveEnvVariables(
    variables: Record<string, string>,
    removedKeys: string[] = []
  ): Promise<{ success: boolean; updatedCount: number; persistedToFile: boolean; message: string; error?: string }> {
    const res = await fetch('/api/admin/env', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ variables, removedKeys }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || data?.message || `Failed to save environment variables (HTTP ${res.status})`);
    }

    return data;
  }

  /**
   * Test/validate a specific environment variable (e.g. GEMINI_API_KEY, MONGODB_URI, SMTP_HOST)
   */
  public async testEnvVariable(key: string, value?: string): Promise<AdminEnvTestResult> {
    const res = await fetch('/api/admin/env/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ key, value }),
    });

    const data = await res.json();
    return data;
  }

  /**
   * Trigger direct browser download of the formatted .env file
   */
  public downloadEnvFile(): void {
    const anchor = document.createElement('a');
    anchor.href = '/api/admin/env/raw';
    anchor.download = '.env';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  /**
   * Parse arbitrary .env text (e.g. when user pastes a .env snippet)
   */
  public parseEnvText(rawText: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = rawText.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip comments or empty lines
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].toUpperCase();
        let val = match[2].trim();

        // Strip surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }

        // Unescape escaped quotes/slashes
        val = val.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
        result[key] = val;
      }
    }

    return result;
  }

  private getCachedSummary(): AdminEnvSummary | null {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return null;
  }
}

export const envService = new EnvService();
