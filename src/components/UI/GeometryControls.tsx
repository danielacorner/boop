import React, { useState, useRef, useEffect } from 'react';
import { useGeometry, GeometryType } from '../../context/GeometryContext';

const geometryOptions: { value: GeometryType; label: string; icon: string }[] = [
  { value: 'sphere', label: 'Sphere', icon: '⚪' },
  { value: 'dodecahedron', label: 'Dodecahedron', icon: 'D12' },
  { value: 'icosahedron', label: 'Icosahedron', icon: 'D20' },
  { value: 'box', label: 'Cube', icon: '□' },
  { value: 'tetrahedron', label: 'Tetrahedron', icon: 'D4' },
  { value: 'octahedron', label: 'Octahedron', icon: 'D8' }
];

export const GeometryControls: React.FC = () => {
  const { geometryType, setGeometryType } = useGeometry();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = geometryOptions.find(option => option.value === geometryType);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        fontFamily: 'sans-serif',
        userSelect: 'none',
        fontSize: '14px'
      }}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '140px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            marginRight: '10px', 
            fontSize: '18px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {currentOption?.icon}
          </span>
          <span>{currentOption?.label}</span>
        </div>
        <span style={{ fontSize: '10px' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          width: '140px',
          background: 'rgba(0,0,0,0.8)',
          borderRadius: '6px',
          marginTop: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 60px)'
        }}>
          {geometryOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                setGeometryType(option.value);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'white',
                background: option.value === geometryType ? 'rgba(137, 100, 247, 0.4)' : 'transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.background = 'rgba(137, 100, 247, 0.2)';
                target.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.background = option.value === geometryType ? 'rgba(137, 100, 247, 0.4)' : 'transparent';
                target.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ 
                marginRight: '10px', 
                fontSize: '18px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {option.icon}
              </span>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
