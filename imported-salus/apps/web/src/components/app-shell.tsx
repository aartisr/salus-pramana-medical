import React from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { beginLogin, signOut } from "../lib/auth";
import { useAuthSession } from "../hooks/use-auth-session";
import { Seo } from "./seo";

function HeaderAuthActions() {
  const auth = useAuthSession();

  if (!auth.configured) {
    return <span className="muted auth-hint">Auth setup required for protected writes</span>;
  }

  return auth.authenticated ? (
    <button type="button" className="header-auth-button" onClick={() => signOut()}>
      Sign Out
    </button>
  ) : (
    <button
      type="button"
      className="header-auth-button"
      onClick={() => {
        beginLogin("/new").catch((error) => {
          console.error(error);
        });
      }}
    >
      Sign In
    </button>
  );
}

export function AppShell() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="app-shell">
      <Seo />
      <header className="app-header">
        <div className="header-topline">
          <span className="header-kicker">Live Evidence Platform</span>
          <p className="muted header-support-copy">Decision clarity with transparent evidence, confidence signals, and safety context.</p>
        </div>
        <div className="header-main-row">
          <Link to="/" className="brand-block" aria-label="SALUS home">
            <div className="brand-mark-row">
              <span className="brand-mark" aria-hidden="true">S</span>
              <div>
                <h1>SALUS</h1>
                <p className="brand-title-sub">Evidence clarity across medical systems</p>
              </div>
            </div>
          </Link>
          <nav className="app-nav" aria-label="Primary navigation">
            <Link to="/" activeProps={{ className: "active-link" }}>
              Compare
            </Link>
            <Link to="/compare/$conditionId" params={{ conditionId: "cond-type2-diabetes" }} activeProps={{ className: "active-link" }}>
              Systems View
            </Link>
            <Link to="/new" activeProps={{ className: "active-link" }}>
              Submit Evidence
            </Link>
            <Link to="/editor" activeProps={{ className: "active-link" }}>
              Editor
            </Link>
            <Link to="/math" activeProps={{ className: "active-link" }}>
              Math Explained
            </Link>
          </nav>
          <div className="header-actions">
            <Link to="/new" className="header-cta">Add Evidence</Link>
            <HeaderAuthActions />
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="app-footer" aria-label="Site footer">
        <section className="footer-grid">
          <article className="footer-panel">
            <h2>SALUS</h2>
            <p className="muted">Evidence-forward guidance for integrative healthcare decisions, built to make uncertainty visible instead of hidden.</p>
          </article>
          <article className="footer-panel">
            <h3>Explore</h3>
            <div className="footer-links">
              <Link to="/">Compare Treatments</Link>
              <Link to="/compare/$conditionId" params={{ conditionId: "cond-type2-diabetes" }}>Cross-System View</Link>
              <Link to="/math">Scoring Math</Link>
            </div>
          </article>
          <article className="footer-panel">
            <h3>Contribute</h3>
            <div className="footer-links">
              <Link to="/new">Submit Evidence</Link>
              <Link to="/math">How Grading Works</Link>
            </div>
          </article>
          <article className="footer-panel">
            <h3>Trust and Safety</h3>
            <ul className="footer-checks">
              <li>Registry-linked evidence required</li>
              <li>Source URL allowlist enforced</li>
              <li>No causal equivalency assumptions</li>
            </ul>
          </article>
        </section>
        <div className="footer-meta">
          <small>© {currentYear} SALUS. Evidence transparency for safer care decisions.</small>
          <small>
            Crafted by <a href="https://ai-aarti.com" target="_blank" rel="noreferrer noopener">Aarti S Ravikumar</a>
          </small>
        </div>
      </footer>
    </main>
  );
}
