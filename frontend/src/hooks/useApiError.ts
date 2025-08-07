import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  status?: number;
  type: 'network' | 'api' | 'validation' | 'unknown';
}

// Type guard for AxiosError
const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
};

// Type guard for error with code property
const hasErrorCode = (error: unknown): error is { code: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
};

// Type guard for error with message property
const hasErrorMessage = (error: unknown): error is { message: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
};

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((err: unknown) => {
    let apiError: ApiError;

    // Check if it's an Axios error
    if (isAxiosError(err)) {
      if (err.code === 'ECONNABORTED') {
        apiError = {
          message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
          type: 'network',
        };
      } else if (!err.response) {
        apiError = {
          message: '네트워크 연결을 확인해주세요.',
          type: 'network',
        };
      } else {
        const status = err.response.status;
        const data = err.response.data as { message?: string };

        if (status === 400) {
          apiError = {
            message: data?.message || '입력값을 확인해주세요.',
            status,
            type: 'validation',
          };
        } else if (status === 401) {
          apiError = {
            message: '인증이 필요합니다.',
            status,
            type: 'api',
          };
        } else if (status === 403) {
          apiError = {
            message: '권한이 없습니다.',
            status,
            type: 'api',
          };
        } else if (status === 404) {
          apiError = {
            message: '요청한 리소스를 찾을 수 없습니다.',
            status,
            type: 'api',
          };
        } else if (status === 429) {
          apiError = {
            message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
            status,
            type: 'api',
          };
        } else if (status >= 500) {
          apiError = {
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            status,
            type: 'api',
          };
        } else {
          apiError = {
            message: data?.message || '알 수 없는 오류가 발생했습니다.',
            status,
            type: 'unknown',
          };
        }
      }
    } else if (hasErrorCode(err) && err.code === 'ECONNABORTED') {
      // Handle non-Axios timeout errors
      apiError = {
        message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
        type: 'network',
      };
    } else if (hasErrorMessage(err)) {
      // Handle errors with message property
      apiError = {
        message: err.message,
        type: 'unknown',
      };
    } else if (err instanceof Error) {
      // Handle standard Error objects
      apiError = {
        message: err.message,
        type: 'unknown',
      };
    } else {
      // Handle unknown errors
      apiError = {
        message: '알 수 없는 오류가 발생했습니다.',
        type: 'unknown',
      };
    }

    setError(apiError);
    return apiError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: ApiError) => void;
        showLoading?: boolean;
      }
    ): Promise<T | null> => {
      const { onSuccess, onError, showLoading = true } = options || {};

      if (showLoading) setIsLoading(true);
      clearError();

      try {
        const result = await apiCall();
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        const apiError = handleError(err);
        if (onError) onError(apiError);
        return null;
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    isLoading,
    clearError,
    handleError,
    executeApiCall,
  };
};
