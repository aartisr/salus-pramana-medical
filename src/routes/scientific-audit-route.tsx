import { useNavigate } from '@tanstack/react-router';
import { useAppState } from '../app/app-context';
import { NobelEvaluationSuite } from '../components/NobelEvaluationSuite';

export function ScientificAuditRoute() {
  const navigate = useNavigate();
  const { selectedPersona } = useAppState();

  return (
    <NobelEvaluationSuite
      selectedPersona={selectedPersona}
      onNavigateToHealthEquity={() => void navigate({ to: '/global-health-equity' })}
      onNavigateToStudio={() => void navigate({ to: '/cross-system-intelligence' })}
      onNavigateToODELab={() => void navigate({ to: '/ode-interaction-lab' })}
      onNavigateToWorkbench={() => void navigate({ to: '/clinical-workbench' })}
    />
  );
}