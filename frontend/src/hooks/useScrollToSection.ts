import { useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook for scrolling to a section by ID, with cross-page navigation support.
 * Navigates to "/" first if not already there, then scrolls after a short delay.
 */
export const useScrollToSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (location.pathname !== '/') {
        navigate('/');
        scrollTimerRef.current = setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    [navigate, location.pathname]
  );

  return scrollToSection;
};
