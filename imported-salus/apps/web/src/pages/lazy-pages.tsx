import React from "react";

function routeFallback() {
  return (
    <section className="panel" aria-live="polite">
      <h2>Loading view...</h2>
      <p className="muted">Preparing this page.</p>
    </section>
  );
}

function lazyRoute(loader: () => Promise<{ default: React.ComponentType }>) {
  const LazyComponent = React.lazy(loader);

  return function LazyRouteComponent() {
    return (
      <React.Suspense fallback={routeFallback()}>
        <LazyComponent />
      </React.Suspense>
    );
  };
}

export const DashboardPageLazy = lazyRoute(async () => ({ default: (await import("./app-pages")).DashboardPage }));
export const NewEvidencePageLazy = lazyRoute(async () => ({ default: (await import("./app-pages")).NewEvidencePage }));
export const ComparisonPageLazy = lazyRoute(async () => ({ default: (await import("./app-pages")).ComparisonPage }));
export const EditorPageLazy = lazyRoute(async () => ({ default: (await import("./app-pages")).EditorPage }));
export const AuthCallbackPageLazy = lazyRoute(async () => ({ default: (await import("./app-pages")).AuthCallbackPage }));
export const MathExplainerPageLazy = lazyRoute(async () => ({ default: (await import("./app-pages")).MathExplainerPage }));
