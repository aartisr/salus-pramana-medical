import { RepositoryCodeArchitecture } from '../components/RepositoryCodeArchitecture';
import { useAppState } from '../app/app-context';

export function ArchitectureRoute() {
  const { selectedPersona } = useAppState();
  return <RepositoryCodeArchitecture selectedPersona={selectedPersona} />;
}
