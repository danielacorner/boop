/* eslint-disable react/no-unknown-property */
import { Html, Icosahedron, Sphere } from "@react-three/drei";
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
import * as THREE from "three";

export function ColliderSphere() {
  const { colliderRadius } = useCollider();

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
  const depthValue = depthContext?.depth || 0;
  
  // Animation state for depth transitions
  const depthAnimation = useRef({
    current: depthValue,
    target: depthValue,
    startTime: 0,
    duration: 120, // Even faster animation for rapid changes (milliseconds)
    animating: false,
    prevDepth: depthValue, // Track the previous depth value
    lastTime: Date.now() // Track last update time
  });
  
  // Update target when depth changes
  useEffect(() => {
    const now = Date.now();
    // When multiple changes happen in rapid succession, adjust current value
    // to create a smooth animation from the current position
    if (depthAnimation.current.animating) {
      // Calculate current position in the animation
      const elapsed = now - depthAnimation.current.startTime;
      const progress = Math.min(elapsed / depthAnimation.current.duration, 1);
      const t = progress < 0.5 ? 4 * progress**3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const currentPos = depthAnimation.current.current + 
                        (depthAnimation.current.target - depthAnimation.current.current) * t;
      
      // Start new animation from the current interpolated position
      depthAnimation.current = {
        ...depthAnimation.current,
        current: currentPos,
        target: depthValue,
        startTime: now,
        animating: true,
        prevDepth: depthAnimation.current.target,
        lastTime: now
      };
    } else {
      // Regular animation start
      depthAnimation.current = {
        ...depthAnimation.current,
        current: depthAnimation.current.current,
        target: depthValue,
        startTime: now,
        animating: true,
        prevDepth: depthAnimation.current.target,
        lastTime: now
      };
    }
  }, [depthValue]);

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
    
    // Calculate the animated depth value
    let finalDepth = depthValue;
    
    // Apply depth animation with improved handling for rapid changes
    if (depthAnimation.current.animating) {
      const { current, target, startTime, duration } = depthAnimation.current;
      const now = Date.now();
      const elapsed = now - startTime;
      
      // Always update the last animation time
      depthAnimation.current.lastTime = now;
      
      // Calculate progress with speed adjustment for large depth changes
      // This makes larger jumps faster to maintain responsiveness
      const distanceFactor = Math.abs(target - current) > 5 ? 0.7 : 1; // Speed up large jumps
      const adjustedDuration = duration * distanceFactor;
      const progress = Math.min(elapsed / adjustedDuration, 1);
      
      // Improved cubic easing with bias toward completion
      // This ensures the animation completes more decisively
      const t = progress < 0.4 ? 4 * progress**3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      finalDepth = current + (target - current) * t;
      
      // End animation when complete or very close
      if (progress >= 1 || Math.abs(finalDepth - target) < 0.01) {
        depthAnimation.current = {
          ...depthAnimation.current,
          current: target,
          animating: false
        };
        finalDepth = target; // Snap exactly to target
      }
    }
    
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
  useDanceToMusic({ api, position, isTabActive, colliderRadius });

  // shaking effect
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

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      {/* <Html>
        <p style={{ color: "white", marginLeft: -192 }}>
          {JSON.stringify(deviceMotion, null, 2)}
        </p>
      </Html> */}
      <Sphere
        args={[colliderRadius, 32]}
        // matrixWorldAutoUpdate={undefined}
        // getObjectsByProperty={undefined}
        // getVertexPosition={undefined}
      >
        <meshPhysicalMaterial
          transmission={1}
          thickness={colliderRadius / 2}
          roughness={0}
        />
      </Sphere>
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
