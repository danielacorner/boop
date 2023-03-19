import { useRef } from "react";
import { useEventListener } from "../../utils/hooks";

export function useIsTabActive() {
  const isTabActive = useRef(true);
  useEventListener("visibilitychange", () => {
    if (document.hidden) {
      console.log("not visible");
      isTabActive.current = false;
    } else {
      console.log("is visible");
      isTabActive.current = true;
    }
  });
  return isTabActive;
}
