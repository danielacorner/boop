import React, { useState, useEffect } from 'react';
import './UI.css';
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
          {/* Title hidden as requested */}

          {/* Shape selection buttons in single row */}
          <div className="controls-container">
            <div className="shape-grid">
            {/* All shapes in a single row */}
            <Tooltip title="Sphere" placement="bottom">
              <button
                onClick={() => setGeometryType('sphere')}
                aria-label="Sphere"
                aria-pressed={geometryType === 'sphere'}
className="shape-button"
                style={{
                  backgroundColor: geometryType === 'sphere' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'sphere' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="shape-preview-container">
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
className="shape-button"
                style={{
                  backgroundColor: geometryType === 'tetrahedron' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'tetrahedron' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="shape-preview-container">
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
className="shape-button"
                style={{
                  backgroundColor: geometryType === 'box' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'box' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="shape-preview-container">
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
className="shape-button"
                style={{
                  backgroundColor: geometryType === 'octahedron' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'octahedron' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="shape-preview-container">
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
className="shape-button"
                style={{
                  backgroundColor: geometryType === 'dodecahedron' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'dodecahedron' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="shape-preview-container">
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
className="shape-button"
                style={{
                  backgroundColor: geometryType === 'icosahedron' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                  border: geometryType === 'icosahedron' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="shape-preview-container">
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
                  className="shape-button"
                  style={{
                    backgroundColor: geometryType === 'tetrahedron_star' ? 'rgba(100, 100, 255, 0.3)' : 'transparent',
                    border: geometryType === 'tetrahedron_star' ? '2px solid rgba(120, 120, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="shape-preview-container">
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
          </div>
        </>
      )}
    </>
  );
};
