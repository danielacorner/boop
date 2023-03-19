/* eslint-disable react/no-unknown-property */
import * as THREE from "three";
import { useSphere } from "@react-three/cannon";
import { useEffect, useMemo, useRef, useState } from "react";
import { COLORS, GROUP1, GROUP2 } from "../../utils/constants";
import { rfs, useEventListener } from "../../utils/hooks";
import { WHITE_PIXEL } from "./Clump";
import { usePullTowardsCenter } from "./usePullTowardsCenter";
import { useFrame } from "@react-three/fiber";
import { usePositions } from "../../store/store";

export type SphereClumpProps = {
  radius: number;
  mass?: number;
  numNodes: any;
  mat: THREE.Matrix4;
  position: [number, number, number] | null;
  vec: THREE.Vector3;
  colorArray?: string[];
  materialProps?: any;
  texturePath?: string;
  coloredTexture?: boolean;
  icosa?: boolean;
  dodeca?: boolean;
  texture?: THREE.Texture | any | null;
  roughnessMap?: THREE.Texture | any | null;
  roughnessMapPath?: string;
  normalMapPath?: string;
  normalMap?: THREE.Texture | any | null;
  aoMapPath?: string;
  aoMap?: THREE.Texture | any | null;
  bumpMapPath?: string;
  bumpMap?: THREE.Texture | any | null;
  displacementMapPath?: string;
  displacementMap?: THREE.Texture | any | null;
  CustomMaterial?: (props: any) => JSX.Element;
};

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
}: SphereClumpProps) {
  const radiusRef = useRef(radius);
  const { isExpanded } = usePositions();

  const [sphereRef, api] = useSphere<THREE.InstancedMesh>(
    () => ({
      args: [radius],
      mass: mass,
      angularDamping: 0,
      linearDamping: 0.65,
      angularVelocity: [rfs(0.8), rfs(0.8), rfs(0.8)],
      position: [rfs(20), rfs(20), rfs(20)],
      rotation: [rfs(20), rfs(20), rfs(20)],
      // collisionFilterMask: GROUP1,
      // collisionFilterGroup: /* doubleclicked ? GROUP2 : */ GROUP1,
    }),
    null,
    [mass, radius]
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
    if (!sphereRef.current || !colorArray) {
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
    nodes,
    sphereRef,
    materialProps.transmission,
    texturePath,
    coloredTexture,
    colorArray,
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

  // animate the radius
  const WOBBLE = 0.05;
  const ANIMATE_SPEED = 1;
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const wobble = Math.abs(Math.sin(t) * WOBBLE) - WOBBLE / 2;
    const nextRadius = radius + (isExpanded ? wobble : 0);
    // change radius using lerp
    radiusRef.current = THREE.MathUtils.lerp(
      radiusRef.current,
      nextRadius,
      0.1 * ANIMATE_SPEED * (isExpanded ? 0.5 : 1)
    );
    if (!sphereRef.current) {
      return;
    }
    const geometry = sphereRef.current.geometry;
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(position, i);
      vertex.normalize().multiplyScalar(radiusRef.current);
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    position.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={sphereRef}
      castShadow
      receiveShadow
      args={[undefined, undefined, nodes.length]}
    >
      {icosa ? (
        <icosahedronGeometry args={[undefined, 0]} />
      ) : dodeca ? (
        <dodecahedronGeometry args={[undefined, 0]} />
      ) : (
        <sphereGeometry args={[undefined, 32, 32]}>
          {/* <instancedAttribute
                                  attach="attributes-color"
                                  count={filteredNodesRandom.length}
                                  array={colorArray}
                                /> */}
        </sphereGeometry>
      )}
      {CustomMaterial ? (
        <CustomMaterial {...matProps} />
      ) : (
        <meshPhysicalMaterial {...matProps} />
      )}
    </instancedMesh>
  );
}
