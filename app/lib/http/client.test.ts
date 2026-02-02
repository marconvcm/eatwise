/**
 * Tests for HTTP Client
 */

import { HttpClient, HttpClientError } from './client';

// Mock global fetch
global.fetch = jest.fn();

describe('HttpClient', () => {
  let client: HttpClient;
  const mockBaseURL = 'https://api.test.com';

  beforeEach(() => {
    client = new HttpClient({ baseURL: mockBaseURL });
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should remove trailing slash from baseURL', () => {
      const clientWithSlash = new HttpClient({ baseURL: 'https://api.test.com/' });
      expect((clientWithSlash as any).baseURL).toBe('https://api.test.com');
    });

    it('should initialize without token provider', () => {
      expect(client).toBeDefined();
    });

    it('should initialize with token provider', () => {
      const getToken = async () => 'test-token';
      const clientWithToken = new HttpClient({ baseURL: mockBaseURL, getToken });
      expect(clientWithToken).toBeDefined();
    });
  });

  describe('GET requests', () => {
    it('should make a successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await client.get<typeof mockData>('/users/1');

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users/1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should include query parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
        headers: new Headers(),
      });

      await client.get('/users', { params: { page: 1, limit: 10, active: true } });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/users?page=1&limit=10&active=true',
        expect.any(Object)
      );
    });

    it('should include custom headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers(),
      });

      await client.get('/users', { headers: { 'X-Custom-Header': 'value' } });

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value',
        },
      });
    });

    it('should include Bearer token when available', async () => {
      const getToken = async () => 'test-token-123';
      const clientWithToken = new HttpClient({ baseURL: mockBaseURL, getToken });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers(),
      });

      await clientWithToken.get('/protected');

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/protected', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-123',
        },
      });
    });

    it('should handle 204 No Content', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      const result = await client.get('/no-content');
      expect(result).toBeUndefined();
    });
  });

  describe('POST requests', () => {
    it('should make a successful POST request', async () => {
      const requestData = { name: 'New User', email: 'test@example.com' };
      const responseData = { id: 1, ...requestData };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => responseData,
        headers: new Headers(),
      });

      const result = await client.post('/users', requestData);

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      expect(result).toEqual(responseData);
    });

    it('should handle POST without body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers(),
      });

      await client.post('/action');

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
    });
  });

  describe('PUT requests', () => {
    it('should make a successful PUT request', async () => {
      const updateData = { name: 'Updated User' };
      const responseData = { id: 1, ...updateData };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
        headers: new Headers(),
      });

      const result = await client.put('/users/1', updateData);

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(responseData);
    });
  });

  describe('DELETE requests', () => {
    it('should make a successful DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      await client.delete('/users/1');

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle DELETE with query parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      await client.delete('/users', { params: { force: true } });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/users?force=true',
        expect.any(Object)
      );
    });
  });

  describe('Error handling', () => {
    it('should throw HttpClientError on 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' }),
        headers: new Headers(),
      });

      try {
        await client.get('/users/999');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpClientError);
        expect((error as HttpClientError).status).toBe(404);
        expect((error as HttpClientError).message).toBe('User not found');
      }
    });

    it('should throw HttpClientError on 401 Unauthorized', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid token' }),
        headers: new Headers(),
      });

      try {
        await client.get('/protected');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpClientError);
        expect((error as HttpClientError).status).toBe(401);
        expect((error as HttpClientError).message).toBe('Invalid token');
      }
    });

    it('should handle error response without JSON body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
        headers: new Headers(),
      });

      try {
        await client.get('/error');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpClientError);
        expect((error as HttpClientError).status).toBe(500);
        expect((error as HttpClientError).message).toBe('HTTP Error: 500 Internal Server Error');
      }
    });

    it('should handle 400 Bad Request with validation errors', async () => {
      const errorResponse = {
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Invalid email format' },
          { field: 'name', message: 'Name is required' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => errorResponse,
        headers: new Headers(),
      });

      try {
        await client.post('/users', { email: 'invalid' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpClientError);
        expect((error as HttpClientError).status).toBe(400);
        expect((error as HttpClientError).response).toEqual(errorResponse);
      }
    });
  });

  describe('setBaseURL', () => {
    it('should update the base URL', () => {
      client.setBaseURL('https://new-api.test.com');
      expect((client as any).baseURL).toBe('https://new-api.test.com');
    });

    it('should remove trailing slash when updating', () => {
      client.setBaseURL('https://new-api.test.com/');
      expect((client as any).baseURL).toBe('https://new-api.test.com');
    });
  });

  describe('Token management', () => {
    it('should not add Authorization header when token is null', async () => {
      const getToken = async () => null;
      const clientWithToken = new HttpClient({ baseURL: mockBaseURL, getToken });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers(),
      });

      await clientWithToken.get('/users');

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should call getToken function on each request', async () => {
      const getToken = jest.fn().mockResolvedValue('dynamic-token');
      const clientWithToken = new HttpClient({ baseURL: mockBaseURL, getToken });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers(),
      });

      await clientWithToken.get('/users');
      await clientWithToken.post('/users', {});

      expect(getToken).toHaveBeenCalledTimes(2);
    });
  });

  describe('URL encoding', () => {
    it('should properly encode query parameters with special characters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
        headers: new Headers(),
      });

      await client.get('/search', {
        params: { q: 'hello world', filter: 'name=John&age>30' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/search?q=hello%20world&filter=name%3DJohn%26age%3E30',
        expect.any(Object)
      );
    });
  });
});
