/* eslint-disable react/no-unknown-property */
import { Octahedron } from "@react-three/drei";
import { useConvexPolyhedron } from "@react-three/cannon";
import { useEffect, useMemo, useRef } from "react";
import { toConvexProps } from "../../../utils/hooks";
import { useSpring, animated } from "@react-spring/three";
import { useMoveWithMouse } from "../useMoveWithMouse";
import { useCollider } from "../useCollider";
import { useDanceToMusic } from "../useDanceToMusic";
import { useChangeShape } from "../useShape";
import * as THREE from "three";
import { useIsTabActive } from "../useIsTabActive";
import { useSpin } from "../useSpin";
import { useDoubleClicked } from "../useDoubleClicked";
const ICOSA_MULT = 1.2;
export function ColliderOcta() {
  const { colliderRadius: colliderRadius0, colliderRadiusMultiplier } =
    useCollider();
  const colliderRadius = colliderRadius0 * ICOSA_MULT;
  const dodecahedronGeometrygeo = useMemo(
    () => toConvexProps(new THREE.OctahedronBufferGeometry(colliderRadius)),
    [colliderRadius]
  );
  const [sphereRef, api] = useConvexPolyhedron<THREE.InstancedMesh>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic",
      mass: 2, // approximate mass using volume of a sphere equation
      // https://threejs.org/docs/scenes/geometry-browser.html#IcosahedronGeometry
      args: dodecahedronGeometrygeo as any,
      position: [0, 0, 0],
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

  useMoveWithMouse({ isTabActive, position, api, shouldLerpRef });
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
  useDanceToMusic({ api, position, isTabActive, colliderRadius });

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      <Octahedron
        args={[colliderRadius * ICOSA_MULT, 0]}
        matrixWorldAutoUpdate={undefined}
        getObjectsByProperty={undefined}
        getVertexPosition={undefined}
      >
        <meshPhysicalMaterial
          transmission={1}
          thickness={colliderRadius / 2}
          roughness={0}
        />
      </Octahedron>
    </animated.mesh>
  );
}
