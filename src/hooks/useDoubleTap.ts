import { useRef, useCallback } from 'react';

interface DoubleTapOptions {
  onDoubleTap: () => void;
  delay?: number;
}

export function useDoubleTap({ onDoubleTap, delay = 300 }: DoubleTapOptions) {
  const lastTapTime = useRef<number>(0);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;

    if (timeSinceLastTap < delay && timeSinceLastTap > 0) {
      // Double tap detected
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
      }
      onDoubleTap();
      lastTapTime.current = 0;
    } else {
      // First tap
      lastTapTime.current = now;
      
      // Reset after delay
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
      tapTimeout.current = setTimeout(() => {
        lastTapTime.current = 0;
      }, delay);
    }
  }, [onDoubleTap, delay]);

  return handleTap;
}
