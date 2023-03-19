/* eslint-disable react/no-unknown-property */
import { Icosahedron } from "@react-three/drei";
import { useConvexPolyhedron } from "@react-three/cannon";
import { useEffect, useMemo, useRef } from "react";
import { toConvexProps, useEventListener } from "../../utils/hooks";
import { COLLIDER_RADIUS } from "../../utils/constants";
import { useSpring, animated } from "@react-spring/three";
import { useMoveWithMouse } from "./useMoveWithMouse";
import { useCollider } from "./useCollider";
import { useDanceToMusic } from "./useDanceToMusic";
import { useChangeShape } from "./useShape";
import * as THREE from "three";
import { useIsTabActive } from "./useIsTabActive";
import { useDoubleClicked } from "./useDoubleClicked";

export function ColliderInvisible() {
  const { colliderRadius, colliderRadiusMultiplier } = useCollider();
  const icosahedronGeometrygeo = useMemo(
    () => toConvexProps(new THREE.IcosahedronGeometry(colliderRadius)),
    [colliderRadius]
  );
  const [sphereRef, api] = useConvexPolyhedron<THREE.InstancedMesh>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic",
      mass: 2, // approximate mass using volume of a sphere equation
      // https://threejs.org/docs/scenes/geometry-browser.html#IcosahedronGeometry
      args: icosahedronGeometrygeo as any,
      // collisionFilterMask: doubleclicked ? GROUP2 : GROUP1, // It can only collide with group 1 and 2
      position: [0, 0, 0],
      // collisionFilterGroup: GROUP1, // Put the sphere in group 1
      // collisionFilterMask: GROUP1 | GROUP2, // It can only collide with group 1 and 2
    }),
    null
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
  const [dblClicked, setDblClicked] = useDoubleClicked();
  const changeShape = useChangeShape();
  useEventListener("dblclick", (event) => {
    changeShape();
    setDblClicked(false);
  });

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
        // changeShape();
      }
    },
  });

  // fake bpm-based dancing when music is playing
  useDanceToMusic({ api, position, isTabActive, colliderRadius });

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      <Icosahedron
        args={[COLLIDER_RADIUS, -1]}
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
    </animated.mesh>
  );
}
