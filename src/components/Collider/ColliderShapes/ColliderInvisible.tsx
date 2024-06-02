/* eslint-disable react/no-unknown-property */
import { Icosahedron } from "@react-three/drei";
import { useConvexPolyhedron, useSphere } from "@react-three/cannon";
import { useEffect, useMemo, useRef } from "react";
import { toConvexProps, useEventListener } from "../../../utils/hooks";
import { useSpring, animated } from "@react-spring/three";
import { useMoveWithMouse } from "../useMoveWithMouse";
import { useCollider } from "../useCollider";
import { useDanceToMusic } from "../useDanceToMusic";
import { useChangeShape } from "../useShape";
import { useIsTabActive } from "../useIsTabActive";
import { useDoubleClicked } from "../useDoubleClicked";

export function ColliderInvisible() {
  const { colliderRadius } = useCollider();

  const [sphereRef, api] = useSphere<any>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic",
      args: [colliderRadius * 2],
      position: [0, 0, 0],
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
  const [dblClicked, setDblClicked] = useDoubleClicked();
  const changeShape = useChangeShape();
  useEventListener("dblclick", (event) => {
    changeShape();
    setDblClicked(false);
  });

  useEffect(() => {
    if (dblClicked) {
      changeShape();
      setDblClicked(false);
    }
  }, [changeShape, dblClicked, setDblClicked]);

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
        // changeShape();
      }
    },
  });

  // fake bpm-based dancing when music is playing
  useDanceToMusic({ api, position, isTabActive, colliderRadius });

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      <Icosahedron
        args={[colliderRadius, -1]}
        //        matrixWorldAutoUpdate={undefined}
        //        getObjectsByProperty={undefined}
        //        getVertexPosition={undefined}
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
