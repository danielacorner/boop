/* eslint-disable react/no-unknown-property */
import * as THREE from "three";
import { useConvexPolyhedron } from "@react-three/cannon";
import { useRef, useState, useTransition } from "react";
import D20_Star from "../Models/D20_star";
import { useMount } from "react-use";
import { BALL_MASS, BALL_RADIUS } from "../utils/constants";
import { animated, useSpring } from "@react-spring/three";
import { toConvexProps } from "../utils/hooks";
import { usePullSingleTowardsCenter } from "./usePullSingleTowardsCenter";

const COMMON_MATERIAL_PROPS = {
  transparent: true,
  wireframe: false,
  depthTest: true,
  flatShading: false,
  roughness: 0.4,
  vertexColors: false,
  reflectivity: 1,
};

const DETAIL = 0;
const STAR_SCALE = 1.6;
const icosahedronGeometrygeo = toConvexProps(
  new THREE.IcosahedronGeometry(BALL_RADIUS * STAR_SCALE, DETAIL)
);
export function D20StarComponent({
  position,
}: {
  position: [number, number, number];
}) {
  const [ref, api] = useConvexPolyhedron<THREE.InstancedMesh>(
    () => ({
      mass: BALL_MASS * 2, // approximate mass using volume of a sphere equation
      // https://threejs.org/docs/scenes/geometry-browser.html#IcosahedronGeometry
      args: icosahedronGeometrygeo as any,
    }),
    null
    // [doubleclicked]
  );

  const d20Position = useRef<[number, number, number]>([0, 0, 0]);
  useMount(() => {
    api.position.subscribe((v) => (d20Position.current = v));
  });
  usePullSingleTowardsCenter({
    api,
    position,
    pulledItem: d20Position,
  });
  // useFrame((state) => {
  //   if (!ref.current) {
  //     return;
  //   }
  //   // Normalize the position and multiply by a negative force.
  //   // This is enough to drive it towards the center-point.
  //   api.applyForce(
  //     new THREE.Vector3(
  //       d20Position.current[0],
  //       d20Position.current[1],
  //       d20Position.current[2]
  //     )
  //       .normalize()
  //       .multiplyScalar(-50)
  //       .toArray(),
  //     [0, 0, 0]
  //   );
  // });
  const [hovered, setHovered] = useState<THREE.Event | null>(null);
  const [hoveredNear, setHoveredNear] = useState<THREE.Event | null>(null);
  const [{ envMapIntensity, scale, emissive }] = useSpring(
    {
      envMapIntensity: hovered ? 4 : 1.83,
      scale: hovered ? 1.2 : 1,
      emissive: hoveredNear ? "#5f538a" : "#23212a",
    },
    [hovered, hoveredNear]
  );
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <animated.mesh ref={ref} castShadow receiveShadow scale={scale}>
        {/* mouseover padding */}
        <mesh
          visible={false}
          onPointerOver={(e) => {
            startTransition(() => {
              setHoveredNear(e.object);
            });
          }}
          onPointerOut={(e) => {
            startTransition(() => {
              setHoveredNear(null);
            });
          }}
        >
          <sphereGeometry
            attach="geometry"
            args={[BALL_RADIUS * STAR_SCALE * 2, 8, 8]}
          />
        </mesh>
        <mesh
          onDoubleClick={() => {
            window.open("https://20d.netlify.app");
          }}
          onPointerOver={(e) => {
            setHovered(e.object);
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            setHovered(null);
            document.body.style.cursor = "unset";
          }}
        >
          <D20_Star scale={0.03 * STAR_SCALE}>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <animated.meshPhysicalMaterial
              {...COMMON_MATERIAL_PROPS}
              color={"#e3deee"}
              emissive={emissive}
              depthTest={hoveredNear ? false : true}
              depthWrite={true}
              metalness={0.9}
              roughness={0}
              envMapIntensity={envMapIntensity}
              // clearcoat={z}
              // clearcoatRoughness={0.4}
              // color="silver"
            />
          </D20_Star>
        </mesh>
      </animated.mesh>
    </>
  );
}
