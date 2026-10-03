import { createRootRoute, createRoute, createRouter, lazyRouteComponent } from '@tanstack/react-router';
import { RouteError, RoutePending } from './route-boundaries';
import { RootLayout } from './root-layout';

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
      <h2 className="font-cinzel text-2xl text-white">Research view not found</h2>
      <a href="/" className="mt-4 inline-block text-amber-300 underline">Return to Research Institute Home</a>
    </section>
  ),
});

const routes = [
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: lazyRouteComponent(() => import('../routes/home-route'), 'HomeRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/scientific-audit', component: lazyRouteComponent(() => import('../routes/scientific-audit-route'), 'ScientificAuditRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/global-health-equity', component: lazyRouteComponent(() => import('../routes/global-health-route'), 'GlobalHealthRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/cross-system-intelligence', component: lazyRouteComponent(() => import('../routes/intelligence-route'), 'IntelligenceRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/ode-interaction-lab', component: lazyRouteComponent(() => import('../routes/ode-lab-route'), 'OdeLabRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/clinical-workbench', component: lazyRouteComponent(() => import('../routes/clinical-workbench-route'), 'ClinicalWorkbenchRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/ai-clinical-reasoning', component: lazyRouteComponent(() => import('../routes/ai-synthesis-route'), 'AiSynthesisRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/architecture', component: lazyRouteComponent(() => import('../routes/architecture-route'), 'ArchitectureRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/calibration-governance', component: lazyRouteComponent(() => import('../routes/calibration-route'), 'CalibrationRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/math', component: lazyRouteComponent(() => import('../client/routes/math.lazy'), 'MathRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/compare/$conditionId', component: lazyRouteComponent(() => import('../client/routes/condition-comparison.lazy'), 'ConditionComparisonRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/new', component: lazyRouteComponent(() => import('../client/routes/new-evidence.lazy'), 'NewEvidenceRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/editor', component: lazyRouteComponent(() => import('../client/routes/editor.lazy'), 'EditorRoute') }),
  createRoute({ getParentRoute: () => rootRoute, path: '/auth/callback', component: lazyRouteComponent(() => import('../client/routes/auth-callback.lazy'), 'AuthCallbackRoute') }),
];

const routeTree = rootRoute.addChildren(routes);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: RoutePending,
  defaultErrorComponent: RouteError,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}