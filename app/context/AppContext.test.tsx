import { AdminReportService } from '@/lib/ledger/adminReport.service';
import { LedgerAdminService, LedgerService } from '@/lib/ledger/service';
import { UserProfileService } from '@/lib/user/service';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { AppProvider, useAppServices } from './AppContext';

describe('AppContext', () => {
  describe('AppProvider', () => {
    it('should provide context', () => {
      const { result } = renderHook(() => useAppServices(), {
        wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
      });

      expect(result.current).toBeDefined();
    });
  });

  describe('useAppServices', () => {
    it('should provide all services', () => {
      const { result } = renderHook(() => useAppServices(), {
        wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
      });

      expect(result.current).toBeDefined();
      expect(result.current.ledger).toBe(LedgerService);
      expect(result.current.ledgerAdmin).toBe(LedgerAdminService);
      expect(result.current.adminReport).toBe(AdminReportService);
      expect(result.current.userProfile).toBe(UserProfileService);
    });

    it('should throw error when used outside of AppProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const { result } = renderHook(() => useAppServices());
        // If we get here, the hook didn't throw during render
        // Try to access the result to trigger the error
        expect(() => result.current).toThrow();
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('useAppServices must be used within an AppProvider');
      }

      consoleError.mockRestore();
    });

    it('should provide access to ledger service methods', () => {
      const { result } = renderHook(() => useAppServices(), {
        wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
      });

      expect(result.current.ledger.getEntries).toBeDefined();
      expect(result.current.ledger.createEntry).toBeDefined();
      expect(result.current.ledger.updateEntry).toBeDefined();
      expect(result.current.ledger.deleteEntry).toBeDefined();
    });

    it('should provide access to admin ledger service methods', () => {
      const { result } = renderHook(() => useAppServices(), {
        wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
      });

      expect(result.current.ledgerAdmin.getEntries).toBeDefined();
      expect(result.current.ledgerAdmin.createEntry).toBeDefined();
      expect(result.current.ledgerAdmin.updateEntry).toBeDefined();
      expect(result.current.ledgerAdmin.deleteEntry).toBeDefined();
    });

    it('should provide access to admin report service methods', () => {
      const { result } = renderHook(() => useAppServices(), {
        wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
      });

      expect(result.current.adminReport.getAdminReport).toBeDefined();
      expect(result.current.adminReport.getWeeklyComparison).toBeDefined();
      expect(result.current.adminReport.getUserAverages).toBeDefined();
    });

    it('should provide access to user profile service methods', () => {
      const { result } = renderHook(() => useAppServices(), {
        wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
      });

      expect(result.current.userProfile.getProfile).toBeDefined();
      expect(result.current.userProfile.inviteUser).toBeDefined();
    });
  });
});
