import { atom, useAtom } from "jotai";
import { useCallback } from "react";

const shapeAtom = atom<"sphere" | "icosa" | "dodeca" | "octa" | "none" | "box">(
  "sphere"
);
export function useShape() {
  return useAtom(shapeAtom);
}
export function useChangeShape() {
  const [shape, setShape] = useShape();
  return useCallback(() => {
    switch (shape) {
      case "sphere":
        setShape("icosa");
        break;
      case "icosa":
        setShape("dodeca");
        break;
      case "dodeca":
        setShape("octa");
        break;
      case "octa":
        setShape("box");
        break;
      case "box":
        setShape("none");
        break;
      case "none":
        setShape("sphere");
        break;
    }
  }, [setShape, shape]);
}
