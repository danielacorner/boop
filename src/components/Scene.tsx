/* eslint-disable react/no-unknown-property */
import {
  Sky,
  Environment,
  AdaptiveDpr,
  useDetectGPU,
  PerformanceMonitor,
  AdaptiveEvents,
} from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { D20StarComponent } from "./D20StarComponent";
import { FancyStars } from "./FancyStars";
import { useAtom } from "jotai";
import { Effects } from "./Effects";
import { useEffect, useMemo } from "react";
import { Clumpz } from "./Clump/Clumpz";
import { musicAtom } from "./UI/Music/Music";
import * as THREE from "three";
import { isCameraMovingAtom, usePositions } from "../store/store";
import { Collider } from "./Collider/Collider";
import {
  INITIAL_CAMERA_POSITION,
  MAX_DPR,
  MAX_DPR_BY_TIER,
  MIN_DPR,
  dprAtom,
} from "../utils/constants";

const Scene = () => {
  return (
    <>
      <AdaptDprManually />
      <MoveCamera />
      <AdaptiveDpr pixelated={true} />
      <AdaptiveEvents />
      <FancyStars />
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
      <Physics gravity={[0, 0, 0]} iterations={1}>
        <PhysicsScene />
      </Physics>
      <Environment files="/adamsbridge.hdr" />
      <Effects />
      {/* https://threejs.org/examples/webgl_shaders_sky.html */}
      <Sky turbidity={10} rayleigh={0} inclination={0.51} />
    </>
  );
};

export default Scene;

function PhysicsScene() {
  const { positions: positionsNormalized } = usePositions();

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
      <Collider />
      <D20StarComponent position={positions.d20} />
      {/* <MusicZoom /> */}
      <Clumpz {...{ positions }} />
      {/* </DebugInDev> */}
    </>
  );
}

function AdaptDprManually() {
  const { tier, fps } = useDetectGPU();
  const maxDpr = MAX_DPR_BY_TIER[tier] ?? MIN_DPR;
  const [, setDpr] = useAtom(dprAtom);
  useEffect(() => {
    setDpr(maxDpr);
    return () => {
      setDpr(MIN_DPR);
    };
  }, [fps, maxDpr, setDpr, tier]);
  useEffect(() => {
    console.log("⭐🎈  file: Scene.tsx:101  AdaptDprManually  fps:", fps);
  }, [fps]);
  return (
    <PerformanceMonitor
      onIncline={() => setDpr(MAX_DPR)}
      onDecline={() => setDpr(MIN_DPR)}
    />
  );
}

const DISTANCE = 20;
const CAMERA_SPIN_SPEED = 1;
function MoveCamera() {
  // move the camera in a circle when music is playing
  const [isCameraMoving] = useAtom(isCameraMovingAtom);
  const { camera } = useThree();
  const [{ bpm }] = useAtom(musicAtom);
  const speed = bpm * (CAMERA_SPIN_SPEED / 125);
  useFrame(({ clock }) => {
    if (isCameraMoving) {
      // animate the camera position smoothly
      const t = clock.getElapsedTime();
      const cycle = (t % 100) / CAMERA_SPIN_SPEED;
      const x = Math.cos(t * 0.33 * (speed + cycle / 100)) * DISTANCE;
      const y = Math.sin(t * 0.66 * (speed + cycle / 200)) * DISTANCE;
      const z = Math.sin(t * 0.99 * (speed + cycle / 300)) * DISTANCE;
      camera.position.lerp(new THREE.Vector3(x, y, z), 0.1);
      camera.lookAt(0, 0, 0);
    } else {
      camera.lookAt(0, 0, 0);
      // animate the camera from its current position back to the initial position using lerp
      camera.position.lerp(new THREE.Vector3(...INITIAL_CAMERA_POSITION), 0.1);
    }
  });

  return null;
}
