/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// A component that slowly rotates its children
const AutoRotate = ({ children, speed = 0.3, ...props }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += speed * 0.01;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} {...props}>
      {children}
    </group>
  );
};

// Individual shape components
// @ts-ignore - Three.js props
export const Sphere = () => (
  <mesh>
    <sphereGeometry args={[1, 32, 16]} />
    <meshStandardMaterial color="#ffffff" wireframe={true} emissive="#6666ff" emissiveIntensity={0.5} />
  </mesh>
);

// @ts-ignore - Three.js props
export const Tetrahedron = () => (
  <mesh>
    <tetrahedronGeometry args={[1, 0]} />
    <meshStandardMaterial color="#ffffff" wireframe={true} emissive="#6666ff" emissiveIntensity={0.5} />
  </mesh>
);

// @ts-ignore - Three.js props
export const Box = () => (
  <mesh>
    <boxGeometry args={[1.4, 1.4, 1.4]} />
    <meshStandardMaterial color="#ffffff" wireframe={true} emissive="#6666ff" emissiveIntensity={0.5} />
  </mesh>
);

// @ts-ignore - Three.js props
export const Octahedron = () => (
  <mesh>
    <octahedronGeometry args={[1, 0]} />
    <meshStandardMaterial color="#ffffff" wireframe={true} emissive="#6666ff" emissiveIntensity={0.5} />
  </mesh>
);

// @ts-ignore - Three.js props
export const Dodecahedron = () => (
  <mesh>
    <dodecahedronGeometry args={[1, 0]} />
    <meshStandardMaterial color="#ffffff" wireframe={true} emissive="#6666ff" emissiveIntensity={0.5} />
  </mesh>
);

// @ts-ignore - Three.js props
export const Icosahedron = () => (
  <mesh>
    <icosahedronGeometry args={[1, 0]} />
    <meshStandardMaterial color="#ffffff" wireframe={true} emissive="#6666ff" emissiveIntensity={0.5} />
  </mesh>
);

// Star tetrahedron (two intersecting tetrahedrons)
// @ts-ignore - Three.js props
export const TetrahedronStar = () => (
  <group>
    <mesh>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" wireframe={true} emissive="#6666ff" emissiveIntensity={0.5} />
    </mesh>
    <mesh rotation={[0, 0, Math.PI]}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" wireframe={true} emissive="#6666ff" emissiveIntensity={0.5} />
    </mesh>
  </group>
);

type ShapePreviewProps = {
  shape: string;
  size?: number;
  active?: boolean;
};

// @ts-ignore - Three.js props
export const ShapePreview: React.FC<ShapePreviewProps> = ({ 
  shape, 
  size = 40, 
  active = false 
}) => {
  // Map shape name to component
  const getShapeComponent = () => {
    switch (shape) {
      case 'sphere': return <Sphere />;
      case 'tetrahedron': return <Tetrahedron />;
      case 'box': return <Box />;
      case 'octahedron': return <Octahedron />;
      case 'dodecahedron': return <Dodecahedron />;
      case 'icosahedron': return <Icosahedron />;
      case 'tetrahedron_star': return <TetrahedronStar />;
      default: return <Sphere />;
    }
  };

  return (
    <div style={{ 
      width: size, 
      height: size, 
      pointerEvents: 'none'
    }}>
      <Canvas
        frameloop={active ? "always" : "demand"}
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -5]} intensity={1} />
        <pointLight position={[0, 0, 5]} intensity={1} color="#6666ff" />
        <AutoRotate speed={active ? 0.5 : 0.2}>
          {getShapeComponent()}
        </AutoRotate>
      </Canvas>
    </div>
  );
};

