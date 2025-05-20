
import { useEffect, useRef } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 100,
}: UseSwipeOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isSwiping.current = true;
      
      // Add a class during swiping to track state
      el.classList.add("is-swiping");
      
      // Apply transform during swiping
      el.style.transition = "transform 0.1s ease-out";
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return;
      
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const diffX = x - startX.current;
      const diffY = y - startY.current;
      
      // Apply transform based on X movement for visual feedback
      el.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.05}deg)`;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping.current) return;
      
      const x = e.changedTouches[0].clientX;
      const y = e.changedTouches[0].clientY;
      const diffX = x - startX.current;
      const diffY = y - startY.current;
      
      // Reset transform
      el.style.transform = "";
      el.style.transition = "";
      el.classList.remove("is-swiping");
      
      isSwiping.current = false;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > threshold && onSwipeRight) {
          onSwipeRight();
        } else if (diffX < -threshold && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        if (diffY > threshold && onSwipeDown) {
          onSwipeDown();
        } else if (diffY < -threshold && onSwipeUp) {
          onSwipeUp();
        }
      }
    };

    el.addEventListener("touchstart", handleTouchStart);
    el.addEventListener("touchmove", handleTouchMove);
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return ref;
}
