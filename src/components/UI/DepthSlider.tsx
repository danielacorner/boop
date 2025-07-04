import React, { useState, useEffect, useRef } from 'react';
import { useDepth } from '../../context/DepthContext';
import { LuAxis3D } from 'react-icons/lu';

export const DepthSlider: React.FC = () => {
  const { depth, setDepth } = useDepth();
  const [isHovered, setIsHovered] = useState(false);
  
  // Touch pinch-to-zoom state
  const touchesRef = useRef<Touch[]>([]);
  const lastDistanceRef = useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepth(parseFloat(e.target.value));
  };
  
  // Handle mousewheel to adjust depth
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Use smaller increments for finer control
      const delta = e.deltaY * -0.01;
      const newDepth = Math.min(10, Math.max(-10, depth + delta));
      setDepth(newDepth);
    };
    
    // Add event listener to the window
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [depth, setDepth]);
  
  // Handle pinch-to-zoom on touch devices
  useEffect(() => {
    // Calculate distance between two touch points
    const getDistance = (touches: Touch[]): number => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        // Store initial touches
        touchesRef.current = Array.from(e.touches);
        lastDistanceRef.current = getDistance(touchesRef.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2 && lastDistanceRef.current !== null) {
        e.preventDefault(); // Prevent page zoom/scroll
        
        // Calculate new distance
        const newDistance = getDistance(Array.from(e.touches));
        const delta = (newDistance - lastDistanceRef.current) * 0.01;
        
        // Update depth based on pinch movement
        const newDepth = Math.min(10, Math.max(-10, depth + delta));
        setDepth(newDepth);
        
        // Update last distance
        lastDistanceRef.current = newDistance;
      }
    };

    const handleTouchEnd = () => {
      // Reset touch tracking
      touchesRef.current = [];
      lastDistanceRef.current = null;
    };

    // Add touch event listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      // Clean up event listeners
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [depth, setDepth]);

  return (
    <div
      style={{
        width: '100%',
        color: 'white',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        opacity: isHovered ? 0.95 : 0.7,
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
        
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
        <label htmlFor="depth-slider" style={{ display: 'flex', alignItems: 'center' }}>
          <LuAxis3D style={{ marginRight: '5px' }} />
        </label>
        <span>{depth.toFixed(1)}</span>
      </div>
      <input
        id="depth-slider"
        type="range"
        min="-10"
        max="10"
        step="0.1"
        value={depth}
        onChange={handleChange}
        style={{
          width: '100%',
          background: 'linear-gradient(to right, #3a6df0, #a855f7)',
          height: '4px', // Smaller height
          borderRadius: '2px',
          appearance: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
};
