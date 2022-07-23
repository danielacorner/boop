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

extend({ SSAOPass });

export const Scene = () => {
  const { tier } = useDetectGPU();
  const maxDpr = tier > 2 ? 2 : tier > 1 ? 0.8 : tier > 0 ? 0.8 : 0.6;
  return (
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
  const num = gpu.tier > 2 ? 10 : 8;
  // const { xyz } = useControls({ xyz: 1 });
  const clumps = (
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
      />
      {/* glassy textured */}
      <Clump
        texturePath={"ball_galaxy.jpg"}
        coloredTexture={true}
        numNodes={num * 0.5}
        materialProps={{
          roughness: 0,
          emissive: "#230000",
          metalness: 3,
          envMapIntensity: 2,
          transmission: 0.7,
          thickness: BALL_RADIUS * 75,
        }}
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
      />
      {/* colored cell */}
      <Clump
        texturePath={"ball_cell.jpg"}
        // normalMapPath={"planet_normal_sm.png"}
        // roughnessMapPath={"roughness_map.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0.9,
          envMapIntensity: 4.2,
          transmission: 0,
          thickness: BALL_RADIUS,
        }}
        coloredTexture={true}
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
          thickness: BALL_RADIUS,
        }}
        radius={BALL_RADIUS * 1.2}
      />
    </>
  );
  return (
    <>
      {/* <DebugInDev> */}
      <ColliderSphere />
      <D20StarComponent />
      {clumps}
      <MusicZoom />
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
