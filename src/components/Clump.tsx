import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PublicApi, useSphere } from "@react-three/cannon";
import { useEffect, useMemo, useState } from "react";
import {
  BALL_RADIUS,
  BALL_MASS,
  COLORS,
  GROUP1,
  GROUP2,
} from "../utils/constants";
import { rfs, useEventListener } from "../utils/hooks";
import { Vector3 } from "three";
const WHITE_PIXEL = "/white_pixel.png";
export function Clump({
  materialProps = {} as any,
  numNodes,
  texturePath = WHITE_PIXEL,
  roughnessMapPath = WHITE_PIXEL,
  normalMapPath = WHITE_PIXEL,
  aoMapPath = WHITE_PIXEL,
  bumpMapPath = WHITE_PIXEL,
  displacementMapPath = WHITE_PIXEL,
  position = null as [number, number, number] | null,
  coloredTexture = false,
  icosa = false,
  dodeca = false,
  radius = BALL_RADIUS,
  mass = BALL_MASS,
  CustomMaterial = undefined as ((props: any) => JSX.Element) | undefined,
}) {
  const mat = useMemo(() => new THREE.Matrix4(), []);
  const vec = useMemo(() => new THREE.Vector3(), []);

  const texture = useTexture(texturePath);
  const roughnessMap = useTexture(roughnessMapPath);
  const normalMap = useTexture(normalMapPath);
  const aoMap = useTexture(aoMapPath);
  const bumpMap = useTexture(bumpMapPath);
  const displacementMap = useTexture(displacementMapPath);
  const colorArray = useMemo(
    () =>
      new Array(numNodes).fill(null).flatMap((_, i) => {
        const color = COLORS[i];
        return color;
      }),
    [numNodes]
  );

  const props = {
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
  };
  return icosa || dodeca ? <IcoClump {...props} /> : <SphereClump {...props} />;
}
function IcoClump({
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
      args: [radius * 0.9],
      mass,
      angularDamping: 0.75,
      linearDamping: 0.65,
      angularVelocity: [rfs(0.8), rfs(0.8), rfs(0.8)],
      position: [rfs(20), rfs(20), rfs(20)],
      rotation: [rfs(20), rfs(20), rfs(20)],
      collisionFilterMask: GROUP1,
      collisionFilterGroup: doubleclicked ? GROUP2 : GROUP1,
      onCollide: ({ body, collisionFilters, contact, target }: any) => {
        if (body.name === "colliderSphere") {
          for (let i = 0; i < nodes.length; i++) {
            const torque = [
              rfs(4 * contact.impactVelocity ** 2),
              rfs(4 * contact.impactVelocity ** 2),
              rfs(4 * contact.impactVelocity ** 2),
            ];
            api.at(i).applyTorque(torque as [number, number, number]);
          }
        }
      },
    }),
    null,
    [doubleclicked, mass, radius]
  );
  // ! not working great - dodecas overlap with spheres
  // const geo = useMemo(
  //   () =>
  //     toConvexProps(
  //       dodeca
  //         ? new THREE.DodecahedronBufferGeometry(radius * 1.2, 0)
  //         : new THREE.IcosahedronBufferGeometry(radius * 1.2, 0)
  //     ),
  //   [radius, dodeca]
  // );
  // const [sphereRef, api] = useConvexPolyhedron<THREE.InstancedMesh>(
  //   () => ({
  //     mass,
  //     // https://threejs.org/docs/scenes/geometry-browser.html#IcosahedronGeometry
  //     args: geo as any,
  //     angularDamping: 0,
  //     linearDamping: 0.65,
  //     angularVelocity: [rfs(0.8), rfs(0.8), rfs(0.8)],
  //     position: [rfs(20), rfs(20), rfs(20)],
  //     rotation: [rfs(20), rfs(20), rfs(20)],
  //     collisionFilterMask: GROUP1,
  //     collisionFilterGroup: doubleclicked ? GROUP2 : GROUP1,
  //   }),
  //   null,
  //   [doubleclicked, mass, geo]
  // );

  const nodes = useMemo(() => [...Array(numNodes)], [numNodes]);
  usePullTowardsCenter({
    sphereRef,
    numNodes: nodes.length,
    vec,
    position,
    mat,
    api,
  });
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
    ...{
      // const baubleMaterial = new THREE.MeshPhysicalMaterial({
      // color: "white",
      // roughness,
      // envMapIntensity,
      // emissive: "emissive" in materialProps ? null : emissive,
      // metalness,
      // transmission,
      ...materialProps,
      // });
    },
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
function SphereClump({
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
export function usePullTowardsCenter({
  sphereRef,
  vec,
  position,
  mat,
  api,
  numNodes,
}: {
  sphereRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  vec: THREE.Vector3;
  position: [number, number, number] | null;
  mat: THREE.Matrix4;
  api: PublicApi;
  numNodes: number;
}) {
  useFrame((state) => {
    if (!sphereRef?.current) {
      return;
    }
    for (let i = 0; i < numNodes; i++) {
      // Get current whereabouts of the instanced sphere
      sphereRef.current.getMatrixAt(i, mat);

      // drive it towards center or a specified point

      const force1 = vec.setFromMatrixPosition(mat);
      const force2 = force1
        // add the position
        .addVectors(
          force1,
          new Vector3(
            position ? position[0] : 0,
            position ? position[1] : 0,
            position ? position[2] : 0
          )
        )
        // then normalize and
        // multiply by a negative scalar to send it towards that point
        .normalize()
        .multiplyScalar(-50)
        .toArray();
      api.at(i).applyForce(force2, [0, 0, 0]);
    }
  });
}
