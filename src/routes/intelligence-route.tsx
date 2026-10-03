import { useNavigate } from '@tanstack/react-router';
import { useAppState } from '../app/app-context';
import { ClinicalIntelligenceStudio } from '../components/ClinicalIntelligenceStudio';

export function IntelligenceRoute() {
  const navigate = useNavigate();
  const { selectedPersona, setOdeInterventions } = useAppState();

  return (
    <ClinicalIntelligenceStudio
      selectedPersona={selectedPersona}
      onSelectInterventionForODE={(interventionA, interventionB) => {
        setOdeInterventions(interventionA, interventionB);
        void navigate({ to: '/ode-interaction-lab' });
      }}
    />
  );
}