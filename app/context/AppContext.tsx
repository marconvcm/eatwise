/**
 * App Context
 * Provides access to all API services throughout the application
 */

import { FoodSearchService } from '@/lib/food';
import { AdminReportService } from '@/lib/ledger/adminReport.service';
import { LedgerAdminService, LedgerService } from '@/lib/ledger/service';
import type { LedgerEntry } from '@/lib/ledger/types/LedgerEntry';
import { UserProfileService } from '@/lib/user/service';
import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Re-export the debounced food search hook
export { useDebouncedFoodSearch } from '@/lib/hooks/useDebouncedFoodSearch';

interface LedgerEntryModalState {
  isOpen: boolean;
  currentDay: string;
  currentEntry: LedgerEntry | null;
}

interface AppServices {
  ledger: typeof LedgerService;
  ledgerAdmin: typeof LedgerAdminService;
  adminReport: typeof AdminReportService;
  userProfile: typeof UserProfileService;
  foodSearchService: typeof FoodSearchService;
}

interface AppContextValue extends AppServices {
  ledgerEntryModal: LedgerEntryModalState;
  openLedgerEntryModal: (day: string, entry: LedgerEntry | null) => void;
  closeLedgerEntryModal: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * App Provider Component
 * Wraps the application and provides service access
 */
export function AppProvider({ children }: AppProviderProps) {
  const [ledgerEntryModal, setLedgerEntryModal] = useState<LedgerEntryModalState>({
    isOpen: false,
    currentDay: new Date().toISOString().split('T')[0],
    currentEntry: null,
  });

  const openLedgerEntryModal = (day: string, entry: LedgerEntry | null) => {
    setLedgerEntryModal({
      isOpen: true,
      currentDay: day,
      currentEntry: entry,
    });
  };

  const closeLedgerEntryModal = () => {
    setLedgerEntryModal(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const services: AppServices = {
    ledger: LedgerService,
    ledgerAdmin: LedgerAdminService,
    adminReport: AdminReportService,
    userProfile: UserProfileService,
    foodSearchService: FoodSearchService,
  };

  const contextValue: AppContextValue = {
    ...services,
    ledgerEntryModal,
    openLedgerEntryModal,
    closeLedgerEntryModal,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

/**
 * Hook to access all app services
 * @returns Object containing all API services
 * @throws Error if used outside of AppProvider
 */
export function useAppServices(): AppContextValue {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppServices must be used within an AppProvider');
  }
  
  return context;
}
