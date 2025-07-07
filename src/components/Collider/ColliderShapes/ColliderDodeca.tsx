/* eslint-disable react/no-unknown-property */
import { Dodecahedron } from "@react-three/drei";
import { useConvexPolyhedron } from "@react-three/cannon";
import { useEffect, useMemo, useRef, useContext } from "react";
import { useRotation } from "../../../context/RotationContext";
import { toConvexProps, useEventListener } from "../../../utils/hooks";
import { useSpring, animated } from "@react-spring/three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMoveWithMouse } from "../useMoveWithMouse";
import { useCollider } from "../useCollider";
import { useDanceToMusic } from "../useDanceToMusic";
import { useChangeShape } from "../useShape";
import * as THREE from "three";
import { useIsTabActive } from "../useIsTabActive";
import { useSpin } from "../useSpin";
import { useDoubleClicked } from "../useDoubleClicked";
import { getEnhancedCollisionConfig, getEnhancedCollisionHandler, applyContinuousCollisionWakeup } from "../preventObjectSticking";
import { DepthContext } from "../../../context/DepthContext";
import { GeometryType } from "../../../context/GeometryContext";
const ICOSA_MULT = 1;
export function ColliderDodeca({ geometryType = "dodecahedron" }: { geometryType?: GeometryType }) {
  const { colliderRadius: colliderRadius0, colliderRadiusMultiplier } =
    useCollider();
  const colliderRadius = colliderRadius0 * ICOSA_MULT *colliderRadiusMultiplier;
  const dodecahedronGeometrygeo = useMemo(
    () => {
      // Create a slightly larger collision geometry to prevent objects from penetrating
      // The 1.4 factor ensures the collision happens before visual intersection
      const collisionGeometry = new THREE.DodecahedronGeometry(colliderRadius * 1.4, 0);
      return toConvexProps(collisionGeometry);
    },
    [colliderRadius]
  );
  // Get depth from context
  const depthContext = useContext(DepthContext);
  const contextDepthValue = depthContext?.depth || 0;

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

  // Get rotation settings from context
  const { isKinematic } = useRotation();
  const angularFactor = useMemo<[number, number, number]>(() => [1, 1, 1], []);
  
  const [sphereRef, api] = useConvexPolyhedron<THREE.InstancedMesh>(
    () => ({
      name: "colliderDodeca",
      type: isKinematic ? "Kinematic" : "Dynamic", // Respect rotation context setting
      mass: 1,
      args: dodecahedronGeometrygeo as any,
      position: [0, 0, 0],
      linearFactor: [1, 1, 1],
      angularFactor,
      // Apply enhanced collision settings
      ...getEnhancedCollisionConfig(colliderRadius, 1.1),
      // Define collision filters explicitly
      collisionFilterGroup: 1,
      collisionFilterMask: -1
    }),
    null,
    [dodecahedronGeometrygeo]
  );

  // Set up collision handler properly after physics body is created
  useEffect(() => {
    if (sphereRef.current) {
      // Register collision event listener
      sphereRef.current.addEventListener('collision', (event: any) => {
        // Use our enhanced collision handler
        getEnhancedCollisionHandler(api)(event);
      });
    }
  }, [api, sphereRef]);

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
    
    // Check if position has changed significantly
    const hasMoved = (
      Math.abs(finalX - currentPos[0]) > 0.001 || 
      Math.abs(finalY - currentPos[1]) > 0.001 || 
      Math.abs(finalDepth - currentPos[2]) > 0.001
    );
    
    // Update position with depth
    api.position.set(finalX, finalY, finalDepth);
    
    // Use shared helper to maintain continuous collision detection
    applyContinuousCollisionWakeup(api, hasMoved, currentPos as [number, number, number]);
  });
  
  // fake bpm-based dancing when music is playing
  useDanceToMusic({ api, position, isTabActive: isTabActiveRef, colliderRadius });

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

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      <Dodecahedron
        args={[colliderRadius * ICOSA_MULT, 0]}
      >
        <meshPhysicalMaterial
          transmission={0.9}
          thickness={colliderRadius / 2}
          roughness={0}
          metalness={0}
        />
      </Dodecahedron>
    </animated.mesh>
  );
}
