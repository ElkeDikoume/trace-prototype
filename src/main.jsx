import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import TraceV2App from './v2/TraceV2App.jsx';
import './index.css';

const params = new URLSearchParams(window.location.search);
const useV2 = params.has('v2');

// ?reset in the URL wipes TRACE's local state before React ever mounts, so
// App's useState initializers (showWelcome, mockSession, etc.) read a clean
// localStorage on their very first render instead of stale prior-session data.
// (The v2 shell handles its own ?reset — including service-worker cleanup —
// inside TraceV2App, so leave the URL/flag intact when v2 is active.)
if (params.has('reset') && !useV2) {
  ['trace_welcome_seen', 'trace_tutorial_seen', 'trace_examples_seeded', 'trace_mock_session', 'trace_cases_v1']
    .forEach((k) => localStorage.removeItem(k));
  window.history.replaceState({}, '', window.location.pathname);
}

// The ?v2 flag renders the self-contained Phase 2 mobile shell; without it the
// existing desktop app remains the default experience.
const Root = useV2 ? TraceV2App : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
