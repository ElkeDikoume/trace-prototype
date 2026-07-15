// Root of the Phase 2/3 (v2-demo) mobile shell. Reached via the ?v2 URL flag
// from main.jsx; the existing desktop app remains the default experience.
// Providers (theme, toast, i18n) wrap the Shell, which owns auth, the case
// list, and screen routing.
import './theme.css';
import './lib/i18n.js'; // side-effect: initialise i18next
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PhoneFrame from './components/PhoneFrame.jsx';
import StatusBar from './components/StatusBar.jsx';
import AiStrip from './components/AiStrip.jsx';
import AiChatScreen from './screens/AiChatScreen.jsx';
import BottomNav from './components/BottomNav.jsx';
import WelcomeScreen from './screens/WelcomeScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';
import IntakeStartScreen from './screens/IntakeStartScreen.jsx';
import ActiveIntakeScreen from './screens/ActiveIntakeScreen.jsx';
import DocsScreen from './screens/DocsScreen.jsx';

import { ThemeProvider, useTheme } from './lib/ThemeContext.jsx';
import { ToastProvider, useToast } from './lib/ToastContext.jsx';
import { isRtl } from './lib/i18n.js';
import { fetchCases, flushQueue } from './lib/cases.js';
import {
  getSessionProfile,
  isDemo,
  demoProfile,
  continueAsDemo,
  signInWithMicrosoft,
  AzureNotConfiguredError
} from './lib/auth.js';
import { mockCases, mockStructuredFields, mockRiskIndicators, nextCaseId } from './mockData.js';

export default function TraceV2App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </ThemeProvider>
  );
}

// Screens once authed: 'dashboard' | 'intakeStart' | 'activeIntake' | 'docs'
function Shell() {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const { show } = useToast();
  const dir = isRtl(i18n.language) ? 'rtl' : 'ltr';

  const [profile, setProfile] = useState(null);
  const [, setAuthChecked] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const [screen, setScreen] = useState('dashboard');
  const [activeIntake, setActiveIntake] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [cases, setCases] = useState([]);
  const resetRan = useRef(false);

  // ?reset — clear service workers + local state, then hard-reload to a clean
  // URL. Behaviour unchanged from Phase 2. Guarded so it runs once.
  useEffect(() => {
    if (resetRan.current) return;
    resetRan.current = true;
    if (window.location.search.includes('reset')) {
      navigator.serviceWorker?.getRegistrations?.().then((regs) => regs.forEach((r) => r.unregister()));
      localStorage.clear();
      window.location.replace(window.location.pathname + '?v2');
    }
  }, []);

  // Bootstrap the current caseworker: a real Supabase session, else a demo
  // session flag, else nobody (show the Welcome sign-in).
  useEffect(() => {
    (async () => {
      try {
        if (isDemo()) {
          setProfile(demoProfile());
        } else {
          const p = await getSessionProfile();
          if (p) setProfile(p);
        }
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // Flush any intakes queued while offline, once per load.
  useEffect(() => {
    flushQueue()
      .then((r) => {
        if (r.flushed > 0) show(`Synced ${r.flushed} offline intake${r.flushed > 1 ? 's' : ''}.`, 'success');
      })
      .catch(() => {});
  }, []);

  // Load the caseworker's cases once we know who they are.
  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    fetchCases().then((rows) => {
      if (!cancelled) setCases(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  async function handleMicrosoft() {
    setSigningIn(true);
    try {
      const p = await signInWithMicrosoft();
      setProfile(p);
      setScreen('dashboard');
    } catch (err) {
      if (err instanceof AzureNotConfiguredError || err?.code === 'not_configured') {
        show('Microsoft SSO not yet configured — contact your administrator.', 'amber');
      } else {
        show(err?.message || 'Sign-in failed. Please try again.', 'error');
      }
    } finally {
      setSigningIn(false);
    }
  }

  function handleDemo() {
    setProfile(continueAsDemo());
    setScreen('dashboard');
  }

  function openExistingCase(caseId) {
    const found = cases.find((c) => c.id === caseId) || mockCases.find((c) => c.id === caseId);
    setActiveIntake({
      caseId,
      notes: found?.notes || '',
      riskLevel: found?.riskLevel || 'medium',
      ageRange: found?.ageRange || '',
      sex: found?.sex || ''
    });
    setScreen('activeIntake');
  }

  function startNewCase() {
    setActiveIntake({ caseId: nextCaseId(), notes: '', riskLevel: 'medium', ageRange: '', sex: '' });
    setScreen('activeIntake');
  }

  // Refresh the case list after a save (e.g. when synced to Supabase).
  function handleSavedCase() {
    fetchCases().then(setCases);
  }

  function handleNav(tab) {
    if (tab === 'cases') setScreen('dashboard');
    else if (tab === 'intake') setScreen('intakeStart');
    else if (tab === 'ai') setAiOpen(true);
    else if (tab === 'docs') setScreen('docs');
  }

  // Case grounding the AI chat: the active intake if any, else the most recent.
  const contextCase = activeIntake
    ? {
        ...(cases.find((c) => c.id === activeIntake.caseId) || {}),
        id: activeIntake.caseId,
        notes: activeIntake.notes,
        riskLevel: activeIntake.riskLevel
      }
    : cases[0] || mockCases[0];
  const aiContext = {
    caseRecord: contextCase,
    structuredFields: mockStructuredFields,
    riskIndicators: mockRiskIndicators
  };

  const activeTab =
    screen === 'dashboard'
      ? 'cases'
      : screen === 'intakeStart' || screen === 'activeIntake'
        ? 'intake'
        : screen === 'docs'
          ? 'docs'
          : 'cases';

  // Not signed in yet -> Welcome (splash + sign-in). While the async auth check
  // is still running we also show Welcome; it resolves to the shell if a
  // session is found.
  if (!profile) {
    return (
      <PhoneFrame theme={theme} dir={dir}>
        <WelcomeScreen onMicrosoft={handleMicrosoft} onDemo={handleDemo} signingIn={signingIn} />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame theme={theme} dir={dir}>
      <StatusBar />

      {screen === 'dashboard' && (
        <DashboardScreen
          profile={profile}
          cases={cases}
          onOpenCase={openExistingCase}
          onSeeAll={() => setScreen('intakeStart')}
        />
      )}
      {screen === 'intakeStart' && (
        <IntakeStartScreen cases={cases} onOpenCase={openExistingCase} onNewCase={startNewCase} />
      )}
      {screen === 'activeIntake' && activeIntake && (
        <ActiveIntakeScreen
          caseId={activeIntake.caseId}
          initialNotes={activeIntake.notes}
          riskLevel={activeIntake.riskLevel}
          ageRange={activeIntake.ageRange}
          sex={activeIntake.sex}
          onBack={() => setScreen('dashboard')}
          onSaved={handleSavedCase}
        />
      )}
      {screen === 'docs' && <DocsScreen />}

      {/* Persistent chrome */}
      <AiStrip onOpen={() => setAiOpen(true)} />
      <BottomNav active={activeTab} onNavigate={handleNav} />

      {aiOpen && <AiChatScreen caseContext={aiContext} onClose={() => setAiOpen(false)} />}
    </PhoneFrame>
  );
}
