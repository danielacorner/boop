import React from 'react';
import { useGeometry, GeometryType } from '../../context/GeometryContext';
import { BsCircleFill } from 'react-icons/bs';
import { TbBox, TbBoxMultiple, TbDice, TbDice5, TbDice6, TbTriangle } from 'react-icons/tb';

const iconStyle = { size: 20, strokeWidth: 1.5 };

const geometryOptions: { value: GeometryType; icon: React.ReactNode }[] = [
  { value: 'sphere', icon: <BsCircleFill size={iconStyle.size} /> },
  { value: 'dodecahedron', icon: <TbDice5 size={iconStyle.size} strokeWidth={iconStyle.strokeWidth} /> },
  { value: 'icosahedron', icon: <TbDice size={iconStyle.size} strokeWidth={iconStyle.strokeWidth} /> },
  { value: 'box', icon: <TbBox size={iconStyle.size} strokeWidth={iconStyle.strokeWidth} /> },
  { value: 'tetrahedron', icon: <TbTriangle size={iconStyle.size} strokeWidth={iconStyle.strokeWidth} /> },
  { value: 'octahedron', icon: <TbBoxMultiple size={iconStyle.size} strokeWidth={iconStyle.strokeWidth} /> }
];

export const GeometryControls: React.FC = () => {
  const { geometryType, setGeometryType } = useGeometry();

  return (
    <div 
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        gap: '4px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: '6px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.15)'
      }}
    >
      {geometryOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setGeometryType(option.value)}
          title={option.value.charAt(0).toUpperCase() + option.value.slice(1)}
          aria-label={option.value}
          aria-pressed={geometryType === option.value}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'white',
            background: geometryType === option.value 
              ? 'rgba(137, 100, 247, 0.7)' 
              : 'rgba(30, 30, 30, 0.6)',
            transition: 'all 0.15s ease',
            fontSize: '18px',
            padding: 0,
            outline: 'none',
            boxShadow: geometryType === option.value 
              ? '0 0 0 1px rgba(255,255,255,0.6), inset 0 0 12px rgba(137, 100, 247, 0.4)' 
              : 'inset 0 0 0 1px rgba(255,255,255,0.1)'  
          }}
          onMouseEnter={(e) => {
            if (geometryType !== option.value) {
              e.currentTarget.style.background = 'rgba(137, 100, 247, 0.3)';
              e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (geometryType !== option.value) {
              e.currentTarget.style.background = 'rgba(30, 30, 30, 0.6)';
              e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};
