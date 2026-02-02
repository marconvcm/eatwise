/**
 * Admin Report API Service
 * Maps to AdminReportController endpoints in Spring WebFlux backend
 * Requires ROLE_ADMIN
 */

import { apiClient } from '../http';
import type { AdminDashboardReport } from './types/AdminDashboardReport';
import type { UserCaloriesAverage } from './types/UserCaloriesAverage';
import type { WeeklyComparisonReport } from './types/WeeklyComparisonReport';

export const AdminReportService = {
  /**
   * Get admin dashboard report
   * Includes weekly comparison and user averages
   * GET /admin/report
   * @returns Admin dashboard report with metrics
   */
  async getAdminReport(): Promise<AdminDashboardReport> {
    return apiClient.get<AdminDashboardReport>('/admin/report');
  },

  /**
   * Get weekly comparison report
   * Compares current week entries with previous week
   * GET /admin/report/weekly-comparison
   * @returns Weekly comparison report
   */
  async getWeeklyComparison(): Promise<WeeklyComparisonReport> {
    return apiClient.get<WeeklyComparisonReport>('/admin/report/weekly-comparison');
  },

  /**
   * Get user calorie averages
   * Returns average calories per user
   * GET /admin/report/user-averages
   * @returns Array of user calorie averages
   */
  async getUserAverages(): Promise<UserCaloriesAverage[]> {
    return apiClient.get<UserCaloriesAverage[]>('/admin/report/user-averages');
  },
};
