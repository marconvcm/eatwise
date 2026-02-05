/**
 * HTTP Client for Spring WebFlux backend
 * Handles Bearer token authentication and standard REST operations
 */

interface HttpClientConfig {
  baseURL: string;
  getToken?: () => Promise<string | null>;
}

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

class HttpClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
    public details?: Record<string, any> | undefined
  ) {
    super(message);
    this.name = 'HttpClientError';
  }

  public detailsToString(): string {
    if (!this.details) {
      return '';
    }
    return Object.entries(this.details)
      .map(([_, value]) => `${value}`)
      .join(', ');
  }

  public firstDetailsKey(): string | null {
    if (!this.details) {
      return null;
    }
    const keys = Object.keys(this.details);
    return keys.length > 0 ? keys[0] : null;
  }
}

class HttpClient {
  private baseURL: string;
  private getToken?: () => Promise<string | null>;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.getToken = config.getToken;
  }

  private async getHeaders(customHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Add Bearer token if available
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private buildURL(path: string, params?: Record<string, string | number | boolean>): string {
    const url = `${this.baseURL}${path}`;
    
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    return `${url}?${queryString}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      let errorBody;
      let details;

      try {
        errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
        details = errorBody.details as Record<string, any> | undefined;
      } catch {
        // If response is not JSON, use status text
      }

      throw new HttpClientError(errorMessage, response.status, errorBody, details);
    }

    // Handle empty responses (204 No Content, etc.)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    try {
      return await response.json();
    } catch {
      return undefined as T;
    }
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(path, options?.params);
    const headers = await this.getHeaders(options?.headers);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T, D = any>(path: string, data?: D, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(path, options?.params);
    const headers = await this.getHeaders(options?.headers);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T, D = any>(path: string, data?: D, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(path, options?.params);
    const headers = await this.getHeaders(options?.headers);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(path, options?.params);
    const headers = await this.getHeaders(options?.headers);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Set or update base URL
   */
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '');
  }
}

export { HttpClient, HttpClientError };
export type { HttpClientConfig, RequestOptions };

