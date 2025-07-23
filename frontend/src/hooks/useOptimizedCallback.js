import { useCallback, useMemo } from 'react';

// Custom hook for optimized callbacks with dependencies
export const useOptimizedCallback = (callback, dependencies) => {
    return useCallback(callback, dependencies);
};

// Custom hook for expensive computations
export const useExpensiveComputation = (computeFunc, dependencies) => {
    return useMemo(computeFunc, dependencies);
};

// Example usage in components:
/*
const MyComponent = ({ items, filter }) => {
    // Memoize expensive filtering operation
    const filteredItems = useExpensiveComputation(
        () => items.filter(item => item.name.includes(filter)),
        [items, filter]
    );

    // Memoize callback to prevent unnecessary re-renders
    const handleClick = useOptimizedCallback(
        (id) => {
            console.log('Clicked item:', id);
        },
        []
    );

    return (
        <div>
            {filteredItems.map(item => (
                <div key={item.id} onClick={() => handleClick(item.id)}>
                    {item.name}
                </div>
            ))}
        </div>
    );
};
*/