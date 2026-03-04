// API 관련 타입 정의

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
  status?: number;
}

export interface ContactApiData {
  name: string;
  email: string;
  phone: string;
  company: string;
  inquiry_type: string;
  message: string;
}

export interface MockEvent {
  preventDefault: () => void;
  target: {
    value?: string;
    name?: string;
    files?: FileList;
  };
}

export type UnknownError = Error | ApiError | unknown;
