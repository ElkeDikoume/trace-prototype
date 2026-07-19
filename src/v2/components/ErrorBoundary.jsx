// Top-level error boundary for the v2 shell. Catches render/lifecycle errors in
// its subtree and shows a minimal, tappable recovery screen instead of a blank
// white page — tapping reloads the app at the ?v2 entry point.
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface the error in the console for debugging; the UI stays minimal.
    // eslint-disable-next-line no-console
    console.error('[TRACE v2] Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Carry the v2 theme scope here — the boundary renders outside PhoneFrame's
      // `.trace-v2-root`, so without it the tracev2-* CSS variables are undefined.
      return (
        <button
          type="button"
          onClick={() => window.location.replace('/?v2')}
          className="trace-v2-root trace-v2-theme-dark flex min-h-screen w-full items-center justify-center bg-tracev2-bg px-8 text-center text-sm text-tracev2-muted"
        >
          Something went wrong. Tap to reload.
        </button>
      );
    }
    return this.props.children;
  }
}
