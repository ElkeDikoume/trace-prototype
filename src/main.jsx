import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ?reset in the URL wipes TRACE's local state before React ever mounts, so
// App's useState initializers (showWelcome, mockSession, etc.) read a clean
// localStorage on their very first render instead of stale prior-session data.
if (new URLSearchParams(window.location.search).has('reset')) {
  ['trace_welcome_seen', 'trace_tutorial_seen', 'trace_examples_seeded', 'trace_mock_session', 'trace_cases_v1']
    .forEach((k) => localStorage.removeItem(k));
  window.history.replaceState({}, '', window.location.pathname);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
