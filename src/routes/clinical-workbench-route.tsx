import { useAppState } from '../app/app-context';
import { DiagnosticDecisionWorkbench } from '../components/DiagnosticDecisionWorkbench';

export function ClinicalWorkbenchRoute() {
  const { selectedPersona } = useAppState();
  return <DiagnosticDecisionWorkbench selectedPersona={selectedPersona} />;
}