/* eslint-disable react/no-unknown-property */
import { Dodecahedron } from "@react-three/drei";
import { useConvexPolyhedron } from "@react-three/cannon";
import { useEffect, useMemo, useRef, useContext } from "react";
import { toConvexProps } from "../../../utils/hooks";
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
import { DepthContext } from "../../../context/DepthContext";
const ICOSA_MULT = 1.2;
export function ColliderDodeca() {
  const { colliderRadius: colliderRadius0, colliderRadiusMultiplier } =
    useCollider();
  const colliderRadius = colliderRadius0 * ICOSA_MULT;
  const dodecahedronGeometrygeo = useMemo(
    () =>
      toConvexProps(
        new THREE.DodecahedronGeometry(colliderRadius * 1.3, 0)
      ),
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

  const [sphereRef, api] = useConvexPolyhedron<THREE.InstancedMesh>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic",
      mass: 1, // Standard mass
      args: dodecahedronGeometrygeo as any,
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
        console.log('Collision detected with dodeca!', e);
        api.wakeUp();
      }
    }),
    null,
    [dodecahedronGeometrygeo]
  );
  useSpin(api);

  const shouldLerpRef = useRef<boolean>(true);

  // subscribe to sphere position
  const position = useRef([0, 0, 0]);
  useEffect(
    () => api.position.subscribe((v) => (position.current = v)),
    [api, colliderRadius]
  );
  const isTabActive = useIsTabActive();

  // Pass animated depth to useMoveWithMouse
  useFrame(() => {
    if (!api || !isTabActive.current) return;
    // Apply the animated depth from React Spring
    const depth = animatedDepth.get();
    // Get current position
    const currentPos = position.current;
    // Update with depth
    api.position.set(currentPos[0], currentPos[1], depth);
  });
  
  useMoveWithMouse({ isTabActive, position, api, shouldLerpRef, depth: 0 });

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
