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
  // Get the geometry type from the context
  const { geometryType } = useGeometry();

  const shouldLerpRef = useRef<boolean>(true);

  const [sphereRef, api] = useSphere<any>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic",
      args: [colliderRadius],
      position: [0, 0, 0],
    }),
    null,
    [colliderRadius]
  );

  // subscribe to sphere position
  const position = useRef([0, 0, 0]);
  useEffect(
    () => api.position.subscribe((v) => (position.current = v)),
    [api, colliderRadius]
  );
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
  
  // Direct mouse tracking
  const pointerPosition = useRef<[number, number] | null>(null);
  
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
  useFrame(() => {
    if (!api || !isTabActive.current) return;
    
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
    
    // Apply the final position with physics API - this controls the actual object position
    api.position.set(finalX, finalY, finalDepth);
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
    isTabActive,
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

  const deviceOrientation = useDeviceOrientation();
  // apply impulse when the device rotates
  useEffect(() => {
    const { alpha, beta, gamma } = deviceOrientation;
    api.applyImpulse(
      [(alpha ?? 0) * 0.1, (beta ?? 0) * 0.1, (gamma ?? 0) * 0.1],
      [0, 0, 0]
    );
  }, [deviceOrientation, api]);

  // Render the selected geometry based on the GeometryContext
  const renderGeometry = () => {
    // Common material properties for all geometry types
    const material = (
      <meshPhysicalMaterial
        transmission={1}
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
        // For tetrahedron star, use an icosahedron for now (needs custom geometry)
        return (
          <Icosahedron args={[colliderRadius, 2]}>
            {material}
          </Icosahedron>
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
