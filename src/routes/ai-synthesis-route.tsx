import { useAppState } from '../app/app-context';
import { AIClinicalSynthesis } from '../components/AIClinicalSynthesis';

export function AiSynthesisRoute() {
  const { selectedPersona } = useAppState();
  return <AIClinicalSynthesis selectedPersona={selectedPersona} />;
}