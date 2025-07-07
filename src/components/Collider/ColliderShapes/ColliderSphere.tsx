/* eslint-disable react/no-unknown-property */
import { Html, Icosahedron, Sphere, Box, Tetrahedron, Octahedron, Dodecahedron } from "@react-three/drei";
import { useSphere } from "@react-three/cannon";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useSpring, animated, config as springConfig } from "@react-spring/three";
import { useCollider } from "../useCollider";
import { useDanceToMusic } from "../useDanceToMusic";
import { useChangeShape } from "../useShape";
import { useIsTabActive } from "../useIsTabActive";
import { useDoubleClicked } from "../useDoubleClicked";
import { useEventListener } from "../../../utils/hooks";
import { useContext } from "react";
import { DepthContext } from "../../../context/DepthContext";
import { GeometryType } from "../../../context/GeometryContext";
import * as THREE from "three";
import { useSpin } from "../useSpin";

// Accept geometryType as a prop instead of using the context directly
export function ColliderSphere({ geometryType = "sphere" }: { geometryType?: GeometryType }) {
  const { colliderRadius } = useCollider();
  // Get the isTabActive reference only once at the top level
  const isTabActiveRef = useIsTabActive();

  // Position tracking and configuration
  const position = useRef<[number, number, number]>([0, 0, 0]);
  const shouldLerpRef = useRef<boolean>(true);
  const pointerPosition = useRef<[number, number] | null>(null);
  
  // Debug mode for rotation testing
  const debugForceRotation = true; // Set to false to disable forced rotation

  // Track last collision for debugging/visualization
  const lastCollision = useRef<any>(null);
  
  // Create a physics body that collides properly with other objects
  const [sphereRef, api] = useSphere<any>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic", // Kinematic for manual position control with collisions
      args: [colliderRadius],
      position: [0, 0, 0],
      // Basic physics properties focused on collision
      mass: 1, // Standard mass
      // Allow standard physics interaction
      linearFactor: [1, 1, 1], // Normal linear movement
      angularFactor: [1, 1, 1], // Normal rotation
      // Physics damping settings
      linearDamping: 0.5,
      angularDamping: 0.5,
      // Material properties
      material: { 
        friction: 0.2,
        restitution: 0.8 // Good bounciness without being extreme
      },
      // Other settings
      allowSleep: false, // Keep physics always active
      fixedRotation: false, // Allow rotation
      collisionResponse: true, // Ensure collisions are registered
      collisionFilterGroup: 1, // Explicit collision group
      collisionFilterMask: -1, // Collide with everything
      // Important: Explicitly handle collisions to apply rotational force
      // Enhanced collision event handler with MAXIMUM rotation response
      onCollide: (e: any) => {
        // Simple collision handler - just log and keep physics active
        console.log('Collision detected!', e);
        
        // Make sure the physics body stays active
        api.wakeUp();
        
        // Let the physics engine naturally handle the collision response
      }
    
    }),
    null,
    [colliderRadius]
  );

  // Subscribe to sphere position and rotation
  const rotation = useRef([0, 0, 0, 0]); // Quaternion [x, y, z, w]
  
  // Apply rotation effect (same as other shapes)
  useSpin(api);
  
  useEffect(() => {
    // Track position
    const unsubPosition = api.position.subscribe((v) => (position.current = v));
    // Track rotation
    const unsubRotation = api.quaternion.subscribe((q) => (rotation.current = q));
    
    return () => {
      unsubPosition();
      unsubRotation();
    };
  }, [api]);
  
  const isTabActive = useIsTabActive();

  // Get depth from context
  const depthContext = useContext(DepthContext);
  const contextDepthValue = depthContext?.depth || 0;

  // Use React Spring's physics-based animation for super smooth transitions
  const [{ animatedDepth }, springApi] = useSpring(() => ({
    animatedDepth: contextDepthValue,
    // Spring configuration for smooth transitions
    config: {
      mass: 0.4,       // Lower mass for faster response
      tension: 170,    // Higher tension for quicker movement
      friction: 14,    // Balanced friction for minimal oscillation
      precision: 0.001, // High precision for smooth transitions
      velocity: 0      // Start with 0 velocity
    },
  }));
  
  // Update the spring animation when depth changes
  useEffect(() => {
    springApi.start({
      animatedDepth: contextDepthValue,
      // The immediate flag would skip animation - we don't want that
      immediate: false,
    });
  }, [contextDepthValue, springApi]);

  // Get access to Three.js objects and viewport
  const { viewport, size, get } = useThree();
  
  // Helper function to convert client coordinates to viewport space
  const getPointerPosition = (clientX: number, clientY: number): [number, number] => {
    const x = (clientX / size.width) * 2 - 1;
    const y = -(clientY / size.height) * 2 + 1;
    return [(x * viewport.width) / 2, (y * viewport.height) / 2];
  };
  
  // Track mouse movements directly
  useEventListener("mousemove", (event) => {
    if (!isTabActive.current) return;
    pointerPosition.current = getPointerPosition(event.clientX, event.clientY);
    shouldLerpRef.current = false;
  });
  
  // Track touch movements
  useEventListener("touchmove", (event) => {
    if (!isTabActive.current) return;
    pointerPosition.current = getPointerPosition(
      event.changedTouches[0].clientX, 
      event.changedTouches[0].clientY
    );
    shouldLerpRef.current = false;
  });
  
  // Handle clicks
  useEventListener("click", (event) => {
    if (!isTabActive.current) return;
    pointerPosition.current = getPointerPosition(event.clientX, event.clientY);
    shouldLerpRef.current = true;
  });
  
  // Handle both mouse movement and depth animation in a single frame update
  // Mouse movement is already tracked at the top level
  
  useFrame(({ clock }) => {
    if (!api || !isTabActiveRef.current) return;
    
    // Get current position from ref
    let nextX, nextY;
    const currentPos = position.current;
    
    if (pointerPosition.current) {
      // Use direct mouse/touch position if available
      [nextX, nextY] = pointerPosition.current;
    } else {
      // Fallback to Three.js pointer
      const pointer = get().pointer;
      nextX = (pointer.x * viewport.width) / 2;
      nextY = (pointer.y * viewport.height) / 2;
    }
    
    // Apply smooth movement if enabled
    let finalX = nextX;
    let finalY = nextY;
    
    if (shouldLerpRef.current) {
      const LERP_SPEED = 0.15;
      finalX = THREE.MathUtils.lerp(currentPos[0], nextX, LERP_SPEED);
      finalY = THREE.MathUtils.lerp(currentPos[1], nextY, LERP_SPEED);
    }
    
    // Get the current animated depth value directly from React Spring
    // This is automatically smooth and handles interruptions perfectly
    const finalDepth = animatedDepth.get();
    
    // For mouse/wheel control, always set position directly
    // This ensures perfect tracking regardless of physics
    api.position.set(finalX, finalY, finalDepth);
    
    // We're no longer applying continuous rotation
    // Letting the physics engine handle rotation naturally
    
    // Wake up the physics body every frame to ensure it stays active
    api.wakeUp();
    
    // Let any natural rotation happen without interference
  });

  // double click to change width
  const [dblClicked, setDblClicked] = useDoubleClicked();
  const changeShape = useChangeShape();

  const { scale } = useSpring({
    scale: [1, 1, 1].map((d) => d * (dblClicked ? 1.2 : 1)) as [
      number,
      number,
      number
    ],
    config: {
      mass: 0.5,
      tension: 500,
      friction: 13,
    },
    onRest: () => {
      if (dblClicked) {
        setDblClicked(false);
        changeShape();
      }
    },
  });

  // fake bpm-based dancing when music is playing
  // Pass the current depth value from React Spring to make sure it's available in hooks
  useDanceToMusic({
    api, 
    position, 
    isTabActive: isTabActiveRef,
    colliderRadius
  });

  // shaking effect (commented out)
  // const deviceMotion = useDeviceMotion();
  // console.log("⭐🎈  ColliderSphere  deviceMotion:", deviceMotion);
  // useEffect(() => {
  //   const {
  //     x: accX,
  //     y: accY,
  //     z: accZ,
  //   } = deviceMotion.accelerationIncludingGravity;
  //   api.applyImpulse(
  //     [(accX ?? 0) * 0.1, (accY ?? 0) * 0.1, (accZ ?? 0) * 0.1],
  //     [0, 0, 0]
  //   );
  // }, [deviceMotion, api]);

  // We'll no longer apply rotations from device orientation
  // This ensures rotation only comes from collisions

  // Render the selected geometry based on the GeometryContext
  const renderGeometry = () => {
    // Common material properties for all geometry types
    const material = (
      <meshPhysicalMaterial
        transmission={0.9}
        thickness={colliderRadius / 2}
        roughness={0}
      />
    );
    
    // Higher resolution for complex shapes
    const highDetail = 24;
    const lowDetail = 16;
    
    // Match geometryType from context to appropriate geometry components
    switch (geometryType) {
      case "box":
        // Box takes width, height, depth params
        return (
          <Box args={[colliderRadius * 1.5, colliderRadius * 1.5, colliderRadius * 1.5]}>
            {material}
          </Box>
        );
      case "octahedron":
        return (
          <Octahedron args={[colliderRadius * 1.2, 0]}>
            {material}
          </Octahedron>
        );
      case "dodecahedron":
        return (
          <Dodecahedron args={[colliderRadius, 0]}>
            {material}
          </Dodecahedron>
        );
      case "icosahedron":
        return (
          <Icosahedron args={[colliderRadius, 0]}>
            {material}
          </Icosahedron>
        );
      case "tetrahedron":
        return (
          <Tetrahedron args={[colliderRadius * 1.3, 0]}>
            {material}
          </Tetrahedron>
        );
      case "tetrahedron_star":
        // Merkaba - Star tetrahedron (two perfectly interlocking tetrahedrons)
        return (
          <group rotation={[Math.PI/5, Math.PI/4, 0]}>
            {/* Upward-pointing tetrahedron */}
            <Tetrahedron args={[colliderRadius * 1.4, 0]}>
              <meshPhysicalMaterial
                transmission={0.9}
                thickness={colliderRadius / 2.5}
                roughness={0.0}
                metalness={0}
              />
            </Tetrahedron>
            
            {/* Downward-pointing tetrahedron */}
            <group rotation={[Math.PI/2, Math.PI/2, Math.PI/2]}>
              <Tetrahedron args={[colliderRadius * 1.4, 0]}>
                <meshPhysicalMaterial
                  transmission={0.9}
                  thickness={colliderRadius / 2.5}
                  roughness={0.0}
                  metalness={0}
                />
              </Tetrahedron>
            </group>
          </group>
        );
      case "sphere":
      default:
        // Default to sphere
        return (
          <Sphere args={[colliderRadius, highDetail]}>
            {material}
          </Sphere>
        );
    }
  };
  
  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      {renderGeometry()}
    </animated.mesh>
  );
}
const useDeviceMotion = () => {
  const [motion, setMotion] = useState({
    acceleration: {
      x: null,
      y: null,
      z: null,
    },
    accelerationIncludingGravity: {
      x: null,
      y: null,
      z: null,
    },
    rotationRate: {
      alpha: null,
      beta: null,
      gamma: null,
    },
    interval: 0,
  });
  useEventListener("devicemotion", (deviceMotionEvent) => {
    setMotion(deviceMotionEvent);
  });

  return motion;
};

const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState({
    alpha: null,
    beta: null,
    gamma: null,
  });
  useEventListener("deviceorientation", (deviceOrientationEvent) => {
    setOrientation(deviceOrientationEvent);
  });

  return orientation;
};
