// AI-guided voice interview mode. Instead of free-typing, Claude looks at the
// notes so far, picks the most important undocumented CTDC category, and asks
// one short trauma-informed question. The caseworker answers by voice; the
// Q/A pair is appended to the notes, which triggers the next question.
import { useEffect, useRef, useState } from 'react';
import { streamCaseChat } from '../lib/claudeStream.js';

const SYSTEM =
  "You are TRACE, an AI assistant helping a frontline caseworker conduct a trauma-informed intake interview. Based on the case notes so far, identify the single most important CTDC indicator category that has not yet been documented, and write one short, trauma-informed interview question the caseworker should ask next. Return ONLY the question — no explanation, no preamble. The question should be phrased as something the caseworker says to the survivor, in simple, non-leading language. If all major categories are covered, return: 'The key areas are covered. Review the structured preview when ready.'";

function userMessage(notes) {
  return `Current notes:\n\n${notes}\n\nCTDC categories to cover: recruitment method, document control, freedom of movement, wages and debt, type of exploitation, control methods, family contact, duration. What is the next question?`;
}

// Offline / API-unavailable fallback — cycles the 8 CTDC categories.
const FALLBACK_QUESTIONS = [
  'Can you tell me how you first came to be offered this work or opportunity?',
  'Do you have your own identity or travel documents with you, or is someone else keeping them?',
  'Are you free to come and go as you wish, or are there limits on where you can go?',
  'Were you paid what you were promised? Is there any money you were told you owe?',
  'Can you describe the kind of work or tasks you were asked to do?',
  'Has anyone threatened you, or pressured you to stay or keep quiet?',
  'Are you able to contact your family? When did you last speak with them?',
  'How long has this situation been going on for you?'
];

export default function InterviewModePanel({ notes, onNotesUpdate, intakeLang, onExit }) {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechUnsupported, setSpeechUnsupported] = useState(false);

  const abortRef = useRef(null);
  const recognitionRef = useRef(null);
  const answerRef = useRef('');
  const fallbackIdxRef = useRef(0);

  function nextFallbackQuestion() {
    const q = FALLBACK_QUESTIONS[fallbackIdxRef.current % FALLBACK_QUESTIONS.length];
    fallbackIdxRef.current += 1;
    return q;
  }

  async function fetchNextQuestion(currentNotes) {
    // Offline: use the static fallback list without hitting the API.
    if (!navigator.onLine) {
      setCurrentQuestion(nextFallbackQuestion());
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingQuestion(true);
    let acc = '';
    try {
      await streamCaseChat({
        system: SYSTEM,
        history: [],
        question: userMessage(currentNotes),
        max_tokens: 80,
        signal: controller.signal,
        onToken: (chunk) => {
          acc += chunk;
          setCurrentQuestion(acc.trim());
        }
      });
      if (acc.trim()) setCurrentQuestion(acc.trim());
      else setCurrentQuestion(nextFallbackQuestion());
    } catch (err) {
      if (err?.name !== 'AbortError') setCurrentQuestion(nextFallbackQuestion());
    } finally {
      setLoadingQuestion(false);
    }
  }

  // Fetch the next question on mount and (debounced) whenever notes change —
  // e.g. right after an answer is appended. Never mid-recording.
  useEffect(() => {
    if (recording) return undefined;
    const id = setTimeout(() => fetchNextQuestion(notes), 800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      try {
        recognitionRef.current?.stop();
      } catch {
        /* no-op */
      }
    };
  }, []);

  function toggleRecord() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechUnsupported(true);
      return;
    }
    if (recording) {
      recognitionRef.current?.stop();
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false; // stop after a natural pause
    rec.interimResults = true;
    rec.lang = 'en-US'; // Web Speech needs a concrete locale; Claude handles true source-language translation.

    answerRef.current = '';
    setTranscript('');

    rec.onresult = (e) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + ' ';
      full = full.replace(/\s+/g, ' ').trim();
      answerRef.current = full;
      setTranscript(full);
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => {
      setRecording(false);
      const answer = answerRef.current.trim();
      if (answer && currentQuestion) {
        const appended = `${notes}\n\nQ: ${currentQuestion}\nA: ${answer}`.trimStart();
        onNotesUpdate(appended); // triggers the debounced fetch for the next question
      }
      setTranscript('');
      answerRef.current = '';
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setRecording(true);
    } catch {
      setRecording(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
      {/* Current question */}
      <div className="rounded-xl border border-tracev2-border border-l-4 border-l-tracev2-accent bg-tracev2-card p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-tracev2-accent">Next question</p>
        {currentQuestion ? (
          <p className="mt-1.5 text-base font-medium leading-relaxed text-tracev2-text">{currentQuestion}</p>
        ) : (
          <p className="mt-1.5 flex items-center gap-2 text-base font-medium text-tracev2-subtle">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-tracev2-border border-t-tracev2-accent" />
            Finding the next question…
          </p>
        )}
        {loadingQuestion && currentQuestion && (
          <span className="mt-1 inline-block text-[10px] text-tracev2-subtle">updating…</span>
        )}
      </div>

      {/* Answer capture */}
      <button
        onClick={toggleRecord}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold text-white transition-colors duration-150 ${
          recording ? 'bg-tracev2-risk-high hover:bg-tracev2-risk-high/90' : 'bg-tracev2-accent hover:bg-tracev2-accent/90'
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full bg-white ${recording ? 'animate-pulse' : ''}`} />
        {recording ? 'Listening… tap to stop' : 'Tap to answer'}
      </button>

      {recording && (
        <div className="mt-2 rounded-xl border border-tracev2-border bg-tracev2-bg p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-tracev2-risk-high">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tracev2-risk-high" />
            Listening…
          </div>
          <p className="mt-1 text-sm leading-relaxed text-tracev2-text">
            {transcript || <span className="text-tracev2-subtle">Speak the survivor&apos;s answer…</span>}
          </p>
        </div>
      )}

      {speechUnsupported && (
        <p className="mt-1.5 text-[11px] text-tracev2-risk-medium">
          Voice input isn&apos;t supported in this browser. Try Chrome, or use &quot;Type instead&quot; below.
        </p>
      )}

      <button
        onClick={onExit}
        className="mx-auto mt-3 text-xs text-tracev2-subtle underline-offset-2 transition-colors duration-150 hover:text-tracev2-text hover:underline"
      >
        Type instead
      </button>
    </div>
  );
}
