/* eslint-disable react/no-unknown-property */
import { Box } from "@react-three/drei";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useEventListener } from "../../utils/hooks";
import { GROUP1, GROUP2 } from "../../utils/constants";
import { useSpring, animated } from "@react-spring/three";
import { useMoveWithMouse } from "./useMoveWithMouse";
import { useCollider } from "./useCollider";
import { useDanceToMusic } from "./useDanceToMusic";
import { useShape } from "./useShape";
import * as THREE from "three";
import { useIsTabActive } from "./useIsTabActive";
import { useSpin } from "./useSpin";

export const LERP_SPEED = 0.35;
export const COLLIDER_RADIUS = 2;

export function ColliderBox() {
  // on double click, keep the sphere interactive with the clumps
  // const [doubleclicked, setDoubleclicked] = useState(false);
  // useEventListener("dblclick", () => {
  //   setDoubleclicked(!doubleclicked);
  // });

  const { colliderRadius, colliderRadiusMultiplier } = useCollider();

  const [sphereRef, api] = useBox<THREE.InstancedMesh>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic",
      mass: 2, // approximate mass using volume of a sphere equation
      // https://threejs.org/docs/scenes/geometry-browser.html#IcosahedronGeometry
      args: [colliderRadius * 2, colliderRadius * 2, colliderRadius * 2],
      // collisionFilterMask: doubleclicked ? GROUP2 : GROUP1, // It can only collide with group 1 and 2
      position: [0, 0, 0],
      collisionFilterGroup: GROUP1, // Put the sphere in group 1
      collisionFilterMask: GROUP1 | GROUP2, // It can only collide with group 1 and 2
    }),
    null,
    [colliderRadius]
  );

  const shouldLerpRef = useRef<boolean>(true);

  // subscribe to sphere position
  const position = useRef([0, 0, 0]);
  useEffect(
    () => api.position.subscribe((v) => (position.current = v)),
    [api, colliderRadius]
  );
  const isTabActive = useIsTabActive();

  useMoveWithMouse({ isTabActive, position, api, shouldLerpRef });

  // double click to change width
  const [dblClicked, setDblClicked] = useState(false);
  useEventListener("dblclick", (event) => {
    setDblClicked(true);
  });

  const [, setShape] = useShape();

  const { scale } = useSpring({
    scale: [1, 1, 1].map(
      (d) => d * (dblClicked ? 1.2 : 1) * colliderRadiusMultiplier
    ) as [number, number, number],
    config: {
      mass: 0.5,
      tension: 500,
      friction: 13,
    },
    onRest: () => {
      if (dblClicked) {
        setDblClicked(false);
        setShape("none");
      }
    },
  });

  // fake bpm-based dancing when music is playing
  useDanceToMusic({ api, position, isTabActive, colliderRadius });

  useSpin(api);

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      <Box
        args={[COLLIDER_RADIUS * 2, COLLIDER_RADIUS * 2, COLLIDER_RADIUS * 2]}
        matrixWorldAutoUpdate={undefined}
        getObjectsByProperty={undefined}
        getVertexPosition={undefined}
      >
        <meshPhysicalMaterial
          transmission={1}
          thickness={colliderRadius / 2}
          roughness={0}
        />
      </Box>
    </animated.mesh>
  );
}
