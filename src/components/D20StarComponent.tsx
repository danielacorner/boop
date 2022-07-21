import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useConvexPolyhedron } from "@react-three/cannon";
import { Geometry } from "three-stdlib";
import { useMemo, useRef } from "react";
import D20_Star from "../GLTFs/D20_star";
import { useControls } from "leva";
import { useMount } from "react-use";
import { BALL_MASS, BALL_RADIUS } from "../utils/constants";

const COMMON_MATERIAL_PROPS = {
  transparent: true,
  wireframe: false,
  depthTest: true,
  flatShading: false,
  roughness: 0.4,
  vertexColors: false,
  reflectivity: 1,
};

const DETAIL = 1;
const STAR_SCALE = 1.6;
export function D20StarComponent() {
  const { x, y, z } = useControls({ x: 0.9, y: 0, z: 1.83 });

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

  return (
    <>
      <mesh ref={ref} castShadow receiveShadow>
        <D20_Star scale={0.03 * STAR_SCALE}>
          <meshPhysicalMaterial
            {...COMMON_MATERIAL_PROPS}
            depthWrite={true}
            metalness={x}
            roughness={y}
            envMapIntensity={z}
            // clearcoat={z}
            // clearcoatRoughness={0.4}
            // color="silver"
          />
        </D20_Star>
      </mesh>
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
