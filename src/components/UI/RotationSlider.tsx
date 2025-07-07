import React, { useState, useEffect, useRef } from 'react';
import './UI.css';
import { useRotation } from '../../context/RotationContext';
import { GiSpinningBlades } from 'react-icons/gi';

export const RotationSlider: React.FC = () => {
  const { rotationVelocity, setRotationVelocity } = useRotation();
  const [isHovered, setIsHovered] = useState(false);
  
  // Touch pinch-to-zoom state
  const touchesRef = useRef<Touch[]>([]);
  const lastDistanceRef = useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRotationVelocity(parseFloat(e.target.value));
  };
  
  // Handle mousewheel to adjust rotation velocity
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.altKey) { // Only adjust rotation when Alt key is pressed
        e.preventDefault();
        // Use smaller increments for finer control
        const delta = e.deltaY * -0.01;
        const newVelocity = Math.min(5, Math.max(0, rotationVelocity + delta));
        setRotationVelocity(newVelocity);
      }
    };
    
    // Add event listener to the window
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [rotationVelocity, setRotationVelocity]);

  return (
    <div
      className={`rotation-slider-container controls-container ${isHovered ? 'hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="rotation-slider-label">
        <label htmlFor="rotation-slider" style={{ display: 'flex', alignItems: 'center' }}>
          <GiSpinningBlades style={{ marginRight: '5px' }} />
        </label>
        <span>{rotationVelocity === 0 ? "Dynamic" : `×${rotationVelocity.toFixed(1)}`}</span>
      </div>
      <input
        id="rotation-slider"
        type="range"
        min="0"
        max="5"
        step="0.1"
        value={rotationVelocity}
        onChange={handleChange}
        className="rotation-range-input"
      />
    </div>
  );
};
