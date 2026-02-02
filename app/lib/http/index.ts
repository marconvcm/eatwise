/**
 * HTTP Client instance configuration
 * Configure your API base URL and token management here
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HttpClient } from './client';

// Storage key for auth token
const AUTH_TOKEN_KEY = '@eatwise:auth_token';

// TODO: Update with your actual backend URL
const API_BASE_URL = (typeof __DEV__ !== 'undefined' && __DEV__)
  ? 'http://192.168.1.205:8080' // Development
  : 'https://api.eatwise.com'; // Production

/**
 * Get authentication token from AsyncStorage
 */
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Set authentication token in AsyncStorage
 * @param token - Token to set, or null to remove
 */
export async function setAuthToken(token: string | null): Promise<void> {
  try {
    if (token === null) {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Failed to set auth token:', error);
    throw error;
  }
}

/**
 * Remove authentication token from AsyncStorage
 */
export async function removeAuthToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove auth token:', error);
    throw error;
  }
}

/**
 * Main API client instance
 * Uses Bearer token authentication as configured in Spring WebFlux
 */
export const apiClient = new HttpClient({
  baseURL: API_BASE_URL,
  getToken: getAuthToken,
});

// Export types and error class
export { HttpClientError } from './client';
export type { RequestOptions } from './client';

