import { useNavigate } from '@tanstack/react-router';
import { routeByTab, TabId } from '../app/route-paths';
import { useAppState } from '../app/app-context';
import { ResearchHomepage } from '../components/ResearchHomepage';

export function HomeRoute() {
  const navigate = useNavigate();
  const { selectedPersona, setIsExportModalOpen } = useAppState();

  const navigateToTab = (tabId: string) => {
    const path = routeByTab[tabId as TabId];
    if (path) void navigate({ to: path });
  };

  return (
    <ResearchHomepage
      selectedPersona={selectedPersona}
      onNavigateToTab={navigateToTab}
      onOpenExportModal={() => setIsExportModalOpen(true)}
    />
  );
}