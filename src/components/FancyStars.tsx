import { Stars } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export function FancyStars() {
  const { viewport } = useThree();

  const maxViewport = Math.max(viewport.width, viewport.height);

  return (
    <Stars
      count={viewport.width > 8 ? 12000 : 10000}
      depth={3}
      factor={0.5}
      radius={maxViewport * (maxViewport > 16 ? 0.5 : 0.7)}
      fade={true}
    />
  );
}
