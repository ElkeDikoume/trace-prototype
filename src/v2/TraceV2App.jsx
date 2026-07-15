// Root of the Phase 2 (v2-demo) mobile shell. Self-contained: mock data only,
// no auth / Supabase / live Claude (all Phase 3). Reached via the ?v2 URL flag
// from main.jsx; the existing desktop app remains the default experience.
import { useEffect, useRef, useState } from 'react';
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
import { mockCases, nextCaseId, mockStructuredFields, mockRiskIndicators } from './mockData.js';

const SESSION_KEY = 'tracev2_session';

// Screens: 'welcome' | 'dashboard' | 'intakeStart' | 'activeIntake' | 'docs'
export default function TraceV2App() {
  // Skip the splash if a mock session already exists (mirrors "already logged in").
  const [screen, setScreen] = useState(() => (localStorage.getItem(SESSION_KEY) ? 'dashboard' : 'welcome'));
  const [activeIntake, setActiveIntake] = useState(null); // { caseId, notes, riskLevel }
  const [aiOpen, setAiOpen] = useState(false);
  const resetRan = useRef(false);

  // ?reset — clear service workers + local state, then hard-reload to a clean
  // URL. Fixes the v1 stale-cache update bug. Guarded so it runs once.
  useEffect(() => {
    if (resetRan.current) return;
    resetRan.current = true;
    if (window.location.search.includes('reset')) {
      navigator.serviceWorker?.getRegistrations?.().then((regs) => regs.forEach((r) => r.unregister()));
      localStorage.clear();
      window.location.replace(window.location.pathname + '?v2');
    }
  }, []);

  function finishWelcome() {
    localStorage.setItem(SESSION_KEY, '1');
    setScreen('dashboard');
  }

  function openExistingCase(caseId) {
    const found = mockCases.find((c) => c.id === caseId);
    setActiveIntake({ caseId, notes: found?.notes || '', riskLevel: found?.riskLevel || 'medium' });
    setScreen('activeIntake');
  }

  function startNewCase() {
    setActiveIntake({ caseId: nextCaseId(), notes: '', riskLevel: 'medium' });
    setScreen('activeIntake');
  }

  function handleNav(tab) {
    if (tab === 'cases') setScreen('dashboard');
    else if (tab === 'intake') setScreen('intakeStart');
    else if (tab === 'ai') setAiOpen(true);
    else if (tab === 'docs') setScreen('docs');
  }

  // The case whose structured data grounds the AI chat: the one being worked on
  // if there's an active intake, otherwise the most recent case, so the tab is
  // always answerable in the demo.
  const contextCase = activeIntake
    ? { ...(mockCases.find((c) => c.id === activeIntake.caseId) || {}), id: activeIntake.caseId, notes: activeIntake.notes, riskLevel: activeIntake.riskLevel }
    : mockCases[0];
  const aiContext = {
    caseRecord: contextCase,
    structuredFields: mockStructuredFields,
    riskIndicators: mockRiskIndicators
  };

  // Which bottom-nav tab reads as active for the current screen.
  const activeTab =
    screen === 'dashboard'
      ? 'cases'
      : screen === 'intakeStart' || screen === 'activeIntake'
        ? 'intake'
        : screen === 'docs'
          ? 'docs'
          : 'cases';

  if (screen === 'welcome') {
    return (
      <PhoneFrame>
        <WelcomeScreen onDone={finishWelcome} />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <StatusBar />

      {screen === 'dashboard' && (
        <DashboardScreen onOpenCase={openExistingCase} onSeeAll={() => setScreen('intakeStart')} />
      )}
      {screen === 'intakeStart' && (
        <IntakeStartScreen onOpenCase={openExistingCase} onNewCase={startNewCase} />
      )}
      {screen === 'activeIntake' && activeIntake && (
        <ActiveIntakeScreen
          caseId={activeIntake.caseId}
          initialNotes={activeIntake.notes}
          riskLevel={activeIntake.riskLevel}
          onBack={() => setScreen('dashboard')}
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
