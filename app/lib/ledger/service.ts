/**
 * Ledger API Service
 * Maps to LedgerController endpoints in Spring WebFlux backend
 */

import { apiClient } from '../http';
import type { LedgerEntry } from './types/LedgerEntry';
import type { LedgerEntryRequest } from './types/LedgerEntryRequest';

/**
 * Factory function to create ledger service with different base paths
 */
function createLedgerService(basePath: string) {
  return {
    /**
     * Get all ledger entries for the authenticated user
     * GET {basePath}
     * @returns Array of ledger entries
     */
    async getEntries(): Promise<LedgerEntry[]> {
      return apiClient.get<LedgerEntry[]>(basePath);
    },

    /**
     * Create a new ledger entry
     * POST {basePath}
     * @param data - Ledger entry request data
     * @returns Created ledger entry
     */
    async createEntry(data: LedgerEntryRequest): Promise<LedgerEntry> {
      return apiClient.post<LedgerEntry, LedgerEntryRequest>(basePath, data);
    },

    /**
     * Update an existing ledger entry
     * PUT {basePath}/{id}
     * @param id - Ledger entry ID
     * @param data - Updated ledger entry data
     * @returns Updated ledger entry
     */
    async updateEntry(id: string, data: LedgerEntryRequest): Promise<LedgerEntry> {
      return apiClient.put<LedgerEntry, LedgerEntryRequest>(`${basePath}/${id}`, data);
    },

    /**
     * Delete a ledger entry
     * DELETE {basePath}/{id}
     * @param id - Ledger entry ID
     * @returns true if deleted successfully
     */
    async deleteEntry(id: string): Promise<boolean> {
      return apiClient.delete<boolean>(`${basePath}/${id}`);
    },

    /**
     * Get all ledger entries and group them by day
     * @returns Record mapping date (YYYY-MM-DD) to array of ledger entries for that day
     */
    async getEntriesGroupedByDay(): Promise<Record<string, LedgerEntry[]>> {
      const entries = await this.getEntries();
      
      // Get today's date in local timezone as YYYY-MM-DD
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      if (entries.length === 0) {
        // Return at least today even if there are no entries
        return { [todayKey]: [] };
      }
      
      // Find the oldest date in the collection
      let oldestDate = new Date(entries[0].registrationDate);
      
      entries.forEach(entry => {
        const entryDate = new Date(entry.registrationDate);
        if (entryDate < oldestDate) oldestDate = entryDate;
      });
      
      // Normalize oldest date to start of day in local timezone
      oldestDate.setHours(0, 0, 0, 0);
      
      // End date is today
      const newestDate = new Date();
      newestDate.setHours(23, 59, 59, 999);
      
      // Initialize grouped object with all dates from oldest to today
      const grouped: Record<string, LedgerEntry[]> = {};
      const currentDate = new Date(oldestDate);
      
      while (currentDate <= newestDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        grouped[dateKey] = [];
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Add entries to their respective days
      entries.forEach(entry => {
        const date = entry.registrationDate.split('T')[0];
        if (grouped[date]) {
          grouped[date].push(entry);
        }
      });
      
      return grouped;
    },

    /**
     * Get total calories grouped by day
     * @returns Record mapping date (YYYY-MM-DD) to total calories for that day
     */
    async getTotalKcalGroupedByDay(): Promise<Record<string, number>> {
      const entriesByDay = await this.getEntriesGroupedByDay();
      
      const totalsByDay: Record<string, number> = {};
      
      for (const [date, entries] of Object.entries(entriesByDay)) {
        totalsByDay[date] = entries.reduce((sum, entry) => sum + entry.calories, 0);
      }
      
      return totalsByDay;
    },
  };
}

/**
 * Regular user ledger service
 * Requires ROLE_USER
 */
export const LedgerService = createLedgerService('/ledger/entries');

/**
 * Admin ledger service
 * Requires ROLE_ADMIN
 * Can access and manage all ledger entries across users
 */
export const LedgerAdminService = createLedgerService('/admin/ledger/entries');
