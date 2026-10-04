import { CalibrationDriftHub } from '../components/CalibrationDriftHub';
import { useAppState } from '../app/app-context';

export function CalibrationRoute() {
  const { selectedPersona } = useAppState();
  return <CalibrationDriftHub selectedPersona={selectedPersona} />;
}
