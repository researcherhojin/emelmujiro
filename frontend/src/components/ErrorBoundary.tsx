import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    logger.error('ErrorBoundary caught an error:', error);

    // 상태 업데이트
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Sentry로 에러 전송 (Sentry가 설정된 경우)
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          component: 'ErrorBoundary',
          errorCount: this.state.errorCount + 1,
        },
      });
    }

    // 프로덕션 환경에서 에러 리포팅
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true'
    ) {
      this.reportError(error, errorInfo);
    }
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // 에러 리포팅 API 호출
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorCount: this.state.errorCount + 1,
      };

      // API가 있다면 전송
      if (process.env.REACT_APP_API_URL) {
        await fetch(`${process.env.REACT_APP_API_URL}/errors/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport),
        });
      }
    } catch (reportError) {
      logger.error('Failed to report error:', reportError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* 에러 아이콘 */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </div>

            {/* 에러 메시지 */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              앗! 문제가 발생했습니다
            </h1>

            <p className="text-gray-600 text-center mb-8">
              예상치 못한 오류가 발생했습니다. 불편을 드려 죄송합니다.
              {this.state.errorCount > 2 && (
                <span className="block mt-2 text-sm text-orange-600">
                  오류가 반복적으로 발생하고 있습니다. 지원팀에 문의해 주세요.
                </span>
              )}
            </p>

            {/* 개발 환경에서만 에러 상세 표시 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 p-4 bg-gray-100 rounded-lg">
                <h2 className="font-semibold text-gray-700 mb-2">에러 상세:</h2>
                <pre className="text-xs text-red-600 overflow-auto">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                다시 시도
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5" />
                홈으로
              </button>

              <a
                href={`mailto:${process.env.REACT_APP_SUPPORT_EMAIL || 'support@emelmujiro.com'}?subject=오류 리포트&body=오류가 발생했습니다. 다음 정보를 첨부해 주세요:%0A%0A오류 시간: ${new Date().toISOString()}%0A페이지: ${window.location.href}`}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-5 h-5" />
                지원팀 문의
              </a>
            </div>

            {/* 추가 정보 */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                오류 ID: {Date.now().toString(36).toUpperCase()}
                <br />
                시간: {new Date().toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
