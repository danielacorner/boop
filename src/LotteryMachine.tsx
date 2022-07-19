import {
  useTexture,
  Sky,
  Environment,
  Effects as EffectComposer,
  Sphere,
  useDetectGPU,
  AdaptiveDpr,
} from "@react-three/drei";
import * as THREE from "three";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Physics, useSphere } from "@react-three/cannon";
import { SSAOPass } from "three-stdlib";
import { useEffect, useMemo, useRef } from "react";
import palettes from "nice-color-palettes";
import { useEventListener } from "./utils/hooks";
extend({ SSAOPass });

const BALL_RADIUS = 0.5;
const rfs = THREE.MathUtils.randFloatSpread;

export const LotteryMachine = () => {
  return (
    <Canvas
      style={{ position: "fixed", inset: 0 }}
      shadows
      dpr={[0.2, 2]}
      camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
      performance={{ min: 0.9 }}
      gl={{ alpha: false, antialias: false }}
    >
      <AdaptiveDpr pixelated />
      {/* {gpu.tier <= 2 && <AdaptiveDpr pixelated />} */}
      <ambientLight intensity={0.25} />
      <spotLight
        intensity={1}
        angle={0.2}
        penumbra={1}
        position={[30, 30, 30]}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight
        intensity={5}
        position={[-10, -10, -10]}
        color="purple"
      />
      <Physics gravity={[0, 2, 0]} iterations={10}>
        <PhysicsScene />
      </Physics>
      <Environment files="/adamsbridge.hdr" />
      <Effects />
      {/* https://threejs.org/examples/webgl_shaders_sky.html */}
      <Sky turbidity={10} rayleigh={0} inclination={0.51} />
    </Canvas>
  );
};
// function DebugInDev({ children }) {
//   return process.env.NODE_ENV === "development" ? (
//     <Debug>{children}</Debug>
//   ) : (
//     <>{children}</>
//   );
// }

// const tempObject = new THREE.Object3D();
// const tempColor = new THREE.Color();

const COLORS = [...palettes[0], ...palettes[1], ...palettes[3], ...palettes[2]];

function PhysicsScene() {
  const gpu = useDetectGPU();
  const num = gpu.tier > 2 ? 12 : 10;
  const { viewport } = useThree();
  // const { metalness, env } = useControls({ metalness: 0, env: 1 });
  return (
    <>
      {/* <DebugInDev> */}
      <ColliderSphere />
      <Clump
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 4,
          envMapIntensity: 1,
          transmission: 1,
          thickness: BALL_RADIUS,
        }}
      />
      {/* <Clump
        numNodes={num}
        materialProps={{
          roughness: 0.6,
          emissive: null,
          metalness: 0.1,
          envMapIntensity: 1.5,
          transmission: 0,
        }}
        texturePath={"ball_modern.jpg"}
      /> */}
      <Clump
        numNodes={num}
        materialProps={{
          roughness: 0,
          // emissive: "#535353",
          metalness: 1,
          envMapIntensity: 10,
          transmission: 0,
        }}
        // texturePath={"ball_mars.jpg"}
        radius={BALL_RADIUS}
      />
      <Clump
        numNodes={1}
        materialProps={{
          roughness: 0.6,
          emissive: null,
          metalness: 0.1,
          envMapIntensity: 1.5,
          transmission: 0,
        }}
        texturePath={"ball_jupiter.jpg"}
        radius={BALL_RADIUS * 1.6}
      />
      <Clump
        numNodes={1}
        materialProps={{
          roughness: 0.5,
          emissive: "#c04b14",
          metalness: 0.1,
          envMapIntensity: 5,
          transmission: 0,
        }}
        texturePath={"ball_sun.jpg"}
        radius={BALL_RADIUS * 2.4}
      />
      <Clump
        numNodes={num}
        materialProps={{
          roughness: 0.6,
          emissive: null,
          metalness: 0,
          envMapIntensity: 15,
          transmission: 0,
        }}
        texturePath={"ball_earth.jpg"}
      />
      <Clump
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 3,
          transmission: 0,
        }}
        texturePath={"ball_vangogh.jpg"}
      />
      {/* </DebugInDev> */}
    </>
  );
}

function Clump({
  materialProps = {} as any,
  numNodes,
  texturePath = "/ball.jpg",
  position = null as [number, number, number] | null,
  brightness = null,
  radius = BALL_RADIUS,
}) {
  const mat = useMemo(() => new THREE.Matrix4(), []);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const eul = useMemo(
    () =>
      position ? new THREE.Euler(position[0], position[1], position[2]) : null,
    [position]
  );

  const texture = useTexture(texturePath);
  const colorArray = useMemo(
    () =>
      new Array(numNodes).fill(null).flatMap((_, i) => {
        const color = COLORS[i];
        return color;
      }),
    [numNodes]
  );

  const [ref, api] = useSphere<any>(() => ({
    args: [radius],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)],
  }));
  const nodes = useMemo(() => [...Array(numNodes)], [numNodes]);
  useFrame((state) => {
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
    for (let index = 0; index < colorArray.length; index++) {
      const color = COLORS[index % COLORS.length];
      if (materialProps.transmission === 1 || texturePath) {
        return;
      }
      ref.current.setColorAt(index, new THREE.Color(color));
    }
  }, [colorArray.length, nodes, ref, materialProps.transmission, texturePath]);
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
        // geometry={sphereGeometry}
        // material={baubleMaterial}
        // material-map={texture}
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
          // transmission={1}
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
function ColliderSphere() {
  const { viewport, size } = useThree();

  const gpu = useDetectGPU();
  const colliderRadius = gpu.tier > 2 ? 3 : 2;
  const [ref, api] = useSphere<any>(() => ({
    type: "Kinematic",
    args: [colliderRadius],
    position: [0, 0, 0],
  }));
  // subscribe to sphere position
  const position = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((v) => (position.current = v)), [api]);

  const touchingRef = useRef<[number, number, number] | null>(null);
  useFrame((state) => {
    const nextX =
      ((touchingRef.current?.[0] ?? state.pointer.x) * viewport.width) / 2;
    const nextY =
      ((touchingRef.current?.[1] ?? state.pointer.y) * viewport.height) / 2;
    const nextXL = THREE.MathUtils.lerp(position.current[0], nextX, 0.24);
    const nextYL = THREE.MathUtils.lerp(position.current[1], nextY, 0.24);
    return api.position.set(nextXL, nextYL, 0);
  });

  useEventListener("touchmove", (event) => {
    touchingRef.current = getPosition({
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
      size,
      viewport,
    });
  });

  useEventListener("click", (event) => {
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });
  useEventListener("mousemove", (event) => {
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });

  return (
    <Sphere ref={ref} args={[colliderRadius, 32, 32]}>
      <meshPhysicalMaterial
        transmission={1}
        thickness={colliderRadius / 2}
        roughness={0}
      />
    </Sphere>
  );
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      sSAOPass: any;
    }
  }
}
function Effects(props) {
  const { scene, camera } = useThree();
  return (
    <EffectComposer {...props}>
      <sSAOPass
        args={[scene, camera, 100, 100]}
        kernelRadius={1.2}
        kernelSize={0}
      />
    </EffectComposer>
  );
}

function getPosition({
  clientX,
  clientY,
  size,
  viewport,
}): [number, number, number] {
  const posX = (clientX * 2 - size.width) / size.width;
  const posY = -(clientY * 2 - size.height) / size.height;
  return [posX, posY, 0];
}
