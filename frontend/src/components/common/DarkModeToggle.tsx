import React, { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';

const DarkModeToggle: React.FC = memo(() => {
  const { theme, toggleTheme } = useUI();
  
  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full p-1 
                 transition-all duration-300 ease-in-out hover:bg-gray-400 dark:hover:bg-gray-500 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                 dark:focus:ring-offset-gray-800"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
    >
      {/* Toggle slider */}
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out flex items-center justify-center
                   ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}
      >
        {theme === 'light' ? (
          <Sun 
            className="w-3 h-3 text-yellow-500 transition-all duration-200" 
            strokeWidth={2.5}
          />
        ) : (
          <Moon 
            className="w-3 h-3 text-blue-500 transition-all duration-200" 
            strokeWidth={2.5}
          />
        )}
      </div>
      
      {/* Background icons */}
      <Sun 
        className={`absolute left-1.5 w-3 h-3 text-yellow-400 transition-opacity duration-200 
                   ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`}
        strokeWidth={2}
      />
      <Moon 
        className={`absolute right-1.5 w-3 h-3 text-blue-400 transition-opacity duration-200 
                   ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}
        strokeWidth={2}
      />
    </button>
  );
});

DarkModeToggle.displayName = 'DarkModeToggle';

export default DarkModeToggle;