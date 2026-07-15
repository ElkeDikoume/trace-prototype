// Azure AD (Microsoft Entra) MSAL configuration for the v2 shell.
// The client id comes from VITE_AZURE_CLIENT_ID (.env.local) — left blank for
// now until the Azure app registration exists. isAzureConfigured lets the UI
// show the Microsoft button but degrade gracefully (toast) until it's set.
export const AZURE_CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID || '';
export const isAzureConfigured = Boolean(AZURE_CLIENT_ID);

export const msalConfig = {
  auth: {
    clientId: AZURE_CLIENT_ID,
    // 'common' allows both org and personal Microsoft accounts. Swap for a
    // specific tenant id once the app registration is created.
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '/'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

// Scopes requested at login. openid/profile/email yield the name + email claims
// used for the greeting and initials.
export const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};
