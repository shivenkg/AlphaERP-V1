import { createClient } from '@insforge/sdk';

// Base URL and API key from project configuration
export const INSFORGE_BASE_URL = 'https://as2hwz72.us-east.insforge.app';
export const INSFORGE_ANON_KEY = 'ik_6881c27472b6e731d67e98297480dce2';

/**
 * InsForge SDK Client Instance for AlphaERP
 */
export const insforge = createClient({
  baseUrl: INSFORGE_BASE_URL,
  anonKey: INSFORGE_ANON_KEY
});

export default insforge;
