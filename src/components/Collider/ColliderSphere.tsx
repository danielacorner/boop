/* eslint-disable react/no-unknown-property */
import { Box, Icosahedron, Sphere } from "@react-three/drei";
import { useSphere } from "@react-three/cannon";
import { useEffect, useRef, useState } from "react";
import { useEventListener } from "../../utils/hooks";
import { GROUP1, GROUP2 } from "../../utils/constants";
import { useSpring, animated } from "@react-spring/three";
import { useMoveWithMouse } from "./useMoveWithMouse";
import { useCollider } from "./useCollider";
import { useDanceToMusic } from "./useDanceToMusic";
import { useShape } from "./useShape";
import { useIsTabActive } from "./useIsTabActive";

export const LERP_SPEED = 0.35;
export const COLLIDER_RADIUS = 2;

export function ColliderSphere() {
  // on double click, keep the sphere interactive with the clumps
  // const [doubleclicked, setDoubleclicked] = useState(false);
  // useEventListener("dblclick", () => {
  //   setDoubleclicked(!doubleclicked);
  // });

  const { colliderRadius, colliderRadiusMultiplier } = useCollider();

  const shouldLerpRef = useRef<boolean>(true);

  // A collision is allowed if
  // (bodyA.collisionFilterGroup & bodyB.collisionFilterMask) && (bodyB.collisionFilterGroup & bodyA.collisionFilterMask)
  //  These are indeed bitwise operations. https://en.wikipedia.org/wiki/Bitwise_operation#Truth_table_for_all_binary_logical_operators
  // examples https://github.com/schteppe/cannon.js/blob/master/demos/collisionFilter.html#L50
  const [sphereRef, api] = useSphere<any>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic",
      args: [colliderRadius],
      position: [0, 0, 0],
      collisionFilterGroup: GROUP1, // Put the sphere in group 1
      collisionFilterMask: GROUP1 | GROUP2, // It can only collide with group 1 and 2
      // collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
      // collisionFilterMask,
    }),
    null,
    [/* doubleclicked, */ colliderRadius]
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
  const [dblClicked, setDblClicked] = useState(false);
  useEventListener("dblclick", (event) => {
    setDblClicked(true);
    // const timer = setTimeout(() => {
    //   setDblClicked(false);
    // }, 1000);
    // return () => clearTimeout(timer);
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
        setShape("icosa");
      }
    },
  });

  // fake bpm-based dancing when music is playing
  useDanceToMusic({ api, position, isTabActive, colliderRadius });

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      <Icosahedron
        args={[COLLIDER_RADIUS, 0]}
        matrixWorldAutoUpdate={undefined}
        getObjectsByProperty={undefined}
        getVertexPosition={undefined}
      >
        <meshPhysicalMaterial
          transmission={1}
          thickness={colliderRadius / 2}
          roughness={0}
        />
      </Icosahedron>
      <Sphere
        args={[COLLIDER_RADIUS, 32]}
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
