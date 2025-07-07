/* eslint-disable react/no-unknown-property */
import { Tetrahedron } from "@react-three/drei";
import { useConvexPolyhedron } from "@react-three/cannon";
import { useEffect, useMemo, useRef, useContext } from "react";
import { Group } from "three";
import { toConvexProps, useEventListener } from "../../../utils/hooks";
import { useSpring, animated } from "@react-spring/three";
import { useFrame, useThree } from "@react-three/fiber";
import { useCollider } from "../useCollider";
import { useDanceToMusic } from "../useDanceToMusic";
import { useChangeShape } from "../useShape";
import * as THREE from "three";
import { useIsTabActive } from "../useIsTabActive";
import { useSpin } from "../useSpin";
import { useDoubleClicked } from "../useDoubleClicked";
import { DepthContext } from "../../../context/DepthContext";

// Multiplier to scale the tetrahedron appropriately
const TETRA_MULT = 1.3;

export function ColliderTetra() {
  const { colliderRadius } = useCollider();
  
  // Get depth from context
  const depthContext = useContext(DepthContext);
  const contextDepthValue = depthContext?.depth || 0;
  
  // Create tetrahedron geometry for physics body
  const tetrahedronGeometry = useMemo(() => 
    toConvexProps(new THREE.TetrahedronGeometry(colliderRadius * TETRA_MULT, 0)),
    [colliderRadius]
  );
  
  // Use React Spring's physics-based animation for super smooth transitions
  const [{ animatedDepth }, springApi] = useSpring(() => ({
    animatedDepth: contextDepthValue,
    config: {
      mass: 0.4,
      tension: 170,
      friction: 14,
      precision: 0.001,
      velocity: 0
    },
  }));
  
  // Update the spring animation when depth changes
  useEffect(() => {
    springApi.start({
      animatedDepth: contextDepthValue,
      immediate: false,
    });
  }, [contextDepthValue, springApi]);
  
  // Create physics body with proper tetrahedron collision shape
  const [tetraRef, api] = useConvexPolyhedron<THREE.Mesh>(() => ({
    mass: 1,
    type: "Kinematic",
    args: tetrahedronGeometry as any,
    position: [0, 0, 0],
    // Physics settings for proper collisions
    linearFactor: [1, 1, 1],
    angularFactor: [1, 1, 1],
    linearDamping: 0.5,
    angularDamping: 0.5,
    material: {
      friction: 0.2,
      restitution: 0.8
    },
    allowSleep: false,
    fixedRotation: false,
    collisionResponse: true,
    collisionFilterGroup: 1,
    collisionFilterMask: -1,
    // Simple collision handler
    onCollide: (e: any) => {
      console.log('Collision detected with tetrahedron!', e);
      api.wakeUp();
    }
  }));
  
  // Store the active status in a ref for use in the frame loop
  const isTabActiveRef = useRef<boolean>(true);
  const isTabActive = useIsTabActive();
  useEffect(() => {
    isTabActiveRef.current = isTabActive.current;
  }, [isTabActive]);
  
  // Apply rotation effect
  useSpin(api);

  const shouldLerpRef = useRef<boolean>(true);

  // Reference to current position for smooth animation
  const position = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((v) => (position.current = v)), [api]);
  
  // Tracking for mouse/touch pointer position
  const pointerPosition = useRef<[number, number] | null>(null);
  
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
    if (!isTabActiveRef.current) return;
    pointerPosition.current = getPointerPosition(event.clientX, event.clientY);
    shouldLerpRef.current = false;
  });
  
  // Track touch movements
  useEventListener("touchmove", (event) => {
    if (!isTabActiveRef.current) return;
    pointerPosition.current = getPointerPosition(
      event.changedTouches[0].clientX, 
      event.changedTouches[0].clientY
    );
    shouldLerpRef.current = false;
  });
  
  // Handle clicks
  useEventListener("click", (event) => {
    if (!isTabActiveRef.current) return;
    pointerPosition.current = getPointerPosition(event.clientX, event.clientY);
    shouldLerpRef.current = true;
  });

  // Handle both mouse movement and depth animation in a single frame update  
  useFrame(() => {
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
    const finalDepth = animatedDepth.get();
    
    // Update position with depth
    api.position.set(finalX, finalY, finalDepth);
    
    // Wake up the physics body every frame to ensure it stays active
    api.wakeUp();
  });

  const changeShape = useChangeShape();

  // double click to change width
  const [dblClicked, setDblClicked] = useDoubleClicked();

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
  useDanceToMusic({ api, position, isTabActive: isTabActiveRef, colliderRadius });

  return (
    <animated.mesh name="colliderTetra" ref={tetraRef as any} scale={scale}>
      {/* Visual representation of tetrahedron */}
      <Tetrahedron args={[colliderRadius * TETRA_MULT, 0]}>
        <meshPhysicalMaterial
          transmission={0.9}
          thickness={colliderRadius / 2}
          roughness={0}
          metalness={0}
        />
      </Tetrahedron>
    </animated.mesh>
  );
}
