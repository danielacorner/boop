import React, { useState, useEffect } from 'react';
import { useDepth } from '../../context/DepthContext';

export const DepthSlider: React.FC = () => {
  const { depth, setDepth } = useDepth();
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div 
      style={{
        position: 'absolute',
        top: '70px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        padding: '10px 15px',
        width: '200px',
        color: 'white',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        opacity: isHovered ? 0.95 : 0.7,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <label htmlFor="depth-slider">Depth Control</label>
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
          height: '6px',
          borderRadius: '3px',
          appearance: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
};
