/**
 * User Profile API Service
 * Maps to UserProfileController endpoints in Spring WebFlux backend
 */

import { apiClient } from '../http';
import type { UserProfile } from './types/UserProfile';
import type { UserProfileInvite } from './types/UserProfileInvite';
import type { UserProfileInviteRequest } from './types/UserProfileInviteRequest';

export const UserProfileService = {
  /**
   * Get current user profile
   * GET /profile/me
   * @returns Current user profile
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/profile/me');
  },

  /**
   * Send user invitation
   * POST /profile/invite
   * @param inviteRequest - User invitation request data
   * @returns Created user invitation
   */
  async inviteUser(inviteRequest: UserProfileInviteRequest): Promise<UserProfileInvite> {
    return apiClient.post<UserProfileInvite, UserProfileInviteRequest>('/profile/invite', inviteRequest);
  },
};
