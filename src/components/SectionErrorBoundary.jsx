import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Granular error boundary. A throw inside the wrapped subtree is ISOLATED: the
// rest of the app keeps running, progress is untouched, and the user can reload
// just this section (non-destructive remount) instead of losing everything.
//
// This is the structural fix for "the app collapses on its own": the old design
// had a single top-level ErrorBoundary, so ANY render throw anywhere took down
// the whole UI and the only escape wiped localStorage (data loss). Wrapping each
// tab and each always-on widget in a SectionErrorBoundary means a bug in one
// area degrades to a localized inline notice — never a full SYSTEM COLLAPSE.
//
// The error is also logged (componentDidCatch) so a future collapse is
// diagnosable from the console instead of vanishing into a red screen.
export default class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface the real error + component stack so it can be diagnosed.
    console.error(
      `[SectionErrorBoundary:${this.props.label || 'section'}]`,
      error,
      info && info.componentStack
    );
  }

  reload = () => {
    // Bump resetKey → React unmounts the old (broken) subtree and remounts
    // fresh. Non-destructive: localStorage and app state are never touched.
    this.setState((s) => ({ hasError: false, error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      const label = this.props.label || 'Section';
      return (
        <div className="max-w-2xl mx-auto p-4 my-4">
          <div className="glass-panel-khalifa p-5 border border-amber-500/30 bg-amber-950/10 text-center space-y-3">
            <AlertTriangle size={28} className="mx-auto text-amber-400" />
            <div className="font-orbitron text-amber-300 text-sm tracking-wider uppercase">
              {label} Unstable
            </div>
            <p className="text-xs text-khalifa-steel/80 max-w-md mx-auto">
              This section hit an error and was isolated so the rest of the System keeps running.
              Your progress is safe. Reload the section, or switch tabs and continue.
            </p>
            <button
              onClick={this.reload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-900/40 border border-amber-500/40 text-amber-200 text-sm font-orbitron hover:bg-amber-800/50 transition-colors"
            >
              <RefreshCw size={14} /> RELOAD {label.toUpperCase()}
            </button>
          </div>
        </div>
      );
    }

    // key on the Fragment forces a clean remount of children when reload fires,
    // clearing any broken internal state of the subtree.
    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}