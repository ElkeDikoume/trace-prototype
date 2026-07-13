// Core 5 languages work fully offline (Web Speech API + on-device/cached
// structuring). The 3 local-language options below require the online-mode
// interpretation pipeline (simulating Meta's SeamlessM4T) and are hidden
// whenever offline mode is toggled on.
export const LANGUAGES = [
  { code: 'fr-FR', label: 'Français' },
  { code: 'en-US', label: 'English' },
  { code: 'ar-SA', label: 'العربية' },
  { code: 'es-ES', label: 'Español' },
  { code: 'pt-PT', label: 'Português' },
  { code: 'ha-NG', label: 'Hausa', local: true },
  { code: 'ff-NG', label: 'Fulfulde', local: true },
  { code: 'dje', label: 'Zarma', local: true }
];

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createRecognizer({ lang, onResult, onEnd, onError }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognizer = new SpeechRecognition();
  recognizer.lang = lang;
  recognizer.continuous = true;
  recognizer.interimResults = true;

  let finalTranscript = '';

  recognizer.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += `${transcript} `;
      } else {
        interim += transcript;
      }
    }
    onResult?.({ final: finalTranscript.trim(), interim });
  };

  recognizer.onerror = (event) => onError?.(event.error);
  recognizer.onend = () => onEnd?.(finalTranscript.trim());

  return {
    start: () => {
      finalTranscript = '';
      recognizer.start();
    },
    stop: () => recognizer.stop(),
    abort: () => recognizer.abort()
  };
}
