import {
  Sky,
  Environment,
  useDetectGPU,
  AdaptiveDpr,
  OrbitControls,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Debug, Physics } from "@react-three/cannon";
import { D20StarComponent } from "./D20StarComponent";
import { Clump } from "./Clump/Clump";
import { ColliderSphere } from "./ColliderSphere";
import {
  BALL_MASS,
  BALL_RADIUS,
  POSITIONS,
  positionsAtom,
} from "../utils/constants";
import { FancyStars } from "./FancyStars";
import { useAtom } from "jotai";
import { Effects } from "./Effects";

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import glsl from "glslify";
import * as THREE from "three";
import { useMemo } from "react";

// add colorShiftMaterial to global jsx namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      colorShiftMaterial: any;
    }
  }
}

const ColorShiftMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color(0.2, 0.0, 0.1) },
  // vertex shader
  glsl`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  glsl`
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      gl_FragColor.rgba = vec4(0.5 + 0.3 * sin(vUv.yxx + time) + color, 1.0);
    }
  `
);

extend({ ColorShiftMaterial });

export const Scene = () => {
  const { tier } = useDetectGPU();
  const maxDpr = tier > 2 ? 2 : tier > 1 ? 0.8 : tier > 0 ? 0.8 : 0.6;
  return (
    <>
      <Canvas
        style={{ position: "fixed", inset: 0 }}
        shadows
        dpr={[1, maxDpr]}
        camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 60 }}
        // https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance
        performance={{ min: 0.75, max: 1 }}
        // gl={{ alpha: true, antialias: true }}
      >
        <OrbitControls
          enablePan={false}
          enableRotate={false}
          enableZoom={true}
          // minAzimuthAngle={0}
          // maxAzimuthAngle={0}
          // minPolarAngle={Math.PI / 2}
          // maxPolarAngle={Math.PI / 2}
          // minZoom={0}
          // maxZoom={0}
          minDistance={2}
          maxDistance={32}
        />
        <AdaptiveDpr pixelated />
        <FancyStars />
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
        <Physics gravity={[0, 0, 0]} iterations={10}>
          <PhysicsScene />
        </Physics>
        <Environment files="/adamsbridge.hdr" />
        <Effects />
        {/* https://threejs.org/examples/webgl_shaders_sky.html */}
        <Sky turbidity={10} rayleigh={0} inclination={0.51} />
      </Canvas>
    </>
  );
};
function DebugInDev({ children }) {
  return process.env.NODE_ENV === "development" ? (
    <Debug>{children}</Debug>
  ) : (
    <>{children}</>
  );
}

function PhysicsScene() {
  const [positionsNormalized] = useAtom(positionsAtom);

  const { viewport } = useThree();
  const positions = useMemo(
    () =>
      Object.entries(positionsNormalized).reduce((acc, [key, [x, y, z]]) => {
        acc[key] = [x * viewport.width * 0.33, y * viewport.height * 0.33, z];
        return acc;
      }, {} as { [key: string]: [number, number, number] }),
    [positionsNormalized, viewport.height, viewport.width]
  );
  return (
    <>
      {/* <DebugInDev> */}
      <ColliderSphere />
      <D20StarComponent position={positions.d20} />
      {/* <MusicZoom /> */}
      <Clumpz {...{ positions }} />
      {/* </DebugInDev> */}
    </>
  );
}
function Clumpz({ positions }) {
  const expanded = positions.dodeca[0] !== POSITIONS.initial.dodeca[0];
  const gpu = useDetectGPU();
  const num = gpu.tier > 2 ? 10 : 8;
  return (
    <>
      {/* shader galaxy */}
      <Clump
        texturePath={"ball_galaxy.jpg"}
        coloredTexture={true}
        numNodes={num * 1}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0.1,
          envMapIntensity: 3,
          transmission: 0,
        }}
        position={positions.galaxy}
        // CustomMaterial={(p) => <colorShiftMaterial {...p} />}
      />
      {/* galaxy */}
      <Clump
        texturePath={"ball_galaxy.jpg"}
        numNodes={num * 0.5}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0.1,
          envMapIntensity: 3,
          transmission: 0,
        }}
        position={positions.galaxy}
      />

      {/* earth */}
      <Clump
        texturePath={"ball_earth.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 4,
          transmission: 0,
        }}
        radius={BALL_RADIUS * 1.4 * (expanded ? 0.6 : 1)}
        mass={BALL_MASS * 1.4 * 2}
        position={positions.earth}
      />
      {/* moon */}
      <Clump
        texturePath={"ball_moon.jpg"}
        normalMapPath={"planet_normal.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0.9,
          emissive: null,
          metalness: 0.2,
          envMapIntensity: 3,
          transmission: 0,
        }}
        radius={
          BALL_RADIUS *
          1.2 *
          // shrink when it's alone with the earth
          (!expanded ? 1 : 0.25)
        }
        mass={BALL_MASS * 2}
        position={positions.moon}
      />
      {/* jupiter */}
      <Clump
        texturePath={"ball_jupiter.jpg"}
        normalMapPath={"planet_normal.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0.6,
          emissive: null,
          metalness: 0.1,
          envMapIntensity: 1.5,
          transmission: 0,
        }}
        radius={BALL_RADIUS * 1.8 * (expanded ? 1.5 : 1)}
        mass={BALL_MASS * 1.8 * 2}
        position={positions.jupiter}
      />
      {/* sun */}
      <Clump
        texturePath={"ball_sun.jpg"}
        // normalMapPath={"wavy-normal.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0.5,
          emissive: "#c04b14",
          metalness: 0.1,
          envMapIntensity: 4,
          transmission: 0,
        }}
        radius={BALL_RADIUS * 2.4 * (expanded ? 8 : 1)}
        mass={BALL_MASS * 2.4 * 2}
        position={positions.sun}
      />
      {/* colored cell */}
      <Clump
        texturePath={"ball_cell.jpg"}
        // normalMapPath={"planet_normal_sm.png"}
        // roughnessMapPath={"roughness_map.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0.7,
          emissive: null,
          metalness: 0.9,
          envMapIntensity: 4.2,
          transmission: 0,
          thickness: BALL_RADIUS,
        }}
        coloredTexture={true}
        position={positions.cell}
      />
      {/* glassy */}
      <Clump
        numNodes={num / 2}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 0,
          transmission: 1,
          thickness: BALL_RADIUS * 7,
        }}
        radius={BALL_RADIUS}
        position={positions.glass}
      />

      {/* shiny starry night */}
      <Clump
        texturePath={"ball_vangogh.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0,
          metalness: 0.7,
          envMapIntensity: 10,
          transmission: 0,
        }}
        radius={BALL_RADIUS}
        position={positions.starry_night_shiny}
      />
      {/* starry night */}
      <Clump
        texturePath={"ball_vangogh.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 1,
          emissive: null,
          metalness: 0,
          envMapIntensity: 4,
          transmission: 0,
        }}
        position={positions.starry_night}
      />
      {/* marble */}
      <Clump
        coloredTexture={true}
        texturePath={"marble/marble_big.jpg"}
        // normalMapPath={"marble/marble_normal.jpg"}
        // displacementMapPath={"marble/marble_displacement.jpg"}
        // aoMapPath={"marble/marble_spec.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0.35,
          envMapIntensity: 2,
          transmission: 0,
        }}
        position={positions.marble}
      />
      {/* shiny icosahedron */}
      <Clump
        icosa={true}
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 5,
          transmission: 1,
          thickness: BALL_RADIUS,
        }}
        radius={BALL_RADIUS * 1.2}
        mass={BALL_MASS * 1.2}
        position={positions.icosa}
      />
      {/* shiny dodecaahedron */}
      <Clump
        dodeca={true}
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 5,
          transmission: 1,
          thickness: BALL_RADIUS * 1.2,
        }}
        radius={BALL_RADIUS * 1.2}
        mass={BALL_MASS}
        position={positions.dodeca}
      />
    </>
  );
}
