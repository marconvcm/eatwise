/**
 * Tests for Ledger Service
 */

import { apiClient } from '../http';
import { LedgerAdminService, LedgerService } from './service';
import type { LedgerEntry } from './types/LedgerEntry';
import type { LedgerEntryRequest } from './types/LedgerEntryRequest';

// Mock the apiClient
jest.mock('../http', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('LedgerService', () => {
  const mockEntry: LedgerEntry = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    calories: 500,
    subject: 'Lunch',
    registrationDate: '2026-02-01T12:00:00',
  };

  const mockRequest: LedgerEntryRequest = {
    calories: 500,
    subject: 'Lunch',
    registrationDate: '2026-02-01T12:00:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEntries', () => {
    it('should call GET /ledger/entries', async () => {
      const mockEntries = [mockEntry];
      (apiClient.get as jest.Mock).mockResolvedValue(mockEntries);

      const result = await LedgerService.getEntries();

      expect(apiClient.get).toHaveBeenCalledWith('/ledger/entries');
      expect(result).toEqual(mockEntries);
    });

    it('should return empty array when no entries exist', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      const result = await LedgerService.getEntries();

      expect(result).toEqual([]);
    });
  });

  describe('createEntry', () => {
    it('should call POST /ledger/entries with data', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockEntry);

      const result = await LedgerService.createEntry(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/ledger/entries', mockRequest);
      expect(result).toEqual(mockEntry);
    });

    it('should create entry with all required fields', async () => {
      const newEntry: LedgerEntryRequest = {
        calories: 750,
        subject: 'Dinner',
        registrationDate: '2026-02-01T18:00:00',
      };

      const createdEntry: LedgerEntry = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        ...newEntry,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(createdEntry);

      const result = await LedgerService.createEntry(newEntry);

      expect(result).toEqual(createdEntry);
    });
  });

  describe('updateEntry', () => {
    it('should call PUT /ledger/entries/{id} with data', async () => {
      const updatedEntry = { ...mockEntry, calories: 600 };
      (apiClient.put as jest.Mock).mockResolvedValue(updatedEntry);

      const result = await LedgerService.updateEntry(mockEntry.id, {
        ...mockRequest,
        calories: 600,
      });

      expect(apiClient.put).toHaveBeenCalledWith(
        `/ledger/entries/${mockEntry.id}`,
        expect.objectContaining({ calories: 600 })
      );
      expect(result).toEqual(updatedEntry);
    });

    it('should update specific fields while keeping others', async () => {
      const updateData: LedgerEntryRequest = {
        ...mockRequest,
        subject: 'Updated Lunch',
      };

      const updatedEntry = { ...mockEntry, subject: 'Updated Lunch' };
      (apiClient.put as jest.Mock).mockResolvedValue(updatedEntry);

      const result = await LedgerService.updateEntry(mockEntry.id, updateData);

      expect(result.subject).toBe('Updated Lunch');
      expect(result.calories).toBe(mockEntry.calories);
    });
  });

  describe('deleteEntry', () => {
    it('should call DELETE /ledger/entries/{id}', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(true);

      const result = await LedgerService.deleteEntry(mockEntry.id);

      expect(apiClient.delete).toHaveBeenCalledWith(`/ledger/entries/${mockEntry.id}`);
      expect(result).toBe(true);
    });

    it('should return boolean result', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(true);

      const result = await LedgerService.deleteEntry(mockEntry.id);

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });
});

describe('LedgerAdminService', () => {
  const mockEntry: LedgerEntry = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    calories: 500,
    subject: 'Lunch',
    registrationDate: '2026-02-01T12:00:00',
  };

  const mockRequest: LedgerEntryRequest = {
    calories: 500,
    subject: 'Lunch',
    registrationDate: '2026-02-01T12:00:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEntries', () => {
    it('should call GET /admin/ledger/entries', async () => {
      const mockEntries = [mockEntry];
      (apiClient.get as jest.Mock).mockResolvedValue(mockEntries);

      const result = await LedgerAdminService.getEntries();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/ledger/entries');
      expect(result).toEqual(mockEntries);
    });

    it('should return all users entries for admin', async () => {
      const multiUserEntries = [
        mockEntry,
        { ...mockEntry, id: '123e4567-e89b-12d3-a456-426614174003', userId: 'different-user' },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue(multiUserEntries);

      const result = await LedgerAdminService.getEntries();

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(mockEntry.userId);
      expect(result[1].userId).toBe('different-user');
    });
  });

  describe('createEntry', () => {
    it('should call POST /admin/ledger/entries with data', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockEntry);

      const result = await LedgerAdminService.createEntry(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/admin/ledger/entries', mockRequest);
      expect(result).toEqual(mockEntry);
    });
  });

  describe('updateEntry', () => {
    it('should call PUT /admin/ledger/entries/{id} with data', async () => {
      const updatedEntry = { ...mockEntry, calories: 600 };
      (apiClient.put as jest.Mock).mockResolvedValue(updatedEntry);

      const result = await LedgerAdminService.updateEntry(mockEntry.id, {
        ...mockRequest,
        calories: 600,
      });

      expect(apiClient.put).toHaveBeenCalledWith(
        `/admin/ledger/entries/${mockEntry.id}`,
        expect.objectContaining({ calories: 600 })
      );
      expect(result).toEqual(updatedEntry);
    });
  });

  describe('deleteEntry', () => {
    it('should call DELETE /admin/ledger/entries/{id}', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(true);

      const result = await LedgerAdminService.deleteEntry(mockEntry.id);

      expect(apiClient.delete).toHaveBeenCalledWith(`/admin/ledger/entries/${mockEntry.id}`);
      expect(result).toBe(true);
    });

    it('should allow admin to delete any user entry', async () => {
      const otherUserEntryId = '123e4567-e89b-12d3-a456-426614174999';
      (apiClient.delete as jest.Mock).mockResolvedValue(true);

      const result = await LedgerAdminService.deleteEntry(otherUserEntryId);

      expect(apiClient.delete).toHaveBeenCalledWith(`/admin/ledger/entries/${otherUserEntryId}`);
      expect(result).toBe(true);
    });
  });
});

describe('Service Endpoints Comparison', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use different base paths for user vs admin services', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([]);

    await LedgerService.getEntries();
    await LedgerAdminService.getEntries();

    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/ledger/entries');
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/admin/ledger/entries');
  });

  it('should have identical API interfaces for both services', () => {
    const userMethods = Object.keys(LedgerService).sort();
    const adminMethods = Object.keys(LedgerAdminService).sort();

    expect(userMethods).toEqual(adminMethods);
    expect(userMethods).toEqual(['createEntry', 'deleteEntry', 'getEntries', 'updateEntry']);
  });
});
