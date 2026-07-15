// Auth for the v2 shell.
// - Real path: MSAL popup -> Azure ID token -> supabase.auth.signInWithIdToken
//   -> upsert the caseworker's profiles row. Requires VITE_AZURE_CLIENT_ID.
// - Demo path: "Continue as demo user" bypasses auth and uses the mock persona
//   (existing behaviour), stored under the tracev2_session flag.
import { PublicClientApplication } from '@azure/msal-browser';
import { supabase } from './supabase.js';
import { msalConfig, loginRequest, isAzureConfigured } from './msalConfig.js';
import { caseworkerName, caseworkerInitials } from '../mockData.js';

const DEMO_KEY = 'tracev2_session';

export function initialsFrom(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || parts[0][0].toUpperCase();
}

// Lazily create + initialise a single MSAL instance.
let msalInstance = null;
async function getMsal() {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }
  return msalInstance;
}

// Thrown when the Microsoft button is clicked before Azure is configured, so the
// UI can show the "not yet configured" toast.
export class AzureNotConfiguredError extends Error {
  constructor() {
    super('Microsoft SSO not yet configured');
    this.code = 'not_configured';
  }
}

// Real Microsoft sign-in. Returns a normalised profile { full_name, email,
// initials }. Throws AzureNotConfiguredError when no client id is set.
export async function signInWithMicrosoft() {
  if (!isAzureConfigured) throw new AzureNotConfiguredError();

  const msal = await getMsal();
  const result = await msal.loginPopup(loginRequest);
  const claims = result.idTokenClaims || {};
  const fullName = claims.name || result.account?.name || 'Caseworker';
  const email = claims.preferred_username || claims.email || result.account?.username || '';
  const profile = { full_name: fullName, email, initials: initialsFrom(fullName) };

  // Exchange the Microsoft ID token for a Supabase session.
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'azure',
      token: result.idToken
    });
    if (error) throw error;

    // Create/update the caseworker's profile row.
    const uid = data?.user?.id;
    if (uid) {
      await supabase
        .from('profiles')
        .upsert({ id: uid, full_name: fullName, initials: profile.initials }, { onConflict: 'id' });
    }
  }

  clearDemo();
  return profile;
}

// Resolve the current signed-in caseworker from an existing Supabase session
// (e.g. on reload). Returns a profile or null.
export async function getSessionProfile() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;
  if (!user) return null;

  let fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Caseworker';
  let initials = initialsFrom(fullName);
  // Prefer the stored profile row if present.
  const { data: row } = await supabase.from('profiles').select('full_name, initials').eq('id', user.id).maybeSingle();
  if (row?.full_name) {
    fullName = row.full_name;
    initials = row.initials || initialsFrom(fullName);
  }
  return { full_name: fullName, email: user.email || '', initials };
}

export async function signOut() {
  clearDemo();
  if (supabase) await supabase.auth.signOut();
}

// --- Demo (guest) session -------------------------------------------------
export function continueAsDemo() {
  localStorage.setItem(DEMO_KEY, '1');
  return demoProfile();
}
export function isDemo() {
  return localStorage.getItem(DEMO_KEY) === '1';
}
export function clearDemo() {
  localStorage.removeItem(DEMO_KEY);
}
export function demoProfile() {
  return { full_name: caseworkerName, email: '', initials: caseworkerInitials, demo: true };
}
