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
import { useGeometry } from "../../../context/GeometryContext";
import * as THREE from "three";

export function ColliderSphere() {
  const { colliderRadius } = useCollider();
  // Get the isTabActive reference only once at the top level
  const isTabActiveRef = useIsTabActive();
  
  // Get the geometry type from the context with fallback
  // This prevents the "useGeometry must be used within a GeometryProvider" error
  let geometryType = "sphere"; // Default fallback value
  
  try {
    const context = useGeometry();
    if (context) {
      geometryType = context.geometryType;
    }
  } catch (error) {
    // If context is not available, use the default value
    console.log("GeometryContext not available, using fallback");
  }

  // Position tracking and configuration
  const position = useRef<[number, number, number]>([0, 0, 0]);
  const shouldLerpRef = useRef<boolean>(true);
  const pointerPosition = useRef<[number, number] | null>(null);
  
  // Debug mode for rotation testing
  const debugForceRotation = true; // Set to false to disable forced rotation

  // Track last collision for debugging/visualization
  const lastCollision = useRef<any>(null);
  
  // Create a physics body that ONLY rotates from collisions but position is controlled directly by mouse
  const [sphereRef, api] = useSphere<any>(
    () => ({
      name: "colliderSphere",
      // Type must be Dynamic to allow rotation physics
      type: "Dynamic",
      args: [colliderRadius],
      position: [0, 0, 0],
      // Critical physics properties for extreme rotation response
      mass: 0.01, // Ultra-light mass for extreme rotation sensitivity
      // These factors are crucial - they completely disable linear movement from physics
      // while allowing rotational physics to work normally
      linearFactor: [0, 0, 0], // This prevents ALL position changes from physics
      angularFactor: [1, 1, 1], // This allows full rotational physics
      // Physics damping settings
      linearDamping: 1.0, // Maximum - prevents any linear momentum
      angularDamping: 0.0, // Zero damping for maximum rotation persistence
      // Material properties optimized for maximum rotation
      material: { 
        friction: 0.0, // Zero friction to maximize rotation
        restitution: 10.0 // Maximum possible bounciness for exaggerated collision response
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
        // Store collision data for reference and debug
        lastCollision.current = e;
        console.log('Collision detected!', e);
        
        try {
          // Create an EXTREME rotational effect for maximum visibility
          // Using higher force values to ensure very obvious rotation on any collision
          const baseRotationForce = 0; // Extremely strong base rotation
          
          // Always apply a dramatic random rotation regardless of collision details
          // This guarantees visible rotation even if collision data is incomplete
          api.angularVelocity.set(
            (Math.random() - 0.5) * baseRotationForce * 2,
            (Math.random() - 0.5) * baseRotationForce * 2,
            (Math.random() - 0.5) * baseRotationForce * 2
          );
          
          // If we have detailed collision data, add directed rotation too
          if (e && e.body) {
            // Try to extract normal vector for directed rotation
            if (e.ni && Array.isArray(e.ni)) {
              // Apply additional directed impulse using the normal vector
              // This creates a more natural-looking response to the specific impact
              api.applyTorque([
                e.ni[1] * baseRotationForce * 10, // Extremely strong X-axis response
                e.ni[0] * baseRotationForce * 10, // Extremely strong Y-axis response
                (e.ni[0] + e.ni[1]) * baseRotationForce * 5 // Strong Z-axis response
              ]);
              
              // If impact velocity available, add proportional impulse
              if (typeof e.impactVelocity === 'number' && e.impactVelocity > 0) {
                const velocityFactor = Math.min(30, e.impactVelocity * 5);
                
                // Apply velocity-scaled impulse for more dynamic response
                api.applyTorque([
                  e.ni[0] * velocityFactor * 10,
                  e.ni[1] * velocityFactor * 10,
                  e.ni[2] * velocityFactor * 10
                ]);
              }
            }
            
            // Apply a direct angular velocity change for immediate effect
            // This is more direct than torque and shows immediate results
            const randomRotation = [
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 5
            ];
            api.angularVelocity.set(randomRotation[0], randomRotation[1], randomRotation[2]);
          }
          
          // Ensure body stays awake to show rotation
          api.wakeUp();
        } catch (err) {
          console.log('Error in collision handler:', err);
          // Use a fallback rotation method if the above fails
          try {
            // Apply a strong random rotation as fallback
            api.angularVelocity.set(
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 10
            );
            api.wakeUp();
          } catch (innerErr) {
            console.log('Failed to apply fallback rotation:', innerErr);
          }
        }
      }
    
    }),
    null,
    [colliderRadius]
  );

  // Subscribe to sphere position and rotation
  const rotation = useRef([0, 0, 0, 0]); // Quaternion [x, y, z, w]
  
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
    
    // GUARANTEED ROTATION: Constantly apply continuous rotation
    // This ensures the collider always shows rotation regardless of collisions
    const t = clock.getElapsedTime();
    
    // Calculate a rotation pattern that's visibly interesting and dramatic
    // This creates a smooth wobble that's always visible to verify rotation works
    const rotSpeed = 0.5; // A modest speed that's clearly visible
    
    // Apply a continuous sine-wave based rotation pattern
    // This is a fallback to ensure SOME rotation is always visible
    // When testing is complete, this can be removed
    api.angularVelocity.set(
      Math.sin(t * 0.9) * rotSpeed,
      Math.cos(t * 1.1) * rotSpeed,
      Math.sin(t * 1.3 + 0.5) * rotSpeed
    );
    
    // Still check for very slow velocities to prevent jitter
    let needsReset = false;
    const unsubscribe = api.angularVelocity.subscribe((vel) => {
      const totalVelocity = Math.abs(vel[0]) + Math.abs(vel[1]) + Math.abs(vel[2]);
      if (totalVelocity > 0 && totalVelocity < 0.01) { // Lower threshold
        needsReset = true;
      }
    });
    
    // Clean up subscription immediately
    unsubscribe();
    
    if (needsReset) {
      // If rotating very slowly, reset to our sine-based pattern
      api.angularVelocity.set(
        Math.sin(t * 0.9) * rotSpeed,
        Math.cos(t * 1.1) * rotSpeed,
        Math.sin(t * 1.3 + 0.5) * rotSpeed
      );
    }
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
            <Tetrahedron args={[colliderRadius * 0.95, 0]}>
              <meshPhysicalMaterial
                transmission={0.9}
                thickness={colliderRadius / 2.5}
                roughness={0.0}
                metalness={0}
              />
            </Tetrahedron>
            
            {/* Downward-pointing tetrahedron */}
            <group rotation={[Math.PI/2, Math.PI/2, Math.PI/2]}>
              <Tetrahedron args={[colliderRadius * 0.95, 0]}>
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
