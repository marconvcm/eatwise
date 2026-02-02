/**
 * Tests for User Profile Service
 */

import { apiClient } from '../http';
import { UserProfileService } from './service';
import type { UserProfile } from './types/UserProfile';
import type { UserProfileInvite } from './types/UserProfileInvite';
import type { UserProfileInviteRequest } from './types/UserProfileInviteRequest';

// Mock the apiClient
jest.mock('../http', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('UserProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should call GET /profile/me', async () => {
      const mockProfile: UserProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@example.com',
        isAdmin: false,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockProfile);

      const result = await UserProfileService.getProfile();

      expect(apiClient.get).toHaveBeenCalledWith('/profile/me');
      expect(result).toEqual(mockProfile);
    });

    it('should return user profile with all fields', async () => {
      const mockProfile: UserProfile = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        isAdmin: true,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockProfile);

      const result = await UserProfileService.getProfile();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('isAdmin');
      expect(typeof result.isAdmin).toBe('boolean');
    });

    it('should return admin user profile', async () => {
      const adminProfile: UserProfile = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Admin User',
        email: 'admin@example.com',
        isAdmin: true,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(adminProfile);

      const result = await UserProfileService.getProfile();

      expect(result.isAdmin).toBe(true);
    });

    it('should return regular user profile', async () => {
      const regularProfile: UserProfile = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Regular User',
        email: 'user@example.com',
        isAdmin: false,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(regularProfile);

      const result = await UserProfileService.getProfile();

      expect(result.isAdmin).toBe(false);
    });
  });

  describe('inviteUser', () => {
    it('should call POST /profile/invite with request data', async () => {
      const inviteRequest: UserProfileInviteRequest = {
        name: 'Bob Johnson',
        targetUserEmail: 'bob.johnson@example.com',
        message: 'Join our platform!',
      };

      const mockInvite: UserProfileInvite = {
        id: '123e4567-e89b-12d3-a456-426614174010',
        sourceUserId: '123e4567-e89b-12d3-a456-426614174000',
        targetName: 'Bob Johnson',
        targetUserEmail: 'bob.johnson@example.com',
        message: 'Join our platform!',
        createdAt: '2026-02-01T12:00:00',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockInvite);

      const result = await UserProfileService.inviteUser(inviteRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/profile/invite', inviteRequest);
      expect(result).toEqual(mockInvite);
    });

    it('should create invite with all required fields', async () => {
      const inviteRequest: UserProfileInviteRequest = {
        name: 'Alice Williams',
        targetUserEmail: 'alice@example.com',
        message: 'Welcome to Eatwise',
      };

      const mockInvite: UserProfileInvite = {
        id: '123e4567-e89b-12d3-a456-426614174011',
        sourceUserId: '123e4567-e89b-12d3-a456-426614174000',
        targetName: 'Alice Williams',
        targetUserEmail: 'alice@example.com',
        message: 'Welcome to Eatwise',
        createdAt: '2026-02-01T12:30:00',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockInvite);

      const result = await UserProfileService.inviteUser(inviteRequest);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('sourceUserId');
      expect(result).toHaveProperty('targetName');
      expect(result).toHaveProperty('targetUserEmail');
      expect(result).toHaveProperty('createdAt');
      expect(result.targetName).toBe(inviteRequest.name);
      expect(result.targetUserEmail).toBe(inviteRequest.targetUserEmail);
    });

    it('should create invite without optional message', async () => {
      const inviteRequest: UserProfileInviteRequest = {
        name: 'Charlie Brown',
        targetUserEmail: 'charlie@example.com',
      };

      const mockInvite: UserProfileInvite = {
        id: '123e4567-e89b-12d3-a456-426614174012',
        sourceUserId: '123e4567-e89b-12d3-a456-426614174000',
        targetName: 'Charlie Brown',
        targetUserEmail: 'charlie@example.com',
        createdAt: '2026-02-01T13:00:00',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockInvite);

      const result = await UserProfileService.inviteUser(inviteRequest);

      expect(result.message).toBeUndefined();
      expect(result.targetName).toBe('Charlie Brown');
    });

    it('should handle invite with custom message', async () => {
      const inviteRequest: UserProfileInviteRequest = {
        name: 'David Lee',
        targetUserEmail: 'david@example.com',
        message: 'Hey David, check out this awesome calorie tracking app!',
      };

      const mockInvite: UserProfileInvite = {
        id: '123e4567-e89b-12d3-a456-426614174013',
        sourceUserId: '123e4567-e89b-12d3-a456-426614174000',
        targetName: 'David Lee',
        targetUserEmail: 'david@example.com',
        message: 'Hey David, check out this awesome calorie tracking app!',
        createdAt: '2026-02-01T13:30:00',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockInvite);

      const result = await UserProfileService.inviteUser(inviteRequest);

      expect(result.message).toBe(inviteRequest.message);
    });

    it('should return created invite with timestamp', async () => {
      const inviteRequest: UserProfileInviteRequest = {
        name: 'Emma Wilson',
        targetUserEmail: 'emma@example.com',
        message: 'Join us!',
      };

      const currentTime = new Date().toISOString();
      const mockInvite: UserProfileInvite = {
        id: '123e4567-e89b-12d3-a456-426614174014',
        sourceUserId: '123e4567-e89b-12d3-a456-426614174000',
        targetName: 'Emma Wilson',
        targetUserEmail: 'emma@example.com',
        message: 'Join us!',
        createdAt: currentTime,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockInvite);

      const result = await UserProfileService.inviteUser(inviteRequest);

      expect(result.createdAt).toBeDefined();
      expect(typeof result.createdAt).toBe('string');
    });

    it('should validate email format in invite request', async () => {
      const inviteRequest: UserProfileInviteRequest = {
        name: 'Frank Miller',
        targetUserEmail: 'frank.miller@example.com',
      };

      const mockInvite: UserProfileInvite = {
        id: '123e4567-e89b-12d3-a456-426614174015',
        sourceUserId: '123e4567-e89b-12d3-a456-426614174000',
        targetName: 'Frank Miller',
        targetUserEmail: 'frank.miller@example.com',
        createdAt: '2026-02-01T14:00:00',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockInvite);

      const result = await UserProfileService.inviteUser(inviteRequest);

      expect(result.targetUserEmail).toContain('@');
      expect(result.targetUserEmail).toContain('.');
    });
  });

  describe('Service Integration', () => {
    it('should have both profile methods available', () => {
      expect(UserProfileService.getProfile).toBeDefined();
      expect(UserProfileService.inviteUser).toBeDefined();
    });

    it('should all return promises', () => {
      (apiClient.get as jest.Mock).mockResolvedValue({});
      (apiClient.post as jest.Mock).mockResolvedValue({});

      const profilePromise = UserProfileService.getProfile();
      const invitePromise = UserProfileService.inviteUser({
        name: 'Test',
        targetUserEmail: 'test@example.com',
      });

      expect(profilePromise).toBeInstanceOf(Promise);
      expect(invitePromise).toBeInstanceOf(Promise);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(UserProfileService.getProfile()).rejects.toThrow('Network error');
    });
  });
});