// This component renders all shapes at once in a single canvas for better performance
// @ts-ignore - Three.js props
export const ShapePreviewsScene: React.FC<{ 
  activeShape: string; 
  size?: number;
}> = ({ activeShape, size = 200 }) => {
  // Calculate shape positions in a grid layout
  const getPosition = (index: number): [number, number, number] => {
    // First shape is always centered if it's the active one
    if (index === 0) {
      return [0, 0, 0];
    }
    
    // Create a grid-like arrangement of shapes
    const positions: [number, number, number][] = [
      [0, 0, 0],           // Center (active shape)
      [-1.5, 1.5, 0],      // Top left
      [0, 1.5, 0],         // Top center
      [1.5, 1.5, 0],       // Top right
      [-1.5, 0, 0],        // Middle left
      [1.5, 0, 0],         // Middle right
      [0, -1.5, 0],        // Bottom center
    ];
    return positions[index];
  };

  // Get shapes in order, with active shape first
  const shapeOrder = [
    { key: activeShape, type: activeShape },
    ...geometryOptions.filter(opt => opt.value !== activeShape).map(opt => ({ key: opt.value, type: opt.value })),
  ];

  // A helper function to render the appropriate shape component
  const renderShape = (type: string, isActive: boolean) => {
    switch (type) {
      case 'sphere': return <Sphere />;
      case 'tetrahedron': return <Tetrahedron />;
      case 'box': return <Box />;
      case 'octahedron': return <Octahedron />;
      case 'dodecahedron': return <Dodecahedron />;
      case 'icosahedron': return <Icosahedron />;
      case 'tetrahedron_star': return <TetrahedronStar />;
      default: return <Box />;
    }
  };

  return (
    <div style={{ width: size, height: size, margin: '0 auto' }}>
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -5]} intensity={1} />
        <pointLight position={[0, 0, 5]} intensity={1} color="#6666ff" />

        {/* Show all shapes in a grid layout - positioned to match button layout */}
        {/* First row: Sphere, Tetrahedron, Box */}
        <group position={[-1.2, 1, 0]} scale={0.6}>
          <AutoRotate speed={activeShape === 'sphere' ? 0.5 : 0.2}>
            <Sphere />
          </AutoRotate>
        </group>
        <group position={[0, 1, 0]} scale={0.6}>
          <AutoRotate speed={activeShape === 'tetrahedron' ? 0.5 : 0.2}>
            <Tetrahedron />
          </AutoRotate>
        </group>
        <group position={[1.2, 1, 0]} scale={0.6}>
          <AutoRotate speed={activeShape === 'box' ? 0.5 : 0.2}>
            <Box />
          </AutoRotate>
        </group>
        
        {/* Second row: Octahedron, Dodecahedron, Icosahedron */}
        <group position={[-1.2, -0.2, 0]} scale={0.6}>
          <AutoRotate speed={activeShape === 'octahedron' ? 0.5 : 0.2}>
            <Octahedron />
          </AutoRotate>
        </group>
        <group position={[0, -0.2, 0]} scale={0.6}>
          <AutoRotate speed={activeShape === 'dodecahedron' ? 0.5 : 0.2}>
            <Dodecahedron />
          </AutoRotate>
        </group>
        <group position={[1.2, -0.2, 0]} scale={0.6}>
          <AutoRotate speed={activeShape === 'icosahedron' ? 0.5 : 0.2}>
            <Icosahedron />
          </AutoRotate>
        </group>
        
        {/* Third row (centered): Star Tetrahedron */}
        <group position={[0, -1.4, 0]} scale={0.6}>
          <AutoRotate speed={activeShape === 'tetrahedron_star' ? 0.5 : 0.2}>
            <TetrahedronStar />
          </AutoRotate>
        </group>
        
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
};

// Array of geometry options for reference
const geometryOptions = [
  { value: "sphere", label: "Sphere" },
  { value: "tetrahedron", label: "Tetrahedron" },
  { value: "box", label: "Box" },
  { value: "octahedron", label: "Octahedron" },
  { value: "dodecahedron", label: "Dodecahedron" },
  { value: "icosahedron", label: "Icosahedron" },
  { value: "tetrahedron_star", label: "Tetrahedron Star" },
];
