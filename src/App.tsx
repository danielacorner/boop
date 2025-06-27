import { Loader } from "@react-three/drei";
// import SceneOffscreen from "./components/SceneOffscreen";
import { Music } from "./components/UI/Music/Music";
import { TrackDoubleClick } from "./TrackDoubleClick";
import Scene from "./components/Scene";
import { ControlsOverlay } from "./ControlsOverlay";
import { DeviceOrientationButton } from "./components/UI/DeviceOrientationButton";
import { INITIAL_CAMERA_POSITION, MAX_DPR, dprAtom } from "./utils/constants";
import { Canvas } from "@react-three/fiber";
import { useAtom } from "jotai";

function App() {
  const [dpr] = useAtom(dprAtom);

  return (
    <>
      <Loader />
      {/* <SceneOffscreen /> */}
      <Canvas
        // worker={worker}
        // fallback={<Scene />}
        shadows={dpr === MAX_DPR}
        // frameloop="demand"
        style={{ position: "fixed", inset: 0 }}
        dpr={[0.4, dpr]}
        camera={{
          position: INITIAL_CAMERA_POSITION,
          fov: 35,
          near: 1,
          far: 60,
        }}
        // performance={{ min: 0.75 }}
        // https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance
        performance={{ min: 1, max: 1 }}
        // gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
      <Music />
      <ControlsOverlay />
      <DeviceOrientationButton />
      <TrackDoubleClick />
    </>
  );
}

export default App;
