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
import { D20StarComponent } from "./components/D20StarComponent";
import { Clump } from "./components/Clump";
import { ColliderSphere } from "./components/ColliderSphere";
import { BALL_RADIUS } from "./utils/constants";

extend({ SSAOPass });

export const LotteryMachine = () => {
  const { tier } = useDetectGPU();
  const maxDpr = tier > 2 ? 2 : tier > 1 ? 1 : tier > 0 ? 0.8 : 0.6;
  return (
    <Canvas
      style={{ position: "fixed", inset: 0 }}
      shadows
      dpr={[1, maxDpr]}
      camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
      performance={{ min: 1 }}
      // gl={{ alpha: false, antialias: false }}
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
  );
};
function DebugInDev({ children }) {
  return process.env.NODE_ENV === "development" ? (
    <Debug>{children}</Debug>
  ) : (
    <>{children}</>
  );
}

// const tempObject = new THREE.Object3D();
// const tempColor = new THREE.Color();

function PhysicsScene() {
  const gpu = useDetectGPU();
  const num = gpu.tier > 2 ? 12 : 10;
  const clumps = (
    <>
      <Clump
        texturePath={"ball_vangogh.jpg"}
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
      {/* glassy starry night */}
      <Clump
        texturePath={"ball_vangogh.jpg"}
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
      {/* glassy */}
      <Clump
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 0,
          transmission: 1,
          thickness: BALL_RADIUS * 7,
        }}
        radius={BALL_RADIUS}
      />
      {/* galaxy */}
      {/* <Clump
        texturePath={"ball_galaxy.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0.1,
          envMapIntensity: 3,
          transmission: 0,
        }}
      /> */}
      {/* shiny starry night */}
      <Clump
        texturePath={"ball_vangogh.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0,
          metalness: 1,
          envMapIntensity: 10,
          transmission: 0,
        }}
        radius={BALL_RADIUS}
      />
      {/* starry night */}
      <Clump
        texturePath={"ball_vangogh.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 3,
          transmission: 0,
        }}
      />
      {/* jupiter */}
      <Clump
        texturePath={"ball_jupiter.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0.6,
          emissive: null,
          metalness: 0.1,
          envMapIntensity: 1.5,
          transmission: 0,
        }}
        radius={BALL_RADIUS * 1.6}
      />
      {/* moon */}
      <Clump
        texturePath={"ball_moon.jpg"}
        numNodes={3}
        materialProps={{
          roughness: 0.9,
          emissive: null,
          metalness: 0.2,
          envMapIntensity: 3,
          transmission: 0,
        }}
        radius={BALL_RADIUS}
      />
      {/* sun */}
      <Clump
        texturePath={"ball_sun.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0.5,
          emissive: "#c04b14",
          metalness: 0.1,
          envMapIntensity: 5,
          transmission: 0,
        }}
        radius={BALL_RADIUS * 2.4}
      />
      {/* earth */}
      <Clump
        texturePath={"ball_earth.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 4,
          transmission: 0,
        }}
      />
    </>
  );
  return (
    <>
      {/* <DebugInDev> */}
      <ColliderSphere />
      <D20StarComponent />
      {clumps}
      {/* glassy starry night */}
      {/* </DebugInDev> */}
    </>
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
