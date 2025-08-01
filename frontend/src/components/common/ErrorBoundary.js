import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">문제가 발생했습니다</h2>
                    <p className="text-gray-500 mb-4">
                        페이지를 불러오는 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
