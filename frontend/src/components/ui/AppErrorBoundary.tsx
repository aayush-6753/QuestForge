import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./AppButton";

type State = { failed: boolean };

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application render failed", { name: error.name, message: error.message, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center px-5">
        <section className="w-full max-w-lg border-y border-ruby/40 bg-coal/90 py-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-ruby" aria-hidden="true" />
          <h1 className="mt-3 font-display text-2xl text-vellum">The chronicle could not open</h1>
          <p className="mt-2 text-sm text-parchment/70">Reload the application to return to the last saved state.</p>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reload
          </Button>
        </section>
      </main>
    );
  }
}
