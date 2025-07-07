import { Loader } from "@react-three/drei";
import { Music } from "./components/UI/Music/Music";
import { TrackDoubleClick } from "./TrackDoubleClick";
import Scene from "./components/Scene";
import { ControlsOverlay } from "./ControlsOverlay";
import { DeviceOrientationButton } from "./components/UI/DeviceOrientationButton";
import { INITIAL_CAMERA_POSITION, MAX_DPR, dprAtom } from "./utils/constants";
import { Canvas } from "@react-three/fiber";
import { useAtom } from "jotai";
import { GeometryControls } from "./components/UI/GeometryControls";
import { GeometryProvider } from "./context/GeometryContext";
import { DepthProvider } from "./context/DepthContext";
import { RotationProvider } from "./context/RotationContext";
import { DepthSlider } from "./components/UI/DepthSlider";
import { RotationSlider } from "./components/UI/RotationSlider";

export function Fidget2() {
  const [dpr] = useAtom(dprAtom);

  return (
    <GeometryProvider>
      <DepthProvider>
        <RotationProvider>
        {/* Control Panel Container */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '0px',
          left: '0px',
          margin: '0 auto',
          width: '320px', // Reduced width
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          padding: '6px 8px', // Further reduced padding
          color: 'white',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          zIndex: 1000
        }}>
          <div style={{marginBottom: '5px'}}>
            <GeometryControls />
          </div>
          <div style={{ 
            height: '1px', 
            background: 'rgba(255,255,255,0.15)', 
            margin: '6px 0' 
          }}></div>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <DepthSlider />
            <RotationSlider />
          </div>
        </div>
      <Loader />
      {/* <div style={{ 
        position: "absolute", 
        top: "10px", 
        left: "10px", 
        background: "rgba(0,0,0,0.4)", 
        color: "white", 
        padding: "5px 10px", 
        borderRadius: "5px",
        zIndex: 1000
      }}>
        Fidget 2
      </div> */}
      <Canvas
        shadows={dpr === MAX_DPR}
        style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, #4a3b78 0%, #8774b5 100%)" }}
        dpr={[0.4, dpr]}
        camera={{
          position: INITIAL_CAMERA_POSITION,
          fov: 35,
          near: 1,
          far: 60,
        }}
        performance={{ min: 1, max: 1 }}
      >
        <Scene />
      </Canvas>
      <Music />
      <ControlsOverlay />
      <DeviceOrientationButton />
      <TrackDoubleClick />
      </RotationProvider>
      </DepthProvider>
    </GeometryProvider>
  );
}
