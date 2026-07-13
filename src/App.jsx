import { useEffect, useMemo, useRef, useState } from 'react';
import { FORM_TYPES, getFormById } from './data/forms.js';
import { analyzeRisk } from './data/riskIndicators.js';
import { suggestServices } from './data/services.js';
import { listCases, saveCase, newCaseId, deleteCase } from './lib/storage.js';
import { askCaseChatbot, structureNotesIntoForm } from './lib/claudeClient.js';
import { fetchCtdcIndicators } from './services/ctdcService.js';
import { fetchDtmContext } from './services/iomDtmService.js';
import { fetchAcledEvents } from './services/acledService.js';
import { fetchPatternAlerts } from './services/patternIntelligenceService.js';
import { usePWAInstall } from './lib/usePWAInstall.js';
import { computeFollowUpReminder, isReminderDue } from './lib/followUp.js';
import { DEMO_CASE_FORM_ID, DEMO_CASE_DATA, DEMO_INTAKE_NOTES, EXAMPLE_CASE_IBRAHIM, EXAMPLE_CASE_MARIECLAIRE } from './data/demoCase.js';
import { I18nContext, getStoredLanguage, storeLanguage, getLanguageMeta, translate } from './lib/i18n.jsx';
import { startGuidedTour } from './lib/tour.js';
import traceLogo from './assets/trace-logo.png';

import FormSelector from './components/FormSelector.jsx';
import ActiveForm from './components/ActiveForm.jsx';
import Chatbot from './components/Chatbot.jsx';
import HeaderOverflowMenu from './components/HeaderOverflowMenu.jsx';
import OnlineStatusToggle from './components/OnlineStatusToggle.jsx';
import SupportCarePanel from './components/SupportCarePanel.jsx';
import SurvivorLookupModal from './components/SurvivorLookupModal.jsx';
import FollowUpBanner from './components/FollowUpBanner.jsx';
import TutorialOverlay from './components/TutorialOverlay.jsx';
import DocumentsPanel from './components/DocumentsPanel.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import OnlineInterpretationPanel from './components/OnlineInterpretationPanel.jsx';
import WelcomeSplash from './components/WelcomeSplash.jsx';

const TUTORIAL_SEEN_KEY = 'trace_tutorial_seen';
const WELCOME_SEEN_KEY = 'trace_welcome_seen';
const EXAMPLES_SEEDED_KEY = 'trace_examples_seeded';
const DEMO_CASE_ID = 'demo-case';

function caseLocation(data) {
  return data?.currentLocation || data?.location || data?.exploitationLocation || data?.incidentLocation || '';
}

function caseLabel(c) {
  return c.data?.fullName || c.data?.clientIdentifier || c.data?.survivorIdentifier || c.data?.caseId || 'Untitled';
}

function emptyData(form) {
  const data = {};
  form.fields.forEach((f) => {
    data[f.key] = f.type === 'checkboxGroup' ? [] : '';
  });
  return data;
}

