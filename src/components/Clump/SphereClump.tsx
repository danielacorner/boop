/* eslint-disable react/no-unknown-property */
import * as THREE from "three";
import { useSphere } from "@react-three/cannon";
import { useEffect, useMemo, useRef } from "react";
import { COLORS } from "../../utils/constants";
import { rfs } from "../../utils/hooks";
import { WHITE_PIXEL } from "./Clump";
import { usePullTowardsCenter } from "./usePullTowardsCenter";
import { useFrame } from "@react-three/fiber";
import { usePositions } from "../../store/store";
import { useShape } from "../Collider/useShape";
import { GeometryType, useGeometry } from "../../context/GeometryContext";

// Create a custom geometry for the merkaba (star tetrahedron)
const createMerkabaGeometry = (radius: number) => {
  // Create two tetrahedron geometries
  const tetra1 = new THREE.TetrahedronGeometry(radius, 0);
  const tetra2 = new THREE.TetrahedronGeometry(radius, 0);
  
  // Create transformation matrices that match the TetrahedronStar component's rotations
  // First, apply the overall group rotation
  const groupRotation = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(Math.PI/5, Math.PI/4, 0)
  );
  
  // Then apply the second tetrahedron's specific rotation
  const tetra2Rotation = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(Math.PI/2, Math.PI/2, Math.PI/2)
  );
  
  // Apply the rotations
  tetra1.applyMatrix4(groupRotation);
  tetra2.applyMatrix4(tetra2Rotation).applyMatrix4(groupRotation);
  
  // Merge the two geometries
  const mergedGeometry = mergeBufferGeometries([tetra1, tetra2]);
  
  return mergedGeometry;
};

