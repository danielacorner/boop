import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useConvexPolyhedron } from "@react-three/cannon";
import { Geometry } from "three-stdlib";
import { useMemo, useRef, useState } from "react";
import D20_Star from "../Models/D20_star";
import { useMount } from "react-use";
import { BALL_MASS, BALL_RADIUS } from "../utils/constants";
import { animated, useSpring } from "@react-spring/three";

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
export function D20StarComponent() {
  const geo = useMemo(
    () =>
      toConvexProps(
        new THREE.IcosahedronBufferGeometry(BALL_RADIUS * STAR_SCALE, DETAIL)
      ),
    []
  );

  const [ref, api] = useConvexPolyhedron<THREE.InstancedMesh>(() => ({
    mass: BALL_MASS * 2, // approximate mass using volume of a sphere equation
    // https://threejs.org/docs/scenes/geometry-browser.html#IcosahedronGeometry
    args: geo as any,
  }));
  const d20Position = useRef([0, 0, 0]);
  useMount(() => {
    api.position.subscribe((v) => (d20Position.current = v));
  });
  useFrame((state) => {
    if (!ref.current) {
      return;
    }
    // Normalize the position and multiply by a negative force.
    // This is enough to drive it towards the center-point.
    api.applyForce(
      new THREE.Vector3(
        d20Position.current[0],
        d20Position.current[1],
        d20Position.current[2]
      )
        .normalize()
        .multiplyScalar(-50)
        .toArray(),
      [0, 0, 0]
    );
  });
  const [hovered, hover] = useState<THREE.Event | null>(null);
  const [{ envMapIntensity, scale, emissive }] = useSpring(
    {
      envMapIntensity: hovered ? 4 : 1.83,
      scale: hovered ? 1.2 : 1,
      emissive: hovered ? "#5f538a" : "#23212a",
    },
    [hovered]
  );

  return (
    <>
      <animated.mesh
        ref={ref}
        castShadow
        receiveShadow
        onClick={() => {
          window.open("https://20d.netlify.app");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hover(e.object);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          hover(null);
          document.body.style.cursor = "unset";
        }}
        scale={scale}
      >
        <D20_Star scale={0.03 * STAR_SCALE}>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <animated.meshPhysicalMaterial
            {...COMMON_MATERIAL_PROPS}
            color={"#e3deee"}
            emissive={emissive}
            depthTest={hovered ? false : true}
            depthWrite={true}
            metalness={0.9}
            roughness={0}
            envMapIntensity={envMapIntensity}
            // clearcoat={z}
            // clearcoatRoughness={0.4}
            // color="silver"
          />
        </D20_Star>
      </animated.mesh>
    </>
  );
}
/**
 * Returns legacy geometry vertices, faces for ConvP
 * @param {THREE.BufferGeometry} bufferGeometry
 */
function toConvexProps(bufferGeometry) {
  const geo = new Geometry().fromBufferGeometry(bufferGeometry);
  // Merge duplicate vertices resulting from glTF export.
  // Cannon assumes contiguous, closed meshes to work
  geo.mergeVertices();
  return [geo.vertices.map((v) => [v.x, v.y, v.z]), geo.faces.map((f) => [f.a, f.b, f.c]), []]; // prettier-ignore
}
