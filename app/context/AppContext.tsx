/**
 * App Context
 * Provides access to all API services throughout the application
 */

import { AdminReportService } from '@/lib/ledger/adminReport.service';
import { LedgerAdminService, LedgerService } from '@/lib/ledger/service';
import { UserProfileService } from '@/lib/user/service';
import React, { createContext, useContext, type ReactNode } from 'react';

// Re-export the debounced food search hook
export { useDebouncedFoodSearch } from '@/lib/hooks/useDebouncedFoodSearch';

interface AppServices {
  ledger: typeof LedgerService;
  ledgerAdmin: typeof LedgerAdminService;
  adminReport: typeof AdminReportService;
  userProfile: typeof UserProfileService;
}

const AppContext = createContext<AppServices | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * App Provider Component
 * Wraps the application and provides service access
 */
export function AppProvider({ children }: AppProviderProps) {
  const services: AppServices = {
    ledger: LedgerService,
    ledgerAdmin: LedgerAdminService,
    adminReport: AdminReportService,
    userProfile: UserProfileService,
  };

  return <AppContext.Provider value={services}>{children}</AppContext.Provider>;
}

/**
 * Hook to access all app services
 * @returns Object containing all API services
 * @throws Error if used outside of AppProvider
 */
export function useAppServices(): AppServices {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppServices must be used within an AppProvider');
  }
  
  return context;
}
