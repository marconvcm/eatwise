/**
 * Tests for Admin Report Service
 */

import { apiClient } from '../http';
import { AdminReportService } from './adminReport.service';
import type { AdminDashboardReport } from './types/AdminDashboardReport';
import type { UserCaloriesAverage } from './types/UserCaloriesAverage';
import type { WeeklyComparisonReport } from './types/WeeklyComparisonReport';

// Mock the apiClient
jest.mock('../http', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('AdminReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAdminReport', () => {
    it('should call GET /admin/report', async () => {
      const mockWeeklyComparison: WeeklyComparisonReport = {
        currentWeekEntries: 150,
        previousWeekEntries: 120,
        percentageChange: 25.0,
      };

      const mockUserAverages: UserCaloriesAverage[] = [
        { userId: 'user-1', averageCalories: 2000 },
        { userId: 'user-2', averageCalories: 1800 },
      ];

      const mockReport: AdminDashboardReport = {
        weeklyComparison: mockWeeklyComparison,
        userAverages: mockUserAverages,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockReport);

      const result = await AdminReportService.getAdminReport();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/report');
      expect(result).toEqual(mockReport);
    });

    it('should return complete dashboard with nested data', async () => {
      const mockReport: AdminDashboardReport = {
        weeklyComparison: {
          currentWeekEntries: 200,
          previousWeekEntries: 180,
          percentageChange: 11.11,
        },
        userAverages: [
          { userId: 'user-1', averageCalories: 2100 },
          { userId: 'user-2', averageCalories: 1950 },
          { userId: 'user-3', averageCalories: 2200 },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockReport);

      const result = await AdminReportService.getAdminReport();

      expect(result.weeklyComparison).toBeDefined();
      expect(result.userAverages).toBeDefined();
      expect(result.userAverages).toHaveLength(3);
    });

    it('should handle empty user averages', async () => {
      const mockReport: AdminDashboardReport = {
        weeklyComparison: {
          currentWeekEntries: 0,
          previousWeekEntries: 0,
          percentageChange: 0,
        },
        userAverages: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockReport);

      const result = await AdminReportService.getAdminReport();

      expect(result.userAverages).toEqual([]);
    });
  });

  describe('getWeeklyComparison', () => {
    it('should call GET /admin/report/weekly-comparison', async () => {
      const mockComparison: WeeklyComparisonReport = {
        currentWeekEntries: 150,
        previousWeekEntries: 120,
        percentageChange: 25.0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockComparison);

      const result = await AdminReportService.getWeeklyComparison();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/report/weekly-comparison');
      expect(result).toEqual(mockComparison);
    });

    it('should return positive percentage change for growth', async () => {
      const mockComparison: WeeklyComparisonReport = {
        currentWeekEntries: 180,
        previousWeekEntries: 150,
        percentageChange: 20.0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockComparison);

      const result = await AdminReportService.getWeeklyComparison();

      expect(result.percentageChange).toBeGreaterThan(0);
      expect(result.currentWeekEntries).toBeGreaterThan(result.previousWeekEntries);
    });

    it('should return negative percentage change for decline', async () => {
      const mockComparison: WeeklyComparisonReport = {
        currentWeekEntries: 100,
        previousWeekEntries: 150,
        percentageChange: -33.33,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockComparison);

      const result = await AdminReportService.getWeeklyComparison();

      expect(result.percentageChange).toBeLessThan(0);
      expect(result.currentWeekEntries).toBeLessThan(result.previousWeekEntries);
    });

    it('should handle zero entries for both weeks', async () => {
      const mockComparison: WeeklyComparisonReport = {
        currentWeekEntries: 0,
        previousWeekEntries: 0,
        percentageChange: 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockComparison);

      const result = await AdminReportService.getWeeklyComparison();

      expect(result.currentWeekEntries).toBe(0);
      expect(result.previousWeekEntries).toBe(0);
      expect(result.percentageChange).toBe(0);
    });

    it('should handle first week with no previous data', async () => {
      const mockComparison: WeeklyComparisonReport = {
        currentWeekEntries: 100,
        previousWeekEntries: 0,
        percentageChange: 100,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockComparison);

      const result = await AdminReportService.getWeeklyComparison();

      expect(result.percentageChange).toBe(100);
    });
  });

  describe('getUserAverages', () => {
    it('should call GET /admin/report/user-averages', async () => {
      const mockAverages: UserCaloriesAverage[] = [
        { userId: 'user-1', averageCalories: 2000 },
        { userId: 'user-2', averageCalories: 1800 },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue(mockAverages);

      const result = await AdminReportService.getUserAverages();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/report/user-averages');
      expect(result).toEqual(mockAverages);
    });

    it('should return array of user averages', async () => {
      const mockAverages: UserCaloriesAverage[] = [
        { userId: 'user-1', averageCalories: 2100 },
        { userId: 'user-2', averageCalories: 1950 },
        { userId: 'user-3', averageCalories: 2200 },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue(mockAverages);

      const result = await AdminReportService.getUserAverages();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('userId');
      expect(result[0]).toHaveProperty('averageCalories');
    });

    it('should return empty array when no users have entries', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      const result = await AdminReportService.getUserAverages();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle multiple users with different calorie averages', async () => {
      const mockAverages: UserCaloriesAverage[] = [
        { userId: 'user-1', averageCalories: 2500 },
        { userId: 'user-2', averageCalories: 1600 },
        { userId: 'user-3', averageCalories: 2000 },
        { userId: 'user-4', averageCalories: 2200 },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue(mockAverages);

      const result = await AdminReportService.getUserAverages();

      expect(result).toHaveLength(4);
      
      // Verify all have unique user IDs
      const userIds = result.map(u => u.userId);
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(4);
      
      // Verify all have valid calorie values
      result.forEach(avg => {
        expect(typeof avg.averageCalories).toBe('number');
        expect(avg.averageCalories).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Service Integration', () => {
    it('should have all three report methods available', () => {
      expect(AdminReportService.getAdminReport).toBeDefined();
      expect(AdminReportService.getWeeklyComparison).toBeDefined();
      expect(AdminReportService.getUserAverages).toBeDefined();
    });

    it('should all return promises', () => {
      (apiClient.get as jest.Mock).mockResolvedValue({});

      const reportPromise = AdminReportService.getAdminReport();
      const comparisonPromise = AdminReportService.getWeeklyComparison();
      const averagesPromise = AdminReportService.getUserAverages();

      expect(reportPromise).toBeInstanceOf(Promise);
      expect(comparisonPromise).toBeInstanceOf(Promise);
      expect(averagesPromise).toBeInstanceOf(Promise);
    });
  });
});
