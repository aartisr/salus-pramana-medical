import React, { createContext, useContext, useState } from 'react';
import { PersonaMode } from '../types/salus';

interface AppState {
  selectedPersona: PersonaMode;
  setSelectedPersona: (persona: PersonaMode) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isCitationModalOpen: boolean;
  setIsCitationModalOpen: (open: boolean) => void;
  odeInterventionA: string;
  odeInterventionB: string;
  setOdeInterventions: (interventionA: string, interventionB: string) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: React.PropsWithChildren) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaMode>('nobel_juror');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [odeInterventionA, setOdeInterventionA] = useState('Metformin Hydrochloride (1000 mg)');
  const [odeInterventionB, setOdeInterventionB] = useState('Daruharidra / Berberine Extract (500 mg)');

  const value: AppState = {
    selectedPersona,
    setSelectedPersona,
    isExportModalOpen,
    setIsExportModalOpen,
    isCitationModalOpen,
    setIsCitationModalOpen,
    odeInterventionA,
    odeInterventionB,
    setOdeInterventions: (interventionA, interventionB) => {
      setOdeInterventionA(interventionA);
      setOdeInterventionB(interventionB);
    },
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used within AppStateProvider');
  return value;
}