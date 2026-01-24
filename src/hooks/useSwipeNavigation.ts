import { useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Define the order of pages for swipe navigation
const PAGE_ORDER = ['/', '/daily', '/saved', '/about'];

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function useSwipeNavigation(): SwipeHandlers {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Only trigger horizontal swipe if horizontal movement is greater than vertical
    // and meets minimum threshold
    const minSwipeDistance = 80;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      const currentIndex = PAGE_ORDER.indexOf(location.pathname);
      
      if (currentIndex === -1) return;
      
      if (deltaX > 0) {
        // Swiped right - go to previous page
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
          navigate(PAGE_ORDER[prevIndex]);
        }
      } else {
        // Swiped left - go to next page
        const nextIndex = currentIndex + 1;
        if (nextIndex < PAGE_ORDER.length) {
          navigate(PAGE_ORDER[nextIndex]);
        }
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  }, [navigate, location.pathname]);

  return { onTouchStart, onTouchEnd };
}
