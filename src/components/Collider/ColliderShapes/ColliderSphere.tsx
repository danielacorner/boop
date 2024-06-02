/* eslint-disable react/no-unknown-property */
import { Icosahedron, Sphere } from "@react-three/drei";
import { useSphere } from "@react-three/cannon";
import { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/three";
import { useMoveWithMouse } from "../useMoveWithMouse";
import { useCollider } from "../useCollider";
import { useDanceToMusic } from "../useDanceToMusic";
import { useChangeShape } from "../useShape";
import { useIsTabActive } from "../useIsTabActive";
import { useDoubleClicked } from "../useDoubleClicked";

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

  useMoveWithMouse({ isTabActive, position, api, shouldLerpRef });

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
  const deviceMotion = useDeviceMotion();
  useEffect(() => {
    const {
      x: accX,
      y: accY,
      z: accZ,
    } = deviceMotion.accelerationIncludingGravity;
    api.applyImpulse(
      [(accX ?? 0) * 0.1, (accY ?? 0) * 0.1, (accZ ?? 0) * 0.1],
      [0, 0, 0]
    );
  }, [deviceMotion, api]);

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      <Sphere
        args={[colliderRadius, 32]}
        matrixWorldAutoUpdate={undefined}
        getObjectsByProperty={undefined}
        getVertexPosition={undefined}
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

  useEffect(() => {
    const handle = (deviceMotionEvent) => {
      setMotion(deviceMotionEvent);
    };

    window.addEventListener("devicemotion", handle);

    return () => {
      window.removeEventListener("devicemotion", handle);
    };
  }, []);

  return motion;
};