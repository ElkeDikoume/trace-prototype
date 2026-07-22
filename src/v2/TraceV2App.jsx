// Root of the Phase 2-4 (v2-demo) mobile shell. Reached via the ?v2 URL flag
// from main.jsx; the existing desktop app remains the default experience.
// Providers (theme, toast, i18n) wrap the Shell, which owns auth, the case
// list, supervisor mode, and screen routing.
import './theme.css';
import './lib/i18n.js'; // side-effect: initialise i18next
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PhoneFrame from './components/PhoneFrame.jsx';
import StatusBar from './components/StatusBar.jsx';
import AiChatScreen from './screens/AiChatScreen.jsx';
import BottomNav from './components/BottomNav.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import TutorialOverlay from './components/TutorialOverlay.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import WelcomeScreen from './screens/WelcomeScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';
import IntakeStartScreen from './screens/IntakeStartScreen.jsx';
import ActiveIntakeScreen from './screens/ActiveIntakeScreen.jsx';
import CaseViewScreen from './screens/CaseViewScreen.jsx';
import RecordsScreen from './screens/RecordsScreen.jsx';
import SubmissionScreen from './screens/SubmissionScreen.jsx';
import WellnessCheckModal, { isWellnessDue } from './components/WellnessCheckModal.jsx';

import { ThemeProvider, useTheme } from './lib/ThemeContext.jsx';
import { ToastProvider, useToast } from './lib/ToastContext.jsx';
import { isRtl } from './lib/i18n.js';
import { fetchCases, flushQueue } from './lib/cases.js';
import { mergeCases, setStatus, addSession } from './lib/caseStore.js';
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
        <ErrorBoundary>
          <Shell />
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

