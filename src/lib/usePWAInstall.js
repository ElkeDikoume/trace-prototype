import { useEffect, useState } from 'react';

// Captures the browser's deferred PWA install prompt so the header can offer
// an explicit "Install App" button instead of relying on the browser's own
// (often hidden) install affordance — useful for caseworkers installing
// TRACE for offline field use.
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setInstallPrompt(e);
    }
    function handleAppInstalled() {
      setInstallPrompt(null);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    // The captured event can only be used once — clear it regardless of the
    // user's choice so a stale prompt() call never fires again.
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return { installPrompt, promptInstall };
}
