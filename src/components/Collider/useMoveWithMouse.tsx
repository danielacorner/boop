import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { useEventListener, getPosition } from "../../utils/hooks";
import { useAtom } from "jotai";
import { musicAtom } from "../UI/Music/Music";
import { COLLIDER_LERP_SPEED } from "../../utils/constants";

export function useMoveWithMouse({
  isTabActive,
  position,
  api,
  shouldLerpRef,
  depth = 0, // Add depth parameter with default value of 0
}) {
  const touchingRef = useRef<[number, number, number] | null>(null);

  const { viewport, size } = useThree();
  const [{ autoMode }] = useAtom(musicAtom);

  useFrame((state) => {
    if (autoMode || !isTabActive.current) {
      return;
    }
    const nextX =
      ((touchingRef.current?.[0] ?? state.get().pointer.x) * viewport.width) /
      2;
    const nextY =
      ((touchingRef.current?.[1] ?? state.get().pointer.y) * viewport.height) /
      2;
    const nextXL = THREE.MathUtils.lerp(
      position.current[0],
      nextX,
      COLLIDER_LERP_SPEED
    );
    const nextYL = THREE.MathUtils.lerp(
      position.current[1],
      nextY,
      COLLIDER_LERP_SPEED
    );
    return api.position.set(
      shouldLerpRef.current ? nextXL : nextX,
      shouldLerpRef.current ? nextYL : nextY,
      depth // Use depth parameter instead of hardcoded 0
    );
  });

  useEventListener("touchmove", (event) => {
    shouldLerpRef.current = false;
    // performance.regress();
    touchingRef.current = getPosition({
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
      size,
      viewport,
    });
  });

  useEventListener("click", (event) => {
    shouldLerpRef.current = true;
    // performance.regress();
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });
  useEventListener("mousemove", (event) => {
    shouldLerpRef.current = false;
    // performance.regress();
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });
  return isTabActive;
}
