/* eslint-disable react/no-unknown-property */
import { Sky, Environment, useDetectGPU, AdaptiveDpr } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { D20StarComponent } from "./D20StarComponent";
import { ColliderSphere } from "./ColliderSphere";
import { positionsAtom } from "../utils/constants";
import { FancyStars } from "./FancyStars";
import { useAtom } from "jotai";
import { Effects } from "./Effects";
import { useMemo } from "react";
import { Clumpz } from "./Clump/Clumpz";
import { useWhyDidYouUpdate } from "../utils/useWhyDidYouUpdate";
// import { RGBELoader } from "three-stdlib";
// import Diamond from "./Diamond";
// import { Clumpz } from "./Clumpz";

// add colorShiftMaterial to global jsx namespace
// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace JSX {
//     interface IntrinsicElements {
//       colorShiftMaterial: any;
//     }
//   }
// }

// const ColorShiftMaterial = shaderMaterial(
//   { time: 0, color: new THREE.Color(0.2, 0.0, 0.1) },
//   // vertex shader
//   glsl`
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `,
//   // fragment shader
//   glsl`
//     uniform float time;
//     uniform vec3 color;
//     varying vec2 vUv;
//     void main() {
//       gl_FragColor.rgba = vec4(0.5 + 0.3 * sin(vUv.yxx + time) + color, 1.0);
//     }
//   `
// );

// extend({ ColorShiftMaterial });

const MIN_DPR = 0.6;
const MAX_DPR = 0.8;
const MAX_DPR_BY_TIER = {
  "0": MIN_DPR,
  "1": MAX_DPR,
  "2": MAX_DPR,
  "3": MAX_DPR,
};

export const Scene = () => {
  const { tier } = useDetectGPU();
  const maxDpr = MAX_DPR_BY_TIER[tier] ?? MIN_DPR;
  // const [dpr, setDpr] = useState(maxDpr);
  return (
    <>
      <Canvas
        frameloop="demand"
        style={{ position: "fixed", inset: 0 }}
        shadows
        dpr={[1, maxDpr]}
        camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 60 }}
        performance={{ min: 0.75 }}
        // https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance
        // performance={{ min: 0.75, max: 1 }}
        // gl={{ alpha: true, antialias: true }}
      >
        {/* <PerformanceMonitor
        // onIncline={() => setDpr(0.6)}
        // onDecline={() => setDpr(0.4)}
        // onChange={({ factor }) =>
        //   setDpr(Math.round((0.5 + 1.5 * factor) * 10) / 10)
        // }
        /> */}
        {/* <OrbitControls
          enablePan={process.env.NODE_ENV === "development"}
          enableRotate={process.env.NODE_ENV === "development"}
          enableZoom={true}
          // minAzimuthAngle={0}
          // maxAzimuthAngle={0}
          // minPolarAngle={Math.PI / 2}
          // maxPolarAngle={Math.PI / 2}
          // minZoom={0}
          // maxZoom={0}
          minDistance={2}
          maxDistance={32}
        /> */}
        <AdaptiveDpr pixelated={true} />
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
      </Canvas>
    </>
  );
};
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
  useWhyDidYouUpdate("PhysicsScene", {
    positions,
    viewport,
    positionsNormalized,
  });
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
