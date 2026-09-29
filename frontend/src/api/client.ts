// Real HTTP API client communicating with FastAPI backend
// Base URL configured via VITE_API_BASE_URL:
// - In production / deployed reverse proxy: '/api/v1' (same origin)
// - In local Vite dev server without proxy: 'http://localhost:8001/api/v1'
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL !== undefined 
    ? import.meta.env.VITE_API_BASE_URL 
    : (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8001/api/v1');

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

export const createApiResponse = <T>(data: T, message?: string, status = 200): ApiResponse<T> => ({
  data,
  status,
  message: message || 'OK',
  timestamp: new Date().toISOString()
});

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getAuthToken = (): string | null => {
  return sessionStorage.getItem('sat_token');
};

const getHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return { ...headers, ...customHeaders };
};

export const apiClient = {
  get: async <T>(endpoint: string, _fallback?: T): Promise<ApiResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!res.ok) {
      let errDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errJson.message || errDetail;
      } catch {
        // ignore
      }
      throw new ApiError(errDetail, res.status);
    }

    const json = await res.json();
    return createApiResponse<T>(json, 'OK', res.status);
  },

  post: async <T, B = any>(endpoint: string, body?: B, _fallback?: T): Promise<ApiResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let errDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errJson.message || errDetail;
      } catch {
        // ignore
      }
      throw new ApiError(errDetail, res.status);
    }

    const json = await res.json();
    return createApiResponse<T>(json, 'OK', res.status);
  },

  patch: async <T, B = any>(endpoint: string, body?: B): Promise<ApiResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let errDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errJson.message || errDetail;
      } catch {
        // ignore
      }
      throw new ApiError(errDetail, res.status);
    }

    const json = await res.json();
    return createApiResponse<T>(json, 'OK', res.status);
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!res.ok) {
      let errDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errJson.message || errDetail;
      } catch {
        // ignore
      }
      throw new ApiError(errDetail, res.status);
    }

    const json = await res.json();
    return createApiResponse<T>(json, 'OK', res.status);
  },

  postFormData: async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      let errDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errJson.message || errDetail;
      } catch {
        // ignore
      }
      throw new ApiError(errDetail, res.status);
    }

    const json = await res.json();
    return createApiResponse<T>(json, 'OK', res.status);
  }
};
