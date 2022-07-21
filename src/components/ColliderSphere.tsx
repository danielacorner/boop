import { Sphere, useDetectGPU } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { useEffect, useRef } from "react";
import { useEventListener, getPosition } from "../utils/hooks";

export function ColliderSphere() {
  const { viewport, size } = useThree();

  const gpu = useDetectGPU();
  const colliderRadius = gpu.tier > 2 ? 3 : 2;
  const [ref, api] = useSphere<any>(() => ({
    type: "Kinematic",
    args: [colliderRadius],
    position: [0, 0, 0],
  }));
  // subscribe to sphere position
  const position = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((v) => (position.current = v)), [api]);

  const touchingRef = useRef<[number, number, number] | null>(null);
  useFrame((state) => {
    const nextX =
      ((touchingRef.current?.[0] ?? state.pointer.x) * viewport.width) / 2;
    const nextY =
      ((touchingRef.current?.[1] ?? state.pointer.y) * viewport.height) / 2;
    const nextXL = THREE.MathUtils.lerp(position.current[0], nextX, 0.24);
    const nextYL = THREE.MathUtils.lerp(position.current[1], nextY, 0.24);
    return api.position.set(nextXL, nextYL, 0);
  });

  useEventListener("touchmove", (event) => {
    touchingRef.current = getPosition({
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
      size,
      viewport,
    });
  });

  useEventListener("click", (event) => {
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });
  useEventListener("mousemove", (event) => {
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });

  return (
    <Sphere ref={ref} args={[colliderRadius, 32, 32]}>
      <meshPhysicalMaterial
        transmission={1}
        thickness={colliderRadius / 2}
        roughness={0}
      />
    </Sphere>
  );
}
