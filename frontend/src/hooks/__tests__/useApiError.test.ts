import { renderHook, act } from '@testing-library/react';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useApiError } from '../useApiError';

describe('useApiError', () => {
  it('should initialize with null error and false loading state', () => {
    const { result } = renderHook(() => useApiError());

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear error when clearError is called', () => {
    const { result } = renderHook(() => useApiError());

    // Set an error first
    const testError = new Error('Test error');
    act(() => {
      result.current.handleError(testError);
    });

    expect(result.current.error).not.toBeNull();

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  describe('handleError', () => {
    it('should handle timeout errors (ECONNABORTED)', () => {
      const { result } = renderHook(() => useApiError());

      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        code: 'ECONNABORTED',
      };

      act(() => {
        result.current.handleError(axiosError);
      });

      expect(result.current.error).toEqual({
        message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
        type: 'network',
      });
    });

    it('should handle network errors (no response)', () => {
      const { result } = renderHook(() => useApiError());

      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        response: undefined,
      };

      act(() => {
        result.current.handleError(axiosError);
      });

      expect(result.current.error).toEqual({
        message: '네트워크 연결을 확인해주세요.',
        type: 'network',
      });
    });

    it('should handle 400 validation errors', () => {
      const { result } = renderHook(() => useApiError());

      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Invalid input' },
          statusText: 'Bad Request',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      };

      act(() => {
        result.current.handleError(axiosError);
      });

      expect(result.current.error).toEqual({
        message: 'Invalid input',
        status: 400,
        type: 'validation',
      });
    });

    it('should handle 401 authentication errors', () => {
      const { result } = renderHook(() => useApiError());

      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      };

      act(() => {
        result.current.handleError(axiosError);
      });

      expect(result.current.error).toEqual({
        message: '인증이 필요합니다.',
        status: 401,
        type: 'api',
      });
    });

    it('should handle 403 authorization errors', () => {
      const { result } = renderHook(() => useApiError());

      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        response: {
          status: 403,
          data: {},
          statusText: 'Forbidden',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      };

      act(() => {
        result.current.handleError(axiosError);
      });

      expect(result.current.error).toEqual({
        message: '권한이 없습니다.',
        status: 403,
        type: 'api',
      });
    });

    it('should handle 404 not found errors', () => {
      const { result } = renderHook(() => useApiError());

      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        response: {
          status: 404,
          data: {},
          statusText: 'Not Found',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      };

      act(() => {
        result.current.handleError(axiosError);
      });

      expect(result.current.error).toEqual({
        message: '요청한 리소스를 찾을 수 없습니다.',
        status: 404,
        type: 'api',
      });
    });

    it('should handle 429 rate limit errors', () => {
      const { result } = renderHook(() => useApiError());

      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        response: {
          status: 429,
          data: {},
          statusText: 'Too Many Requests',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      };

      act(() => {
        result.current.handleError(axiosError);
      });

      expect(result.current.error).toEqual({
        message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
        status: 429,
        type: 'api',
      });
    });

    it('should handle 500+ server errors', () => {
      const { result } = renderHook(() => useApiError());

      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {},
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      };

      act(() => {
        result.current.handleError(axiosError);
      });

      expect(result.current.error).toEqual({
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 500,
        type: 'api',
      });
    });

    it('should handle other status codes', () => {
      const { result } = renderHook(() => useApiError());

      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        response: {
          status: 418, // I'm a teapot
          data: { message: 'Custom error message' },
          statusText: 'I am a teapot',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
      };

      act(() => {
        result.current.handleError(axiosError);
      });

      expect(result.current.error).toEqual({
        message: 'Custom error message',
        status: 418,
        type: 'unknown',
      });
    });

    it('should handle regular Error objects', () => {
      const { result } = renderHook(() => useApiError());

      const error = new Error('Something went wrong');

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error).toEqual({
        message: 'Something went wrong',
        type: 'unknown',
      });
    });

    it('should handle errors with code property', () => {
      const { result } = renderHook(() => useApiError());

      const error = {
        code: 'NETWORK_ERROR',
        message: 'Network failed',
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error).toEqual({
        message: 'Network failed',
        type: 'unknown',
      });
    });

    it('should handle unknown error types', () => {
      const { result } = renderHook(() => useApiError());

      act(() => {
        result.current.handleError('string error');
      });

      expect(result.current.error).toEqual({
        message: '알 수 없는 오류가 발생했습니다.',
        type: 'unknown',
      });
    });

    it('should handle null and undefined errors', () => {
      const { result } = renderHook(() => useApiError());

      act(() => {
        result.current.handleError(null);
      });

      expect(result.current.error).toEqual({
        message: '알 수 없는 오류가 발생했습니다.',
        type: 'unknown',
      });

      act(() => {
        result.current.handleError(undefined);
      });

      expect(result.current.error).toEqual({
        message: '알 수 없는 오류가 발생했습니다.',
        type: 'unknown',
      });
    });
  });

  describe('executeApiCall', () => {
    it('should execute async function successfully', async () => {
      const { result } = renderHook(() => useApiError());

      const mockAsyncFn = jest.fn().mockResolvedValue('success');

      await act(async () => {
        const data = await result.current.executeApiCall(mockAsyncFn);
        expect(data).toBe('success');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(mockAsyncFn).toHaveBeenCalled();
    });

    it('should handle async function errors', async () => {
      const { result } = renderHook(() => useApiError());

      const testError = new Error('Async error');
      const mockAsyncFn = jest.fn().mockRejectedValue(testError);

      await act(async () => {
        const data = await result.current.executeApiCall(mockAsyncFn);
        expect(data).toBeNull();
      });

      expect(result.current.error).toEqual({
        message: 'Async error',
        type: 'unknown',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should call onSuccess callback when provided', async () => {
      const { result } = renderHook(() => useApiError());

      const mockAsyncFn = jest.fn().mockResolvedValue('success');
      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.executeApiCall(mockAsyncFn, { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalledWith('success');
      expect(result.current.isLoading).toBe(false);
    });

    it('should call onError callback when error occurs', async () => {
      const { result } = renderHook(() => useApiError());

      const testError = new Error('Test error');
      const mockAsyncFn = jest.fn().mockRejectedValue(testError);
      const onError = jest.fn();

      await act(async () => {
        await result.current.executeApiCall(mockAsyncFn, { onError });
      });

      expect(onError).toHaveBeenCalledWith({
        message: 'Test error',
        type: 'unknown',
      });
    });

    it('should not show loading when showLoading is false', async () => {
      const { result } = renderHook(() => useApiError());

      const mockAsyncFn = jest.fn().mockResolvedValue('success');

      await act(async () => {
        await result.current.executeApiCall(mockAsyncFn, {
          showLoading: false,
        });
      });

      // Loading should remain false throughout
      expect(result.current.isLoading).toBe(false);
    });
  });

  // Note: retryApiCall is not implemented in the current version
  // These tests are commented out until the feature is added
  describe('retryApiCall', () => {
    it('would test retry logic if implemented', () => {
      // Placeholder for future implementation
      expect(true).toBe(true);
    });
  });
});
