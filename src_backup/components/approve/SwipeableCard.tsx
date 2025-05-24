
import { useState, ReactNode } from "react";

interface SwipeableCardProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: ReactNode;
}

export const SwipeableCard = ({ 
  onSwipeLeft, 
  onSwipeRight, 
  children 
}: SwipeableCardProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Swipe threshold (difference in px to trigger a swipe action)
  const swipeThreshold = 100;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    if ('touches' in e) {
      setTouchStart(e.touches[0].clientX);
    } else {
      setTouchStart(e.clientX);
    }
    setTouchEnd(null); // Reset end position
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    let currentPosition: number;
    if ('touches' in e) {
      currentPosition = e.touches[0].clientX;
    } else {
      currentPosition = e.clientX;
    }
    
    setTouchEnd(currentPosition);
    
    // Calculate drag distance for animation
    if (touchStart !== null) {
      const offset = currentPosition - touchStart;
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (!touchStart || !touchEnd) return;
    
    // Calculate swipe distance
    const distance = touchEnd - touchStart;
    const isSwipeRight = distance > swipeThreshold;
    const isSwipeLeft = distance < -swipeThreshold;
    
    if (isSwipeRight) {
      onSwipeRight();
    } else if (isSwipeLeft) {
      onSwipeLeft();
    }
    
    // Reset values
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      className="absolute top-0 left-0 right-0 bottom-0"
      style={{ 
        transform: `translateX(${dragOffset}px) rotate(${dragOffset / 20}deg)`,
        transition: isDragging ? 'none' : 'transform 0.5s ease-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {children}
    </div>
  );
};
