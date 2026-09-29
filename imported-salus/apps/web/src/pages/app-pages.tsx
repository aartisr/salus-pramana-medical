import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CompareDashboard } from "../components/compare-dashboard";
import { ComparisonView } from "../components/comparison-view";
import { EditorConsole } from "../components/editor-console";
import { MathExplainer } from "../components/math-explainer";
import { NewEvidenceForm } from "../components/new-evidence-form";
import { beginLogin, handleAuthCallback } from "../lib/auth";
import { useAuthSession } from "../hooks/use-auth-session";

export function DashboardPage() {
  return (
    <section>
      <CompareDashboard />
    </section>
  );
}

export function NewEvidencePage() {
  const auth = useAuthSession();

  if (auth.configured && !auth.authenticated) {
    return (
      <section className="panel auth-required-panel">
        <h2>Sign in to submit evidence</h2>
        <p className="muted">This action is protected by Cognito authentication and editorial safeguards.</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            beginLogin("/new").catch((error) => {
              console.error(error);
            });
          }}
        >
          Continue with Secure Sign-In
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Add verifiable evidence</h2>
      {!auth.configured ? (
        <p className="muted">Auth is not configured in this environment. Configure Cognito variables before production use.</p>
      ) : null}
      <p className="muted">Structured submission keeps quality high and improves confidence ranking for everyone.</p>
      <NewEvidenceForm />
    </section>
  );
}

export function EditorPage() {
  const auth = useAuthSession();

  if (auth.configured && !auth.authenticated) {
    return (
      <section className="panel auth-required-panel">
        <h2>Sign in to access Editor Console</h2>
        <p className="muted">Editorial actions require authenticated tokens and editor group authorization.</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            beginLogin("/editor").catch((error) => {
              console.error(error);
            });
          }}
        >
          Continue with Secure Sign-In
        </button>
      </section>
    );
  }

  return <EditorConsole />;
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = React.useState("Completing secure sign-in...");

  React.useEffect(() => {
    let isMounted = true;

    handleAuthCallback()
      .then((target) => {
        if (!isMounted) {
          return;
        }
        navigate({ to: target });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        setMessage(error instanceof Error ? error.message : "Failed to complete sign-in");
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <section className="panel auth-required-panel">
      <h2>Authentication Callback</h2>
      <p className="muted">{message}</p>
      <Link to="/" className="compare-link">Return to dashboard</Link>
    </section>
  );
}

export function MathExplainerPage() {
  return <MathExplainer />;
}

export const ComparisonPage = ComparisonView;
