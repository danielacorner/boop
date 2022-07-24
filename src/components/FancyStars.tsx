import { Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

export function FancyStars() {
  const { viewport } = useThree();

  const maxViewport = Math.max(viewport.width, viewport.height);

  const ref = useRef(null as any);
  useFrame((state) => {
    ref.current.position.set(
      state.camera.position.x,
      state.camera.position.y,
      state.camera.position.z
    );
  });
  return (
    <Stars
      ref={ref}
      count={(viewport.width > 8 ? 12000 : 10000) * 1.5}
      depth={5}
      factor={0.4}
      radius={maxViewport * (maxViewport > 16 ? 0.5 : 0.7)}
      fade={true}
    />
  );
}
