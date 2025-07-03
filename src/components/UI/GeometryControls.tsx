import React, { useState, useEffect } from 'react';
import { useGeometry } from '../../context/GeometryContext';
import { Tooltip } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { Sphere, Box, Tetrahedron, Octahedron, Icosahedron, Dodecahedron, TetrahedronStar } from './ShapePreview';

// Array of geometry options
const geometryOptions = [
  { value: "sphere", label: "Sphere" },
  { value: "tetrahedron", label: "Tetrahedron" },
  { value: "box", label: "Box" },
  { value: "octahedron", label: "Octahedron" },
  { value: "dodecahedron", label: "Dodecahedron" },
  { value: "icosahedron", label: "Icosahedron" },
  { value: "tetrahedron_star", label: "Tetrahedron Star" },
];

// Track if component is mounted for initial render
let isMounted = false;

export const GeometryControls: React.FC = () => {
  const { geometryType, setGeometryType } = useGeometry();
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    isMounted = true;
    setIsRendered(true);
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      {isRendered && (
        <>
          <div style={{ 
            marginBottom: '10px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            <span>{geometryOptions.find(opt => opt.value === geometryType)?.label}</span>
          </div>

          {/* Shape selection buttons in single row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)', // Changed to 7 columns for all shapes in one row
            gridGap: '8px',
            width: '100%',
            padding: '5px 0'
          }}>
            {/* All shapes in a single row */}
            <Tooltip title="Sphere" placement="bottom">
              <button
                onClick={() => setGeometryType('sphere')}
                aria-label="Sphere"
                aria-pressed={geometryType === 'sphere'}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  backgroundColor: geometryType === 'sphere' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'sphere' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  minHeight: '45px', // Smaller button height
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                  {/* eslint-disable react/no-unknown-property */}
                  <Canvas frameloop={geometryType === 'sphere' ? "always" : "demand"} camera={{ position: [0, 0, 2.5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.7} />
                    <pointLight position={[-10, -10, -5]} intensity={0.7} />
                    <pointLight position={[0, 0, 5]} intensity={0.7} color="#6666ff" />
                  {/* eslint-enable react/no-unknown-property */}
                    <Sphere />
                  </Canvas>
                </div>
              </button>
            </Tooltip>
            <Tooltip title="Tetrahedron" placement="bottom">
              <button
                onClick={() => setGeometryType('tetrahedron')}
                aria-label="Tetrahedron"
                aria-pressed={geometryType === 'tetrahedron'}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  backgroundColor: geometryType === 'tetrahedron' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'tetrahedron' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  minHeight: '45px', // Smaller button height
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                  {/* eslint-disable react/no-unknown-property */}
                  <Canvas frameloop={geometryType === 'tetrahedron' ? "always" : "demand"} camera={{ position: [0, 0, 2.5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.7} />
                    <pointLight position={[-10, -10, -5]} intensity={0.7} />
                    <pointLight position={[0, 0, 5]} intensity={0.7} color="#6666ff" />
                  {/* eslint-enable react/no-unknown-property */}
                    <Tetrahedron />
                  </Canvas>
                </div>
              </button>
            </Tooltip>
            <Tooltip title="Box" placement="bottom">
              <button
                onClick={() => setGeometryType('box')}
                aria-label="Box"
                aria-pressed={geometryType === 'box'}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  backgroundColor: geometryType === 'box' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'box' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  minHeight: '45px', // Smaller button height
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                  {/* eslint-disable react/no-unknown-property */}
                  <Canvas frameloop={geometryType === 'box' ? "always" : "demand"} camera={{ position: [0, 0, 2.5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.7} />
                    <pointLight position={[-10, -10, -5]} intensity={0.7} />
                    <pointLight position={[0, 0, 5]} intensity={0.7} color="#6666ff" />
                  {/* eslint-enable react/no-unknown-property */}
                    <Box />
                  </Canvas>
                </div>
              </button>
            </Tooltip>

            {/* Second row: Octahedron, Dodecahedron, Icosahedron */}
            <Tooltip title="Octahedron" placement="bottom">
              <button
                onClick={() => setGeometryType('octahedron')}
                aria-label="Octahedron"
                aria-pressed={geometryType === 'octahedron'}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  backgroundColor: geometryType === 'octahedron' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'octahedron' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  minHeight: '45px', // Smaller button height
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                  {/* eslint-disable react/no-unknown-property */}
                  <Canvas frameloop={geometryType === 'octahedron' ? "always" : "demand"} camera={{ position: [0, 0, 2.5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.7} />
                    <pointLight position={[-10, -10, -5]} intensity={0.7} />
                    <pointLight position={[0, 0, 5]} intensity={0.7} color="#6666ff" />
                  {/* eslint-enable react/no-unknown-property */}
                    <Octahedron />
                  </Canvas>
                </div>
              </button>
            </Tooltip>
            <Tooltip title="Dodecahedron" placement="bottom">
              <button
                onClick={() => setGeometryType('dodecahedron')}
                aria-label="Dodecahedron"
                aria-pressed={geometryType === 'dodecahedron'}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  backgroundColor: geometryType === 'dodecahedron' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'dodecahedron' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  minHeight: '45px', // Smaller button height
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                  {/* eslint-disable react/no-unknown-property */}
                  <Canvas frameloop={geometryType === 'dodecahedron' ? "always" : "demand"} camera={{ position: [0, 0, 2.5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.7} />
                    <pointLight position={[-10, -10, -5]} intensity={0.7} />
                    <pointLight position={[0, 0, 5]} intensity={0.7} color="#6666ff" />
                  {/* eslint-enable react/no-unknown-property */}
                    <Dodecahedron />
                  </Canvas>
                </div>
              </button>
            </Tooltip>
            <Tooltip title="Icosahedron" placement="bottom">
              <button
                onClick={() => setGeometryType('icosahedron')}
                aria-label="Icosahedron"
                aria-pressed={geometryType === 'icosahedron'}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  backgroundColor: geometryType === 'icosahedron' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'icosahedron' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  minHeight: '45px', // Smaller button height
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                  {/* eslint-disable react/no-unknown-property */}
                  <Canvas frameloop={geometryType === 'icosahedron' ? "always" : "demand"} camera={{ position: [0, 0, 2.5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.7} />
                    <pointLight position={[-10, -10, -5]} intensity={0.7} />
                    <pointLight position={[0, 0, 5]} intensity={0.7} color="#6666ff" />
                  {/* eslint-enable react/no-unknown-property */}
                    <Icosahedron />
                  </Canvas>
                </div>
              </button>
            </Tooltip>

            {/* Last shape in the row: Star Tetrahedron */}
            <Tooltip title="Tetrahedron Star" placement="bottom">
                <button
                  onClick={() => setGeometryType('tetrahedron_star')}
                  aria-label="Tetrahedron Star"
                  aria-pressed={geometryType === 'tetrahedron_star'}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '4px',
                    backgroundColor: geometryType === 'tetrahedron_star' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                    border: geometryType === 'tetrahedron_star' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    padding: 0,
                    minHeight: '45px', // Smaller button height
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                    {/* eslint-disable react/no-unknown-property */}
                    <Canvas frameloop={geometryType === 'tetrahedron_star' ? "always" : "demand"} camera={{ position: [0, 0, 2.8] }}>
                      <ambientLight intensity={0.5} />
                      <pointLight position={[10, 10, 10]} intensity={0.7} />
                      <pointLight position={[-10, -10, -5]} intensity={0.7} />
                      <pointLight position={[0, 0, 5]} intensity={0.7} color="#6666ff" />
                    {/* eslint-enable react/no-unknown-property */}
                      <TetrahedronStar />
                    </Canvas>
                  </div>
                </button>
              </Tooltip>
          </div>
        </>
      )}
    </>
  );
};
