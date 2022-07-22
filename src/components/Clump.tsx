import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { useEffect, useMemo } from "react";
import { BALL_RADIUS, BALL_MASS, COLORS } from "../utils/constants";
import { rfs } from "../utils/hooks";

export function Clump({
  materialProps = {} as any,
  numNodes,
  texturePath = "/ball.jpg",
  roughnessTexturePath = "/roughness_map.jpg",
  position = null as [number, number, number] | null,
  brightness = null,
  coloredTexture = false,
  radius = BALL_RADIUS,
  mass = BALL_MASS,
}) {
  const mat = useMemo(() => new THREE.Matrix4(), []);
  const vec = useMemo(() => new THREE.Vector3(), []);

  const texture = useTexture(texturePath);
  const roughnessTexture = useTexture(roughnessTexturePath);
  const colorArray = useMemo(
    () =>
      new Array(numNodes).fill(null).flatMap((_, i) => {
        const color = COLORS[i];
        return color;
      }),
    [numNodes]
  );

  const [ref, api] = useSphere<THREE.InstancedMesh>(() => ({
    args: [radius],
    mass,
    angularDamping: 0,
    linearDamping: 0.65,
    angularVelocity: [rfs(0.8), rfs(0.8), rfs(0.8)],
    position: [rfs(20), rfs(20), rfs(20)],
  }));
  const nodes = useMemo(() => [...Array(numNodes)], [numNodes]);
  useFrame((state) => {
    if (!ref.current) {
      return;
    }
    for (let i = 0; i < nodes.length; i++) {
      // Get current whereabouts of the instanced sphere
      ref.current.getMatrixAt(i, mat);
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api.at(i).applyForce(
        position
          ? new THREE.Vector3(position[0], position[1], position[2])
              // .set(position[0], position[1], position[2])
              // .setFromMatrixPosition(mat)
              .setComponent(0, position[0])
              .setComponent(1, position[1])
              .setComponent(2, position[0])
              .normalize()
              .multiplyScalar(-50)
              .toArray()
          : vec
              .setFromMatrixPosition(mat)
              .normalize()
              .multiplyScalar(-50)
              .toArray(),
        position ?? [0, 0, 0]
      );
    }
  });
  // const sphereGeometry = new THREE.SphereGeometry(RADIUS, 32, 32);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    for (let index = 0; index < colorArray.length; index++) {
      const color = COLORS[index % COLORS.length];
      if (
        materialProps.transmission === 1 ||
        (texturePath && !coloredTexture)
      ) {
        return;
      }
      ref.current.setColorAt(index, new THREE.Color(color));
    }
  }, [
    colorArray.length,
    nodes,
    ref,
    materialProps.transmission,
    texturePath,
    coloredTexture,
  ]);
  // const { transmission, roughness, emissive, metalness, envMapIntensity } =
  //   useControls({
  //     roughness: 0,
  //     emissive: "#370037",
  //     metalness: 0,
  //     envMapIntensity: 0.2,
  //     transmission: 0,
  //   });
  return (
    <>
      <instancedMesh
        ref={ref}
        castShadow
        receiveShadow
        args={[undefined, undefined, nodes.length]}
      >
        <sphereBufferGeometry args={[radius, 32, 32]}>
          {/* <instancedBufferAttribute
              attach="attributes-color"
              count={filteredNodesRandom.length}
              array={colorArray}
            /> */}
        </sphereBufferGeometry>

        <meshPhysicalMaterial
          map={texture}
          roughnessMap={roughnessTexture}
          {...{
            // const baubleMaterial = new THREE.MeshPhysicalMaterial({
            // color: "white",
            // roughness,
            // envMapIntensity,
            // emissive: "emissive" in materialProps ? null : emissive,
            // metalness,
            // transmission,
            ...materialProps,
            // });
          }}
        >
          {/* <instancedBufferAttribute
              attach="attributes-color"
              args={[colorArray, 3]}
            /> */}
        </meshPhysicalMaterial>
      </instancedMesh>
    </>
  );
}
