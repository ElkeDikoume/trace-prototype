import { useEffect, useMemo, useRef, useState } from 'react';
import { FORM_TYPES, getFormById } from './data/forms.js';
import { analyzeRisk } from './data/riskIndicators.js';
import { suggestServices } from './data/services.js';
import { listCases, saveCase, newCaseId, deleteCase } from './lib/storage.js';
import { askCaseChatbot } from './lib/claudeClient.js';
import { fetchCtdcIndicators } from './services/ctdcService.js';
import { fetchDtmContext } from './services/iomDtmService.js';
import { fetchAcledEvents } from './services/acledService.js';
import { fetchPatternAlerts } from './services/patternIntelligenceService.js';
import { getStoredTheme, storeTheme, applyTheme } from './lib/theme.js';
import { computeFollowUpReminder, isReminderDue } from './lib/followUp.js';
import { DEMO_CASE_FORM_ID, DEMO_CASE_DATA, EXAMPLE_CASE_IBRAHIM, EXAMPLE_CASE_MARIECLAIRE } from './data/demoCase.js';
import { I18nContext, getStoredLanguage, storeLanguage, getLanguageMeta, translate } from './lib/i18n.jsx';
import { startGuidedTour } from './lib/tour.js';
import traceLogo from './assets/trace-logo.png';

import FormSelector from './components/FormSelector.jsx';
import ActiveForm from './components/ActiveForm.jsx';
import Chatbot from './components/Chatbot.jsx';
import PatternAlertsBanner from './components/PatternAlertsBanner.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import SupportCareButton from './components/SupportCareButton.jsx';
import SupportCarePanel from './components/SupportCarePanel.jsx';
import SurvivorLookupModal from './components/SurvivorLookupModal.jsx';
import FollowUpBanner from './components/FollowUpBanner.jsx';
import TutorialOverlay from './components/TutorialOverlay.jsx';
import SupervisorView from './components/SupervisorView.jsx';
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
  const [theme, setTheme] = useState(getStoredTheme);
  const [lang, setLang] = useState(getStoredLanguage);
  const [showSupportCare, setShowSupportCare] = useState(false);
  const [supportCareHighRiskPrompt, setSupportCareHighRiskPrompt] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem(WELCOME_SEEN_KEY));
  const [pendingTourStart, setPendingTourStart] = useState(false);
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
    applyTheme(theme);
    storeTheme(theme);
  }, [theme]);

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

  const supervisorStats = useMemo(() => {
    let high = 0, medium = 0, low = 0;
    cases.forEach((c) => {
      const f = getFormById(c.formId);
      if (f?.riskEligible) {
        const r = analyzeRisk(c.data);
        if (r.level === 'high') high++;
        else if (r.level === 'medium') medium++;
        else low++;
      }
    });
    return { total: cases.length, high, medium, low };
  }, [cases]);

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

  function handleStartGuidedTourDemo() {
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
    setShowWelcome(false);
    tourLaunchedRef.current = false;
    handleStartDemo({ suppressHighRiskPrompt: true });
    setPendingTourStart(true);
  }

  function handleExploreOnMyOwn() {
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
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

  function handleReplayGuidedTour() {
    tourLaunchedRef.current = false;
    handleStartDemo({ suppressHighRiskPrompt: true });
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
          {activeForm && view === 'case' && (
            <span className="text-xs px-2 py-1 rounded-full bg-trace-800 border border-trace-700 text-slate-300">
              {t(activeForm.shortName)}
            </span>
          )}
          <LanguageSelector lang={lang} onChange={setLang} />
          <ThemeToggle theme={theme} onToggle={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))} />
          <SupportCareButton onClick={() => { setSupportCareHighRiskPrompt(false); setShowSupportCare(true); }} />
          <button
            onClick={() => setShowLookup(true)}
            aria-label={t('Find portable record')}
            title={t('Find portable record')}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-trace-800 border border-trace-700 text-sm hover:bg-trace-700"
          >
            🔎
          </button>
          <button
            onClick={() => {
              // Never let the old tutorial and the Shepherd tour overlap.
              if (guidedTourRef.current) {
                guidedTourRef.current.cancel();
              }
              setShowTutorial(true);
            }}
            aria-label={t('Replay tutorial')}
            title={t('Replay tutorial')}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-trace-800 border border-trace-700 text-sm hover:bg-trace-700"
          >
            ?
          </button>
          <button
            onClick={handleReplayGuidedTour}
            title="Replay Demo Tour"
            className="text-xs px-2 py-1 rounded-full bg-trace-800 border border-trace-700 text-slate-300 hover:bg-trace-700 whitespace-nowrap"
          >
            ▶ Replay Demo Tour
          </button>
          <button
            onClick={() => setOnlineMode((v) => !v)}
            className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${
              onlineMode
                ? 'bg-trace-risk-low/15 border-trace-risk-low text-trace-risk-low'
                : 'bg-trace-700 border-trace-600 text-slate-300'
            }`}
          >
            {onlineMode ? `● ${t('Online')}` : `○ ${t('Offline')}`}
          </button>
        </div>
      </header>

      <nav className="flex-shrink-0 flex border-b border-trace-700 bg-trace-950">
        {[
          { id: 'case', label: `📋 ${t('Case View')}` },
          { id: 'supervisor', label: `🧭 ${t('Supervisor')}` }
        ].map((tab) => (
          <button
            key={tab.id}
            data-tutorial={tab.id === 'supervisor' ? 'supervisor-tab' : undefined}
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

      {view === 'supervisor' ? (
        <SupervisorView stats={supervisorStats} />
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin flex flex-col">
            <PatternAlertsBanner alerts={patternAlerts} />

            <FormSelector
              forms={FORM_TYPES}
              cases={cases}
              activeCaseId={activeCase?.id}
              onNewCase={handleNewCase}
              onOpenCase={handleOpenCase}
            />

            <ActiveForm
              form={activeForm}
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

          <Chatbot
            messages={activeCase?.chatHistory || []}
            onSend={handleSendChat}
            busy={chatBusy}
            hasCase={!!activeCase}
            pendingQuestion={pendingQuestion}
            onConsumePending={() => setPendingQuestion(null)}
          />
        </>
      )}

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
        <WelcomeSplash onStartDemo={handleStartGuidedTourDemo} onExplore={handleExploreOnMyOwn} />
      )}
    </div>
    </I18nContext.Provider>
  );
}
