/* eslint-disable react/no-unknown-property */
import { Canvas } from "@react-three/offscreen";
import { lazy } from "react";
import { INITIAL_CAMERA_POSITION, dprAtom } from "../utils/constants";
import { useAtom } from "jotai";

// This is the fallback component that will be rendered on the main thread
// This will happen on systems where OffscreenCanvas is not supported
const Scene = lazy(() => import("./Scene"));

// This is the worker thread that will render the scene
const worker = new Worker(new URL("./worker.jsx", import.meta.url), {
  type: "module",
});

export const SceneOffscreen = () => {
  const [dpr] = useAtom(dprAtom);
  return (
    <>
      <Canvas
        worker={worker}
        fallback={<Scene />}
        shadows
        frameloop="demand"
        style={{ position: "fixed", inset: 0 }}
        dpr={[1, dpr]}
        camera={{
          position: INITIAL_CAMERA_POSITION,
          fov: 35,
          near: 1,
          far: 60,
        }}
        // performance={{ min: 0.75 }}
        // https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance
        performance={{ min: 0.75, max: 1 }}
        // gl={{ alpha: true, antialias: true }}
      />
    </>
  );
};
