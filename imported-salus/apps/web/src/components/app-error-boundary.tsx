import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Unexpected application error",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled application error", { error, info });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="app-shell">
        <section className="panel auth-required-panel" role="alert" aria-live="assertive">
          <h2>Something went wrong</h2>
          <p className="muted">{this.state.message}</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload application
          </button>
        </section>
      </main>
    );
  }
}
