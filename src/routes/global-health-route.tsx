import { useNavigate } from '@tanstack/react-router';
import { useAppState } from '../app/app-context';
import { GlobalHealthEquityDashboard } from '../components/GlobalHealthEquityDashboard';

export function GlobalHealthRoute() {
  const navigate = useNavigate();
  const { selectedPersona } = useAppState();

  return (
    <GlobalHealthEquityDashboard
      selectedPersona={selectedPersona}
      onNavigateToStudio={() => void navigate({ to: '/cross-system-intelligence' })}
      onNavigateToODELab={() => void navigate({ to: '/ode-interaction-lab' })}
    />
  );
}