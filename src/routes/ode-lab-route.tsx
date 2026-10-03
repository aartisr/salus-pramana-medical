import { useAppState } from '../app/app-context';
import { ODESimulationLab } from '../components/ODESimulationLab';

export function OdeLabRoute() {
  const { selectedPersona, odeInterventionA, odeInterventionB } = useAppState();
  return <ODESimulationLab selectedPersona={selectedPersona} initialInterventionA={odeInterventionA} initialInterventionB={odeInterventionB} />;
}