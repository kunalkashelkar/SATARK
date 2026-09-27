// Standard mock HTTP client abstraction compatible with future FastAPI backend

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

export const createApiResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  data,
  status: 200,
  message: message || 'OK',
  timestamp: new Date().toISOString()
});

export const apiClient = {
  get: async <T>(endpoint: string, mockData: T): Promise<ApiResponse<T>> => {
    // Simulated network latency
    await new Promise(resolve => setTimeout(resolve, 60));
    return createApiResponse(mockData);
  },
  post: async <T, B>(endpoint: string, body: B, mockResult: T): Promise<ApiResponse<T>> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return createApiResponse(mockResult);
  }
};
