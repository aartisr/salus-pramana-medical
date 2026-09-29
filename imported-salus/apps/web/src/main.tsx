import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppErrorBoundary } from "./components/app-error-boundary";
import { AppShell } from "./components/app-shell";
import {
  AuthCallbackPageLazy,
  ComparisonPageLazy,
  DashboardPageLazy,
  EditorPageLazy,
  MathExplainerPageLazy,
  NewEvidencePageLazy,
} from "./pages/lazy-pages";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        // Authentication and validation failures are actionable, not transient.
        const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
        return status !== 401 && status !== 403 && status < 400 && failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

const rootRoute = createRootRoute({ component: AppShell });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPageLazy,
});

const newEvidenceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new",
  component: NewEvidencePageLazy,
});

const comparisonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compare/$conditionId",
  component: ComparisonPageLazy,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor",
  component: EditorPageLazy,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  component: AuthCallbackPageLazy,
});

const mathExplainerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/math",
  component: MathExplainerPageLazy,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  newEvidenceRoute,
  comparisonRoute,
  editorRoute,
  authCallbackRoute,
  mathExplainerRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);
