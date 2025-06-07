export interface ApiError {
  message: string;
  status: number;
  statusText: string;
  url?: string;
  timestamp: string;
  error?: unknown;
  errors?: { [key: string]: string[] };
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface RequestOptions {
  headers?: { [key: string]: string };
  params?: { [key: string]: unknown };
  timeout?: number;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  success: boolean;
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