export default function App() {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [view, setView] = useState('case');
  const [chatBusy, setChatBusy] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [onlineMode, setOnlineMode] = useState(true);
  const [patternAlerts, setPatternAlerts] = useState([]);
  const [ctdcMatches, setCtdcMatches] = useState([]);
  const [dtmContext, setDtmContext] = useState(null);
  const [acledEvents, setAcledEvents] = useState([]);
  const [lang, setLang] = useState(getStoredLanguage);
  const { installPrompt, promptInstall } = usePWAInstall();
  const [showSupportCare, setShowSupportCare] = useState(false);
  const [supportCareHighRiskPrompt, setSupportCareHighRiskPrompt] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem(WELCOME_SEEN_KEY));
  const [pendingTourStart, setPendingTourStart] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mockSession, setMockSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trace_mock_session'));
    } catch {
      return null;
    }
  });
  const [, setTick] = useState(0);

  const seenLevelsRef = useRef({});
  const suppressNextHighRiskPromptRef = useRef(false);
  const tourLaunchedRef = useRef(false);
  const guidedTourRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem(EXAMPLES_SEEDED_KEY)) {
      saveCase({ id: DEMO_CASE_ID, formId: DEMO_CASE_FORM_ID, data: { ...DEMO_CASE_DATA }, chatHistory: [] });
      saveCase({ ...EXAMPLE_CASE_IBRAHIM });
      saveCase({ ...EXAMPLE_CASE_MARIECLAIRE });
      localStorage.setItem(EXAMPLES_SEEDED_KEY, '1');
    }
    setCases(listCases());
    fetchPatternAlerts().then(setPatternAlerts);

    if (!showWelcome && !localStorage.getItem(TUTORIAL_SEEN_KEY)) {
      const id = setTimeout(() => setShowTutorial(true), 400);
      return () => clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    storeLanguage(lang);
    const meta = getLanguageMeta(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
  }, [lang]);

  const t = (str) => translate(lang, str);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const activeForm = activeCase ? getFormById(activeCase.formId) : null;

  const riskResult = useMemo(() => {
    if (!activeCase || !activeForm?.riskEligible) return null;
    return analyzeRisk(activeCase.data);
  }, [activeCase, activeForm]);

  const services = useMemo(() => {
    if (!activeCase) return [];
    return suggestServices(activeCase.data, activeCase.formId, 3);
  }, [activeCase]);

  const dueFollowUps = useMemo(
    () => cases.filter((c) => isReminderDue(c.followUpReminder)).map((c) => ({ id: c.id, label: caseLabel(c) })),
    [cases]
  );

  const location = activeCase ? caseLocation(activeCase.data) : '';
  const riskKey = riskResult ? riskResult.matched.map((m) => m.id).join(',') : '';

  useEffect(() => {
    if (!activeCase || !activeForm?.riskEligible) {
      setCtdcMatches([]);
      setDtmContext(null);
      setAcledEvents([]);
      return;
    }
    let cancelled = false;
    const matchedLabels = riskResult ? riskResult.matched.map((m) => m.label) : [];

    fetchCtdcIndicators({ matchedIndicatorLabels: matchedLabels, region: location }).then((r) => {
      if (!cancelled) setCtdcMatches(r);
    });
    fetchDtmContext(location).then((r) => {
      if (!cancelled) setDtmContext(r);
    });
    fetchAcledEvents(location).then((r) => {
      if (!cancelled) setAcledEvents(r);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCase?.id, activeForm?.riskEligible, location, riskKey]);

  // Follow-up reminder: (re)computed only when the risk level actually changes.
  useEffect(() => {
    if (!activeCase || !activeForm?.riskEligible || !riskResult) return;
    const nextReminder = computeFollowUpReminder(riskResult.level, activeCase.followUpReminder);
    const current = activeCase.followUpReminder || null;
    if (JSON.stringify(nextReminder) !== JSON.stringify(current)) {
      persist({ ...activeCase, followUpReminder: nextReminder });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCase?.id, riskResult?.level]);

  // Support & Care auto-prompt: fires when a case newly becomes HIGH risk this session.
  // Suppressed once when the guided tour kicks off the demo case, since the
  // tour walks the caseworker to Support & Care deliberately at its own step.
  useEffect(() => {
    if (!activeCase || !riskResult) return;
    const prev = seenLevelsRef.current[activeCase.id];
    if (prev !== undefined && prev !== 'high' && riskResult.level === 'high') {
      if (suppressNextHighRiskPromptRef.current) {
        suppressNextHighRiskPromptRef.current = false;
      } else {
        setShowSupportCare(true);
        setSupportCareHighRiskPrompt(true);
      }
    }
    seenLevelsRef.current[activeCase.id] = riskResult.level;
  }, [activeCase?.id, riskResult?.level]);

  function persist(next) {
    setActiveCase(next);
    saveCase(next);
    setCases(listCases());
  }

  function handleNewCase(formId) {
    const form = getFormById(formId);
    const record = {
      id: newCaseId(),
      formId,
      data: emptyData(form),
      chatHistory: []
    };
    seenLevelsRef.current[record.id] = 'low';
    setView('case');
    persist(record);
  }

  function handleStartDemo({ suppressHighRiskPrompt = false } = {}) {
    // Fixed ID so replaying the demo always replaces the single demo
    // record instead of stacking up duplicate "Amina K." entries.
    deleteCase(DEMO_CASE_ID);
    const record = {
      id: DEMO_CASE_ID,
      formId: DEMO_CASE_FORM_ID,
      data: { ...DEMO_CASE_DATA },
      chatHistory: []
    };
    // Pre-seed as "low" so the risk-flagging effect sees this as a fresh
    // save transitioning into HIGH (triggering the Support & Care prompt),
    // rather than a case merely being reopened.
    seenLevelsRef.current[record.id] = 'low';
    if (suppressHighRiskPrompt) suppressNextHighRiskPromptRef.current = true;
    setView('case');
    persist(record);
  }

  // Blank HTCDS Intake case (not pre-filled) so the guided tour has the
  // judge actually trigger AI structuring live, rather than viewing an
  // already-completed case. Fixed ID so replaying always replaces the
  // same record instead of accumulating duplicates.
  function startGuidedTourCase() {
    deleteCase(DEMO_CASE_ID);
    const form = getFormById(DEMO_CASE_FORM_ID);
    const record = {
      id: DEMO_CASE_ID,
      formId: DEMO_CASE_FORM_ID,
      data: emptyData(form),
      chatHistory: []
    };
    seenLevelsRef.current[record.id] = 'low';
    suppressNextHighRiskPromptRef.current = true;
    setView('case');
    persist(record);
  }

  function handleStartGuidedTourDemo() {
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
    setShowWelcome(false);
    tourLaunchedRef.current = false;
    startGuidedTourCase();
    setPendingTourStart(true);
  }

  function handleExploreOnMyOwn() {
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
    setShowWelcome(false);
  }

  // Mock Microsoft SSO — no real auth, just a localStorage-backed "session"
  // so judges see what an org-connected login would surface in the header.
  function handleSignIn() {
    const session = { org: "N'Djamena IOM Office", role: 'Caseworker', mode: 'demo' };
    localStorage.setItem('trace_mock_session', JSON.stringify(session));
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
    setMockSession(session);
    setShowWelcome(false);
  }

  // Waits for the demo case (and its DOM) to be ready before starting Shepherd,
  // so both "Start Guided Demo" from the splash and "Replay Demo Tour" from the
  // header can trigger the same reliable sequence: load demo data, then tour.
  // tourLaunchedRef guards against React StrictMode's dev-only double-invoke
  // (and any other double-fire from activeCase changing again mid-timer),
  // since Shepherd has no built-in way to detect an already-running tour.
  useEffect(() => {
    if (!pendingTourStart || !activeCase) return;
    const id = setTimeout(() => {
      if (!tourLaunchedRef.current) {
        tourLaunchedRef.current = true;
        // The old hand-rolled tutorial and the Shepherd tour must never be
        // visible at the same time — they'd stack.
        setShowTutorial(false);
        guidedTourRef.current = startGuidedTour({
          onEnd: () => { guidedTourRef.current = null; }
        });
      }
      setPendingTourStart(false);
    }, 300);
    return () => clearTimeout(id);
  }, [pendingTourStart, activeCase]);

  // Lets the guided tour (a plain DOM/Shepherd script, outside React) drive
  // two interactive moments without duplicating React state logic: loading
  // the sample notes text, and running the same AI structuring call
  // VoiceTextIntake's "Structure with AI" button makes. Re-created whenever
  // activeCase/activeForm change so the closures never see stale data.
  useEffect(() => {
    window.__traceLoadSampleNotes = () => {
      handleFieldChange('caseworkerNotes', DEMO_INTAKE_NOTES);
      // VoiceTextIntake's freeform notes textarea (what its own "Structure
      // with AI" button actually reads from) is local component state, not
      // wired to caseData — set it directly via the native input setter so
      // React's controlled-input tracking picks up the change.
      const textarea = document.querySelector('[data-tutorial="voice-intake"] textarea');
      if (textarea) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(textarea, DEMO_INTAKE_NOTES);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    window.__traceStructureNow = async () => {
      if (!activeCase) return;
      const notes = activeCase.data?.caseworkerNotes || '';
      if (!notes.trim()) return;
      try {
        const fields = await structureNotesIntoForm({ freeText: notes, language: 'en-US', form: activeForm });
        handleStructured(fields);
      } catch (err) {
        console.error('[TRACE tour] Structuring failed:', err);
      }
    };
    return () => {
      delete window.__traceLoadSampleNotes;
      delete window.__traceStructureNow;
    };
  }, [activeCase, activeForm]);

  // Lets the guided tour's chatbot step fire a live, grounded question
  // through the same path as the real "Ask TRACE" input. Re-created whenever
  // the data handleSendChat closes over changes, so the tour always asks
  // against the current case/risk/context rather than a stale snapshot.
  useEffect(() => {
    window.__traceAskDemo = (question) => handleSendChat(question || 'Why was this case flagged as high risk? Reference the specific indicators that triggered each flag.');
    return () => {
      delete window.__traceAskDemo;
    };
  }, [activeCase, activeForm, riskResult, services, ctdcMatches, dtmContext, acledEvents, patternAlerts, lang]);

  // Lets the guided tour open the floating chat bubble programmatically
  // before its spotlight step renders, since the panel is now a toggled
  // overlay rather than an always-visible bottom panel.
  useEffect(() => {
    window.__traceOpenChatbot = () => setChatOpen(true);
    return () => {
      delete window.__traceOpenChatbot;
    };
  }, []);

  function handleReplayGuidedTour() {
    tourLaunchedRef.current = false;
    startGuidedTourCase();
    setPendingTourStart(true);
  }

  function handleOpenCase(id) {
    const found = cases.find((c) => c.id === id);
    if (found) {
      const form = getFormById(found.formId);
      if (form?.riskEligible) {
        seenLevelsRef.current[found.id] = analyzeRisk(found.data).level;
      }
      setView('case');
      setActiveCase(found);
    }
  }

  function handleFieldChange(key, value) {
    if (!activeCase) return;
    persist({ ...activeCase, data: { ...activeCase.data, [key]: value } });
  }

  function handleStructured(fields) {
    if (!activeCase) return;
    const merged = { ...activeCase.data };
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        merged[key] = value;
      }
    });
    persist({ ...activeCase, data: merged });
  }

  async function handleSendChat(question) {
    if (!activeCase) return;
    const history = activeCase.chatHistory || [];
    const withUser = [...history, { role: 'user', content: question }];
    persist({ ...activeCase, chatHistory: withUser });
    setChatBusy(true);
    try {
      const answer = await askCaseChatbot({
        question,
        form: activeForm,
        caseData: activeCase.data,
        riskResult,
        services,
        history,
        ctdcMatches,
        dtmContext,
        acledEvents,
        patternAlerts,
        aiLanguage: getLanguageMeta(lang).aiName
      });
      persist({ ...activeCase, chatHistory: [...withUser, { role: 'assistant', content: answer }] });
    } catch (err) {
      persist({
        ...activeCase,
        chatHistory: [...withUser, { role: 'assistant', content: `⚠️ ${err.message || 'Something went wrong reaching Claude.'}` }]
      });
    } finally {
      setChatBusy(false);
    }
  }

  function handleAskWhy() {
    const level = riskResult ? t(riskResult.level.toUpperCase()) : '';
    setPendingQuestion(`${t('Why was this case flagged as')} ${level} ${t('risk? Reference the specific indicators.')}`);
    setChatOpen(true);
  }

  function handleSaveDocument(key, content, status) {
    if (!activeCase) return;
    persist({ ...activeCase, documents: { ...(activeCase.documents || {}), [key]: { content, status } } });
  }

  function handleSavePortableRecord(record) {
    if (!activeCase) return;
    persist({ ...activeCase, portableRecord: record });
  }

  function handleDeletePortableRecord(caseId) {
    const found = cases.find((c) => c.id === caseId) || (activeCase?.id === caseId ? activeCase : null);
    if (!found) return;
    const updated = { ...found, portableRecord: null };
    saveCase(updated);
    setCases(listCases());
    if (activeCase?.id === caseId) setActiveCase(updated);
  }

  function handleToggleFollowUp(enabled) {
    if (!activeCase?.followUpReminder) return;
    persist({ ...activeCase, followUpReminder: { ...activeCase.followUpReminder, enabled } });
  }

  function handleDismissDueCase(caseId) {
    const found = cases.find((c) => c.id === caseId);
    if (!found?.followUpReminder) return;
    const updated = { ...found, followUpReminder: { ...found.followUpReminder, enabled: false } };
    saveCase(updated);
    setCases(listCases());
    if (activeCase?.id === caseId) setActiveCase(updated);
  }

  function handleFinishTutorial() {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
  }

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
    <div className="flex flex-col h-screen overflow-hidden">
      <header data-tutorial="header" className="flex-shrink-0 px-4 py-3 border-b border-trace-700 bg-trace-950 flex items-center justify-between">
        <div>
          <button
            onClick={() => { setView('case'); setActiveCase(null); }}
            aria-label={t('TRACE home')}
            className="rounded-md bg-white p-1 leading-none hover:opacity-90 transition-opacity"
          >
            <img
              src={traceLogo}
              alt="TRACE"
              className="h-10 w-auto block"
              onError={(e) => { e.currentTarget.style.display='none'; const span=document.createElement('span'); span.textContent='TRACE'; span.className='text-white font-bold text-lg px-1'; e.currentTarget.parentNode.appendChild(span); }}
            />
          </button>
          <p className="text-[11px] text-slate-500 mt-1">{t('Multilingual intake, risk explanation, and safer referrals for caseworkers in low-connectivity settings.')}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {mockSession ? (
            <span className="text-[11px] text-slate-400 bg-trace-800 border border-trace-700 px-2 py-0.5 rounded">
              🏢 {mockSession.org} — Demo
            </span>
          ) : (
            <button onClick={() => setShowWelcome(true)} className="text-[11px] text-slate-500 hover:text-slate-300">
              {t('Sign in')}
            </button>
          )}
          <LanguageSelector lang={lang} onChange={setLang} />
          <OnlineStatusToggle onlineMode={onlineMode} onToggle={() => setOnlineMode((v) => !v)} />
          {installPrompt && (
            <button
              onClick={promptInstall}
              className="text-xs px-2 py-1 rounded border border-trace-accent text-trace-accent hover:bg-trace-accent hover:text-white transition-colors"
            >
              ⬇ {t('Install App')}
            </button>
          )}
          <button
            onClick={() => {
              window.__traceOpenChatbot?.();
              setTimeout(() => {
                window.__traceAskDemo?.('How do I use TRACE? Give me a quick overview of the main steps.');
              }, 200);
            }}
            aria-label={t('Help')}
            title={t('Help')}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-trace-800 border border-trace-700 text-sm hover:bg-trace-700"
          >
            ?
          </button>
          <button
            onClick={() => {
              ['trace_welcome_seen', 'trace_tutorial_seen', 'trace_examples_seeded', 'trace_mock_session', 'trace_cases_v1']
                .forEach((k) => localStorage.removeItem(k));
              window.location.reload();
            }}
            title={t('Restart Demo')}
            className="text-xs text-slate-400 hover:text-white border border-trace-700 px-2 py-1 rounded transition-colors"
          >
            ↺ {t('Restart')}
          </button>
          <HeaderOverflowMenu onOpenLookup={() => setShowLookup(true)} />
        </div>
      </header>

      <nav className="flex-shrink-0 flex border-b border-trace-700 bg-trace-950">
        {[
          { id: 'case', label: `📋 ${t('Case View')}` },
          { id: 'documents', label: `📄 ${t('Insights')}` }
        ].map((tab) => (
          <button
            key={tab.id}
            data-tutorial={tab.id === 'documents' ? 'documents-tab' : 'case-view-tab'}
            onClick={() => setView(tab.id)}
            className={`flex-1 text-xs font-medium py-2 border-b-2 ${
              view === tab.id ? 'border-trace-accent text-trace-accent' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <FollowUpBanner dueCases={dueFollowUps} onOpen={handleOpenCase} onDismiss={handleDismissDueCase} />

      {view === 'documents' ? (
        <DocumentsPanel
          caseRecord={activeCase}
          form={activeForm}
          riskResult={riskResult}
          services={services}
          onSaveDocument={handleSaveDocument}
          patternAlerts={patternAlerts}
        />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin flex flex-col">
          <FormSelector
            forms={FORM_TYPES}
            cases={cases}
            activeCaseId={activeCase?.id}
            onNewCase={handleNewCase}
            onOpenCase={handleOpenCase}
            onReplayGuidedTour={handleReplayGuidedTour}
          />

          <ActiveForm
            form={activeForm}
            caseId={activeCase?.id}
            caseData={activeCase?.data || {}}
            onFieldChange={handleFieldChange}
            onStructured={handleStructured}
            riskResult={riskResult}
            services={services}
            onAskWhy={handleAskWhy}
            ctdcMatches={ctdcMatches}
            dtmContext={dtmContext}
            acledEvents={acledEvents}
            onlineMode={onlineMode}
            portableRecord={activeCase?.portableRecord}
            onSavePortableRecord={handleSavePortableRecord}
            onDeletePortableRecord={() => activeCase && handleDeletePortableRecord(activeCase.id)}
            followUpReminder={activeCase?.followUpReminder}
            onToggleFollowUp={handleToggleFollowUp}
            onStartDemo={handleStartDemo}
          />

          <OnlineInterpretationPanel onlineMode={onlineMode} />
        </div>
      )}

      <Chatbot
        messages={activeCase?.chatHistory || []}
        onSend={handleSendChat}
        busy={chatBusy}
        hasCase={!!activeCase}
        pendingQuestion={pendingQuestion}
        onConsumePending={() => setPendingQuestion(null)}
        open={chatOpen}
        onToggle={() => setChatOpen((o) => !o)}
      />

      <SupportCarePanel
        open={showSupportCare}
        onClose={() => setShowSupportCare(false)}
        highRiskPrompt={supportCareHighRiskPrompt}
      />
      <SurvivorLookupModal
        open={showLookup}
        onClose={() => setShowLookup(false)}
        cases={cases}
        onDelete={handleDeletePortableRecord}
      />
      {showTutorial && <TutorialOverlay onFinish={handleFinishTutorial} />}
      {showWelcome && (
        <WelcomeSplash onStartDemo={handleStartGuidedTourDemo} onExplore={handleExploreOnMyOwn} onSignIn={handleSignIn} />
      )}
    </div>
    </I18nContext.Provider>
  );
}
