import { atom, useAtom } from "jotai";
import { useEventListener } from "../../utils/hooks";

const shapeAtom = atom<"sphere" | "icosa" | "none" | "box">("sphere");
export function useShape() {
  return useAtom(shapeAtom);
}
export function useChangeShape(shape: string, setShape) {
  useEventListener("dblclick", () => {
    switch (shape) {
      case "sphere":
        setShape("icosa");
        break;
      case "icosa":
        setShape("box");
        break;
      case "box":
        setShape("none");
        break;
      case "none":
        setShape("sphere");
        break;
    }
  });
}