// Screens once authed:
// 'dashboard' | 'intakeStart' | 'activeIntake' | 'caseView' | 'records' | 'submission'
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
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [supervisorMode, setSupervisorMode] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  // true when the chat was opened from inside a case (grounded in that case);
  // false when opened from the AI tab, which gets the generic opening state.
  const [aiScoped, setAiScoped] = useState(false);
  const [cases, setCases] = useState([]);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [wellnessOpen, setWellnessOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [demoDocOpen, setDemoDocOpen] = useState(null); // { caseId, docType, content }
  const [submittedCase, setSubmittedCase] = useState(null); // case shown on the submission screen
  const resetRan = useRef(false);

  // ?reset — clears local state, then reloads straight into the guided tour.
  // Guarded so it runs once.
  useEffect(() => {
    if (resetRan.current) return;
    resetRan.current = true;
    if (window.location.search.includes('reset')) {
      navigator.serviceWorker?.getRegistrations?.().then((regs) => regs.forEach((r) => r.unregister()));
      localStorage.clear();
      window.location.replace(window.location.pathname + '?v2&tour');
    }
  }, []);

  // Bootstrap the caseworker: real Supabase session, else demo flag, else none.
  useEffect(() => {
    (async () => {
      try {
        if (isDemo()) setProfile(demoProfile());
        else {
          const p = await getSessionProfile();
          if (p) setProfile(p);
        }
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    flushQueue()
      .then((r) => {
        if (r.flushed > 0) show(`Synced ${r.flushed} offline intake${r.flushed > 1 ? 's' : ''}.`, 'success');
      })
      .catch(() => {});
  }, []);

  // Load base cases (Supabase or mock) merged with the local Phase 4 overlay.
  const loadCases = useCallback(() => fetchCases().then((base) => setCases(mergeCases(base))), []);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    fetchCases().then((base) => {
      if (!cancelled) setCases(mergeCases(base));
    });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  // Weekly caseworker wellness check-in — surfaced once per ISO week. Suppressed
  // when the guided tour is starting, so the two overlays don't collide on a
  // fresh demo login (the "Take a guided tour" path).
  useEffect(() => {
    const tourFlag = typeof window !== 'undefined' && window.location.search.includes('tour');
    if (profile && isWellnessDue() && !showTutorial && !tourFlag) setWellnessOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // ?tour — auto-start the guided tour on load (for demos). Runs once the
  // caseworker is authed and the Dashboard (with its data-tutorial targets) is
  // mounted.
  useEffect(() => {
    if (profile && window.location.search.includes('tour')) setShowTutorial(true);
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

  function handleDemoWithTour() {
    setProfile(continueAsDemo());
    setScreen('dashboard');
    setShowTutorial(true);
  }

  // Guided-walkthrough coordination (TutorialOverlay drives the real app).
  function finishTour() {
    setShowTutorial(false);
    setAiOpen(false);
    setDemoDocOpen(null);
    if (typeof window !== 'undefined') window.__traceDemoMessages = null;
    setScreen('dashboard');
  }
  function openDemoDoc(caseId, docType, content) {
    setAiOpen(false);
    setSelectedCaseId(caseId);
    setScreen('caseView');
    setDemoDocOpen({ caseId, docType, content });
  }

  // "Ask TRACE AI" from inside a case — grounded in that case's context.
  function openCaseAi() {
    setAiScoped(true);
    setAiOpen(true);
  }

  // Tapping a case card opens the 3-tab case view.
  function openCaseView(caseId) {
    setSelectedCaseId(caseId);
    setScreen('caseView');
  }

  // "Add session note" from the case view opens intake pre-loaded with the case.
  function addSessionNote(caseData) {
    setActiveIntake({
      caseId: caseData.id,
      notes: caseData.notes || '',
      riskLevel: caseData.riskLevel || 'medium',
      ageRange: caseData.ageRange || '',
      sex: caseData.sex || ''
    });
    setScreen('activeIntake');
  }

  function startNewCase() {
    setActiveIntake({ caseId: nextCaseId(), notes: '', riskLevel: 'medium', ageRange: '', sex: '' });
    setScreen('activeIntake');
  }

  function handleSavedCase() {
    // Re-read cases, then record this save as a timeline session on the case.
    fetchCases().then((base) => {
      const merged = mergeCases(base);
      setCases(merged);
      const id = activeIntake?.caseId;
      const c = id && merged.find((x) => x.id === id);
      if (c) {
        addSession(id, {
          id: Date.now(),
          when: 'just now',
          notes: c.notes,
          risk: c.riskLevel || 'medium',
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  // Supervisor mode + approval queue.
  function enableSupervisor() {
    if (!supervisorMode) {
      setSupervisorMode(true);
      show('Supervisor view enabled', 'success', 2500);
    }
  }
  function approveReferral(id) {
    setStatus(id, 'active');
    loadCases();
    show('Referral approved', 'success');
  }
  function flagReferral(id, note) {
    setStatus(id, 'active', { flag_note: note || '' });
    loadCases();
    show('Case flagged and returned to caseworker.', 'amber');
  }

  function handleNav(tab) {
    if (tab === 'cases') setScreen('dashboard');
    else if (tab === 'intake') setScreen('intakeStart');
    else if (tab === 'ai') {
      // The AI tab is the generic entry point — no case pre-loaded.
      setAiScoped(false);
      setAiOpen(true);
    }
    // "Records" is a standalone document archive — no case needs to be open.
    else if (tab === 'docs') setScreen('records');
  }

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || null;

  // Case grounding the AI chat.
  const contextCase =
    screen === 'caseView' && selectedCase
      ? selectedCase
      : activeIntake
        ? {
            ...(cases.find((c) => c.id === activeIntake.caseId) || {}),
            id: activeIntake.caseId,
            notes: activeIntake.notes,
            riskLevel: activeIntake.riskLevel
          }
        : cases[0] || mockCases[0];
  const aiContext = {
    caseRecord: contextCase,
    structuredFields: contextCase?.structuredData
      ? Object.entries(contextCase.structuredData)
          .filter(([, v]) => v && typeof v !== 'object')
          .map(([k, v]) => ({ label: k, value: String(v) }))
      : mockStructuredFields,
    riskIndicators: contextCase?.ctdcIndicators?.length ? contextCase.ctdcIndicators : mockRiskIndicators
  };

  const activeTab = aiOpen
    ? 'ai'
    : screen === 'intakeStart' || screen === 'activeIntake'
      ? 'intake'
      : screen === 'records'
        ? 'docs'
        : 'cases';

  if (!profile) {
    return (
      <PhoneFrame theme={theme} dir={dir}>
        <WelcomeScreen onMicrosoft={handleMicrosoft} onDemo={handleDemo} onDemoWithTour={handleDemoWithTour} signingIn={signingIn} />
      </PhoneFrame>
    );
  }

  // Submission confirmation takes over the whole frame — no status bar, no
  // bottom nav — so it reads as a hard stop after sending a record.
  if (screen === 'submission') {
    return (
      <PhoneFrame theme={theme} dir={dir}>
        <SubmissionScreen caseData={submittedCase} onBackToRecords={() => setScreen('records')} />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame theme={theme} dir={dir}>
      <StatusBar privacyMode={privacyMode} onPrivacyToggle={() => setPrivacyMode((p) => !p)} />

      <OfflineBanner />

      {/* Privacy overlay — blurs all case content when active */}
      <div className={`flex flex-1 flex-col transition-all duration-200 ${privacyMode ? 'blur-xl select-none pointer-events-none' : ''}`}>

      {screen === 'dashboard' && (
        <DashboardScreen
          profile={profile}
          cases={cases}
          supervisorMode={supervisorMode}
          onOpenCase={openCaseView}
          onSeeAll={() => setScreen('intakeStart')}
          onEnableSupervisor={enableSupervisor}
          onApprove={approveReferral}
          onFlag={flagReferral}
        />
      )}
      {screen === 'intakeStart' && (
        <IntakeStartScreen cases={cases} onOpenCase={openCaseView} onNewCase={startNewCase} />
      )}
      {screen === 'activeIntake' && activeIntake && (
        <ActiveIntakeScreen
          caseId={activeIntake.caseId}
          initialNotes={activeIntake.notes}
          riskLevel={activeIntake.riskLevel}
          ageRange={activeIntake.ageRange}
          sex={activeIntake.sex}
          supervisorMode={supervisorMode}
          onBack={() => setScreen('dashboard')}
          onSaved={handleSavedCase}
        />
      )}
      {screen === 'records' && <RecordsScreen />}
      {screen === 'caseView' && selectedCase && (
        <CaseViewScreen
          caseData={selectedCase}
          supervisorMode={supervisorMode}
          onBack={() => setScreen('dashboard')}
          onAddSessionNote={addSessionNote}
          onTasksChanged={() => loadCases()}
          onAskAi={openCaseAi}
          onSubmitRecord={(c) => {
            setSubmittedCase(c);
            setScreen('submission');
          }}
          demoDocOpen={demoDocOpen}
        />
      )}

      </div>{/* end privacy wrapper */}

      {/* Persistent chrome — intentionally outside privacy wrapper */}
      <BottomNav active={activeTab} onNavigate={handleNav} />

      {aiOpen && (
        <AiChatScreen caseContext={aiScoped ? aiContext : null} cases={cases} onClose={() => setAiOpen(false)} />
      )}

      <WellnessCheckModal
        open={wellnessOpen}
        onClose={() => setWellnessOpen(false)}
        caseworkerName={profile?.full_name}
      />

      {/* Guided demo walkthrough — rendered at shell level so it persists across
          the screens it navigates through. */}
      {showTutorial && (
        <TutorialOverlay onClose={finishTour} />
      )}
    </PhoneFrame>
  );
}