// Helper function to merge geometries (THREE.BufferGeometryUtils.mergeBufferGeometries alternative)
const mergeBufferGeometries = (geometries: THREE.BufferGeometry[]) => {
  const mergedGeometry = new THREE.BufferGeometry();
  
  let vertexCount = 0;
  let indexCount = 0;
  
  // Calculate total counts
  for (const geometry of geometries) {
    vertexCount += geometry.attributes.position.count;
    if (geometry.index) {
      indexCount += geometry.index.count;
    }
  }
  
  // Create arrays for merged data
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2); // Add UVs for texturing
  const indices = indexCount > 0 ? new Uint32Array(indexCount) : null;
  
  let positionOffset = 0;
  let normalOffset = 0;
  let uvOffset = 0;
  let indexOffset = 0;
  let currentIndex = 0;
  
  // Merge attributes
  for (const geometry of geometries) {
    const positionAttr = geometry.attributes.position;
    const normalAttr = geometry.attributes.normal;
    
    // Copy positions
    for (let i = 0; i < positionAttr.count; i++) {
      positions[positionOffset++] = positionAttr.getX(i);
      positions[positionOffset++] = positionAttr.getY(i);
      positions[positionOffset++] = positionAttr.getZ(i);
    }
    
    // Copy normals
    for (let i = 0; i < normalAttr.count; i++) {
      normals[normalOffset++] = normalAttr.getX(i);
      normals[normalOffset++] = normalAttr.getY(i);
      normals[normalOffset++] = normalAttr.getZ(i);
    }
    
    // Copy UVs if they exist or generate basic ones if they don't
    const uvAttr = geometry.attributes.uv;
    if (uvAttr) {
      for (let i = 0; i < uvAttr.count; i++) {
        uvs[uvOffset++] = uvAttr.getX(i);
        uvs[uvOffset++] = uvAttr.getY(i);
      }
    } else {
      // Generate basic UV coordinates if none exist
      for (let i = 0; i < positionAttr.count; i++) {
        // Use position data to create simple UVs
        const x = positionAttr.getX(i);
        const y = positionAttr.getY(i);
        const z = positionAttr.getZ(i);
        
        // Convert 3D position to 2D UV using spherical mapping
        const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        const v = 0.5 - Math.asin(y) / Math.PI;
        
        uvs[uvOffset++] = u;
        uvs[uvOffset++] = v;
      }
    }
    
    // Copy indices
    if (geometry.index && indices) {
      for (let i = 0; i < geometry.index.count; i++) {
        indices[indexOffset++] = geometry.index.getX(i) + currentIndex;
      }
      currentIndex += positionAttr.count;
    }
  }
  
  // Set attributes
  mergedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  mergedGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  mergedGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2)); // Add UVs
  if (indices) {
    mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
  }
  
  return mergedGeometry;
};

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
  // const radiusRef = useRef(radius);
  // const [shape] = useShape();
  
  // Safely use the geometry context if available, otherwise fall back to sphere as default
  let geometryType: GeometryType = "sphere";
  try {
    const context = useGeometry();
    geometryType = context.geometryType;
  } catch (error) {
    // Outside of GeometryProvider (e.g., in Fidget1), use sphere as default
  }
  
  // Create a memoized merkaba geometry when needed
  const merkabaGeometry = useMemo(() => {
    if (geometryType === "tetrahedron_star") {
      // Use the same scale as in the UI component
      return createMerkabaGeometry(radius * 0.95);
    }
    return null;
  }, [geometryType, radius]);
  // Using useSphere for physics, but will display as dodecahedron
  const [sphereRef, api] = useSphere<THREE.InstancedMesh>(
    () => ({
      args: [radius],
      mass: mass,
      angularDamping: 0,
      linearDamping: 0.65,
      angularVelocity: [rfs(0.8), rfs(0.8), rfs(0.8)],
      position: [rfs(20), rfs(20), rfs(20)],
      rotation: [rfs(20), rfs(20), rfs(20)],
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
  // const WOBBLE = 0.05;
  // const ANIMATE_SPEED = 1;
  // useFrame(({ clock }) => {
  //   const t = clock.getElapsedTime();
  //   const wobble = Math.abs(Math.sin(t) * WOBBLE) - WOBBLE / 2;
  //   const nextRadius = radius + (isExpanded ? wobble : 0);
  //   // change radius using lerp
  //   radiusRef.current = THREE.MathUtils.lerp(
  //     radiusRef.current,
  //     nextRadius,
  //     0.1 * ANIMATE_SPEED * (isExpanded ? 0.5 : 1)
  //   );
  //   if (!sphereRef.current) {
  //     return;
  //   }
  //   const geometry = sphereRef.current.geometry;
  //   const position = geometry.attributes.position;
  //   for (let i = 0; i < position.count; i++) {
  //     const vertex = new THREE.Vector3();
  //     vertex.fromBufferAttribute(position, i);
  //     vertex.normalize().multiplyScalar(radiusRef.current);
  //     position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  //   }
  //   position.needsUpdate = true;
  // });

  return (
    <instancedMesh
      ref={sphereRef}
      castShadow
      receiveShadow
      args={[undefined, undefined, nodes.length]}
    >
      {/* Check for explicit props first, then use the selected geometry type */}
      {icosa ? (
        <icosahedronGeometry args={[radius, 0]} />
      ) : dodeca ? (
        <dodecahedronGeometry args={[radius, 0]} />
      ) : geometryType === "sphere" ? (
        <sphereGeometry args={[radius, 32, 32]} />
      ) : geometryType === "dodecahedron" ? (
        <dodecahedronGeometry args={[radius, 0]} />
      ) : geometryType === "icosahedron" ? (
        <icosahedronGeometry args={[radius, 0]} />
      ) : geometryType === "box" ? (
        <boxGeometry args={[radius * 1.6, radius * 1.6, radius * 1.6]} />
      ) : geometryType === "tetrahedron" ? (
        <tetrahedronGeometry args={[radius, 0]} />
      ) : geometryType === "octahedron" ? (
        <octahedronGeometry args={[radius, 0]} />
      ) : geometryType === "tetrahedron_star" && merkabaGeometry ? (
        <primitive object={merkabaGeometry} attach="geometry" />
      ) : (
        <dodecahedronGeometry args={[radius, 0]} />
      )}
      {/* For tetrahedron_star, we only want the geometry, not the wireframe look */}
      {CustomMaterial ? (
        <CustomMaterial {...matProps} />
      ) : (
        <meshPhysicalMaterial {...matProps} />
      )}
    </instancedMesh>
  );
}
