import { createContext, useContext } from 'react';
import type { MockDashboardState } from '../types';

export interface DashboardContextType {
  state: MockDashboardState;
  onChange: (newState: MockDashboardState) => void;
  onHelpTrigger: (query: string) => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardContextProvider');
  }
  return context;
};
