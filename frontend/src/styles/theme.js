// Theme configuration for consistent design
export const theme = {
    colors: {
        // Main brand colors - professional and clean
        primary: {
            main: '#1a1a1a',      // Deep black
            light: '#333333',     // Dark gray
            dark: '#000000',      // Pure black
        },
        secondary: {
            main: '#4b5563',      // Gray-600
            light: '#6b7280',     // Gray-500
            dark: '#374151',      // Gray-700
        },
        gray: {
            50: '#fafafa',
            100: '#f4f4f5',
            200: '#e4e4e7',
            300: '#d4d4d8',
            400: '#a1a1aa',
            500: '#71717a',
            600: '#52525b',
            700: '#3f3f46',
            800: '#27272a',
            900: '#18181b',
        },
        accent: {
            coral: '#ff6b6b',     // Warm accent
            mint: '#4ecdc4',      // Cool accent
            amber: '#feca57',     // Highlight
        }
    },
    typography: {
        fontFamily: {
            sans: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mono: '"JetBrains Mono", "Fira Code", monospace',
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem',
            '7xl': '4.5rem',
        }
    },
    spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem',
    },
    animation: {
        duration: {
            fast: '200ms',
            normal: '300ms',
            slow: '500ms',
        },
        easing: {
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
            smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        }
    }
};