/**
 * Jest setup file
 * Defines global variables needed for tests
 */

// Define React Native __DEV__ global
global.__DEV__ = false;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));
