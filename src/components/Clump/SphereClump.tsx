import * as THREE from "three";
import { useSphere } from "@react-three/cannon";
import { useEffect, useMemo, useState } from "react";
import { COLORS, GROUP1, GROUP2 } from "../../utils/constants";
import { rfs, useEventListener } from "../../utils/hooks";
import { WHITE_PIXEL } from "./Clump";
import { usePullTowardsCenter } from "./usePullTowardsCenter";

export function SphereClump({
  radius,
  mass,
  numNodes,
  mat,
  position,
  vec,
  colorArray,
  materialProps,
  texturePath,
  coloredTexture,
  icosa,
  dodeca,
  texture,
  roughnessMap,
  roughnessMapPath,
  normalMapPath,
  normalMap,
  aoMapPath,
  aoMap,
  bumpMapPath,
  bumpMap,
  displacementMapPath,
  displacementMap,
  CustomMaterial,
}: {
  radius: number;
  mass: number;
  numNodes: any;
  mat: THREE.Matrix4;
  position: [number, number, number] | null;
  vec: THREE.Vector3;
  colorArray: string[];
  materialProps: any;
  texturePath: string;
  coloredTexture: boolean;
  icosa: boolean;
  dodeca: boolean;
  texture: THREE.Texture;
  roughnessMap: THREE.Texture;
  roughnessMapPath: string;
  normalMapPath: string;
  normalMap: THREE.Texture;
  aoMapPath: string;
  aoMap: THREE.Texture;
  bumpMapPath: string;
  bumpMap: THREE.Texture;
  displacementMapPath: string;
  displacementMap: THREE.Texture;
  CustomMaterial?: (props: any) => JSX.Element;
}) {
  // on double click...
  // the clump stops interacting with itself
  // (but not with the collidersphere)
  const [doubleclicked, setDoubleclicked] = useState(false);
  useEventListener("dblclick", () => {
    setDoubleclicked(!doubleclicked);
  });

  const [sphereRef, api] = useSphere<THREE.InstancedMesh>(
    () => ({
      args: [radius],
      mass,
      angularDamping: 0,
      linearDamping: 0.65,
      angularVelocity: [rfs(0.8), rfs(0.8), rfs(0.8)],
      position: [rfs(20), rfs(20), rfs(20)],
      rotation: [rfs(20), rfs(20), rfs(20)],
      collisionFilterMask: GROUP1,
      collisionFilterGroup: doubleclicked ? GROUP2 : GROUP1,
    }),
    null,
    [doubleclicked, mass, radius]
  );
  const nodes = useMemo(() => [...Array(numNodes)], [numNodes]);
  usePullTowardsCenter({
    sphereRef,
    numNodes: nodes.length,
    vec,
    position,
    mat,
    api,
  });

  // set color
  useEffect(() => {
    if (!sphereRef.current) {
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
      sphereRef.current.setColorAt(index, new THREE.Color(color));
    }
  }, [
    colorArray.length,
    nodes,
    sphereRef,
    materialProps.transmission,
    texturePath,
    coloredTexture,
  ]);

  const matProps = {
    map: texture,
    roughnessMap: roughnessMap,
    // normalMapType:THREE.ObjectSpaceNormalMap,
    ...(roughnessMapPath === WHITE_PIXEL
      ? {}
      : {
          roughnessMap,
        }),
    ...(normalMapPath === WHITE_PIXEL
      ? {}
      : {
          normalMap,
        }),
    ...(aoMapPath === WHITE_PIXEL
      ? {}
      : {
          aoMap,
          aoMapIntensity: 0.5,
        }),
    ...(bumpMapPath === WHITE_PIXEL
      ? {}
      : {
          bumpMap,
        }),
    ...(displacementMapPath === WHITE_PIXEL
      ? {}
      : {
          displacementMap,
        }),
    // normalMap:normalMap,
    // const baubleMaterial = new THREE.MeshPhysicalMaterial({
    // color: "white",
    // roughness,
    // envMapIntensity,
    // emissive: "emissive" in materialProps ? null : emissive,
    // metalness,
    // transmission,
    ...materialProps,
    // });
  };
  return (
    <instancedMesh
      ref={sphereRef}
      castShadow
      receiveShadow
      args={[undefined, undefined, nodes.length]}
    >
      {icosa ? (
        <icosahedronBufferGeometry args={[radius, 0]} />
      ) : dodeca ? (
        <dodecahedronBufferGeometry args={[radius, 0]} />
      ) : (
        <sphereBufferGeometry args={[radius, 32, 32]}>
          {/* <instancedBufferAttribute
                                  attach="attributes-color"
                                  count={filteredNodesRandom.length}
                                  array={colorArray}
                                /> */}
        </sphereBufferGeometry>
      )}
      {CustomMaterial ? (
        <CustomMaterial {...matProps} />
      ) : (
        <meshPhysicalMaterial {...matProps} />
      )}
    </instancedMesh>
  );
}
