import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LazyImage from '../LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver as any;

describe('LazyImage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with placeholder initially', () => {
        render(
            <LazyImage 
                src="test.jpg" 
                alt="Test image"
                className="image-class"
                placeholderClassName="placeholder-class"
            />
        );
        
        const img = screen.getByAltText('Test image');
        expect(img).toBeInTheDocument();
        expect(img).not.toHaveAttribute('src');
    });

    it('sets up IntersectionObserver on mount', () => {
        render(<LazyImage src="test.jpg" alt="Test image" />);
        
        expect(mockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );
    });

    it('uses custom threshold and rootMargin', () => {
        render(
            <LazyImage 
                src="test.jpg" 
                alt="Test image" 
                threshold={0.5}
                rootMargin="100px"
            />
        );
        
        expect(mockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            {
                threshold: 0.5,
                rootMargin: '100px'
            }
        );
    });

    describe('Image Loading', () => {
        it('loads image when intersection occurs', () => {
            let observerCallback: any;
            mockIntersectionObserver.mockImplementation((callback) => {
                observerCallback = callback;
                return {
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    disconnect: jest.fn(),
                };
            });

            render(<LazyImage src="test.jpg" alt="Test image" />);
            const img = screen.getByAltText('Test image');

            // Simulate intersection
            observerCallback([{ isIntersecting: true, target: img }]);

            expect(img).toHaveAttribute('src', 'test.jpg');
        });

        it('calls onLoad callback when image loads', () => {
            const handleLoad = jest.fn();
            let observerCallback: any;
            mockIntersectionObserver.mockImplementation((callback) => {
                observerCallback = callback;
                return {
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    disconnect: jest.fn(),
                };
            });

            render(
                <LazyImage 
                    src="test.jpg" 
                    alt="Test image" 
                    onLoad={handleLoad}
                />
            );
            
            const img = screen.getByAltText('Test image');
            observerCallback([{ isIntersecting: true, target: img }]);

            fireEvent.load(img);
            expect(handleLoad).toHaveBeenCalledTimes(1);
        });

        it('handles image load error', () => {
            const handleError = jest.fn();
            let observerCallback: any;
            mockIntersectionObserver.mockImplementation((callback) => {
                observerCallback = callback;
                return {
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    disconnect: jest.fn(),
                };
            });

            render(
                <LazyImage 
                    src="test.jpg" 
                    alt="Test image" 
                    onError={handleError}
                />
            );
            
            const img = screen.getByAltText('Test image');
            observerCallback([{ isIntersecting: true, target: img }]);

            fireEvent.error(img);
            expect(handleError).toHaveBeenCalledTimes(1);
        });
    });

    describe('Styling', () => {
        it('applies transition classes after load', async () => {
            let observerCallback: any;
            mockIntersectionObserver.mockImplementation((callback) => {
                observerCallback = callback;
                return {
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    disconnect: jest.fn(),
                };
            });

            render(
                <LazyImage 
                    src="test.jpg" 
                    alt="Test image"
                    className="custom-class"
                />
            );
            
            const img = screen.getByAltText('Test image');
            observerCallback([{ isIntersecting: true, target: img }]);
            
            fireEvent.load(img);
            
            await waitFor(() => {
                expect(img).toHaveClass('opacity-100');
                expect(img).toHaveClass('custom-class');
            });
        });

        it('shows placeholder styles before loading', () => {
            render(
                <LazyImage 
                    src="test.jpg" 
                    alt="Test image"
                    placeholderClassName="placeholder-bg"
                />
            );
            
            const img = screen.getByAltText('Test image');
            expect(img).toHaveClass('placeholder-bg');
        });

        it('shows error styles on load failure', async () => {
            let observerCallback: any;
            mockIntersectionObserver.mockImplementation((callback) => {
                observerCallback = callback;
                return {
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    disconnect: jest.fn(),
                };
            });

            render(<LazyImage src="test.jpg" alt="Test image" />);
            
            const img = screen.getByAltText('Test image');
            observerCallback([{ isIntersecting: true, target: img }]);
            
            fireEvent.error(img);
            
            await waitFor(() => {
                expect(img).toHaveClass('opacity-50');
            });
        });
    });

    describe('Cleanup', () => {
        it('unobserves element on unmount', () => {
            const mockUnobserve = jest.fn();
            mockIntersectionObserver.mockReturnValue({
                observe: jest.fn(),
                unobserve: mockUnobserve,
                disconnect: jest.fn(),
            });

            const { unmount } = render(<LazyImage src="test.jpg" alt="Test image" />);
            
            unmount();
            
            expect(mockUnobserve).toHaveBeenCalled();
        });
    });

    describe('Additional Props', () => {
        it('passes through additional img props', () => {
            render(
                <LazyImage 
                    src="test.jpg" 
                    alt="Test image"
                    width="200"
                    height="100"
                    data-testid="lazy-img"
                />
            );
            
            const img = screen.getByAltText('Test image');
            expect(img).toHaveAttribute('width', '200');
            expect(img).toHaveAttribute('height', '100');
            expect(img).toHaveAttribute('data-testid', 'lazy-img');
        });
    });
});