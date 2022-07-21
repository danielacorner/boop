import { useEffect } from "react";

export function useAddShadowsToGltf(ref) {
  useEffect(() => {
    ref.current?.traverse((object) => {
      object.depthTest = true;
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
