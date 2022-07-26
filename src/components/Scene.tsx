import {
  Sky,
  Environment,
  Effects as EffectComposer,
  useDetectGPU,
  AdaptiveDpr,
  OrbitControls,
} from "@react-three/drei";
import { Canvas, extend, useThree } from "@react-three/fiber";
import { Debug, Physics } from "@react-three/cannon";
import { SSAOPass } from "three-stdlib";
import { D20StarComponent } from "./D20StarComponent";
import { Clump } from "./Clump";
import { ColliderSphere } from "./ColliderSphere";
import { BALL_MASS, BALL_RADIUS } from "../utils/constants";
import { MusicZoom } from "./MusicZoom";
import { FancyStars } from "./FancyStars";
import { useState } from "react";
import { IconButton } from "@mui/material";
import { Apps, ZoomInMap, ZoomOutMap } from "@mui/icons-material";
import styled from "styled-components";
import { atom, useAtom } from "jotai";

extend({ SSAOPass });

export const Scene = () => {
  const { tier } = useDetectGPU();
  const maxDpr = tier > 2 ? 2 : tier > 1 ? 0.8 : tier > 0 ? 0.8 : 0.6;
  return (
    <>
      <SpreadOutButton />
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
/** positions in the range [-1, 1] - will get multiplied by viewport width/height */
const INITIAL_POSITIONS: { [key: string]: [number, number, number] } = {
  galaxy: [0, 0, 0],
  earth: [0, 0, 0],
  moon: [0, 0, 0],
  jupiter: [0, 0, 0],
  sun: [0, 0, 0],
  cell: [0, 0, 0],
  glass: [0, 0, 0],
  starry_night_shiny: [0, 0, 0],
  starry_night: [0, 0, 0],
  marble: [0, 0, 0],
  icosa: [0, 0, 0],
  dodeca: [0, 0, 0],
};
const SECONDARY_POSITIONS: { [key: string]: [number, number, number] } = {
  galaxy: [1, 1, 0],
  earth: [0, 0, 0],
  moon: [1, 0, 0],
  jupiter: [-1, 1, 0],
  sun: [0, 1, 0],
  cell: [1, 0, 0],
  glass: [1, 0, 0],
  starry_night_shiny: [-1, -1, 0],
  starry_night: [1, -1, 0],
  marble: [0, -1, 0],
  icosa: [-1, 0, 0],
  dodeca: [-1, 0, 0],
};
const positionsAtom = atom(INITIAL_POSITIONS);
function PhysicsScene() {
  const gpu = useDetectGPU();
  const num = gpu.tier > 2 ? 10 : 8;
  const [positionsNormalized] = useAtom(positionsAtom);
  const { size, viewport } = useThree();
  const positions = Object.entries(positionsNormalized).reduce(
    (acc, [key, [x, y, z]]) => {
      acc[key] = [x * viewport.width * 0.33, y * viewport.height * 0.33, z];
      return acc;
    },
    {} as { [key: string]: [number, number, number] }
  );

  return (
    <>
      {/* <DebugInDev> */}
      <ColliderSphere />
      <D20StarComponent />
      <MusicZoom />

      <>
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
          radius={BALL_RADIUS * 1.4}
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
          radius={BALL_RADIUS * 1.2}
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
          radius={BALL_RADIUS * 1.8}
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
          radius={BALL_RADIUS * 2.4}
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
      {/* </DebugInDev> */}
    </>
  );
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      sSAOPass: any;
      marquee: any;
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

function SpreadOutButton() {
  const [positions, setPositions] = useAtom(positionsAtom);

  return (
    <StyledIconButton
      onClick={() => {
        setPositions(
          positions.dodeca === INITIAL_POSITIONS.dodeca
            ? SECONDARY_POSITIONS
            : INITIAL_POSITIONS
        );
      }}
    >
      {positions.dodeca === INITIAL_POSITIONS.dodeca ? (
        <ZoomInMap />
      ) : (
        <ZoomOutMap />
      )}
    </StyledIconButton>
  );
}
const StyledIconButton = styled(IconButton)`
  &&&& {
    opacity: 0.4;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1;
    svg {
      color: white;
    }
  }
`;
