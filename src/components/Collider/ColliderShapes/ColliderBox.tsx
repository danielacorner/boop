/* eslint-disable react/no-unknown-property */
import { Box } from "@react-three/drei";
import { useBox } from "@react-three/cannon";
import { useEffect, useRef } from "react";
import { COLLIDER_RADIUS, GROUP1, GROUP2 } from "../../../utils/constants";
import { useSpring, animated } from "@react-spring/three";
import { useMoveWithMouse } from "../useMoveWithMouse";
import { useCollider } from "../useCollider";
import { useDanceToMusic } from "../useDanceToMusic";
import { useChangeShape } from "../useShape";
import * as THREE from "three";
import { useIsTabActive } from "../useIsTabActive";
import { useSpin } from "../useSpin";
import { useDoubleClicked } from "../useDoubleClicked";

const BOX_MULT = 1.5;
export function ColliderBox() {
  const { colliderRadius } = useCollider();
  const boxWidth = colliderRadius * BOX_MULT;
  const [sphereRef, api] = useBox<THREE.InstancedMesh>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic",
      mass: 2, // approximate mass using volume of a sphere equation
      // https://threejs.org/docs/scenes/geometry-browser.html#IcosahedronGeometry
      args: [boxWidth, boxWidth, boxWidth],
      position: [0, 0, 0],
    }),
    null,
    [boxWidth]
  );

  const shouldLerpRef = useRef<boolean>(true);

  // subscribe to sphere position
  const position = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((v) => (position.current = v)), [api]);
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

  useSpin(api);

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      <Box
        args={[
          colliderRadius * BOX_MULT,
          colliderRadius * BOX_MULT,
          colliderRadius * BOX_MULT,
        ]}
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
