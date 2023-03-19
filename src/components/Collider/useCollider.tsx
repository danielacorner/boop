import { useDetectGPU } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { musicAtom } from "../UI/Music/Music";
import { usePositions } from "../../store/store";
import { COLLIDER_RADIUS } from "./ColliderIcosa";

export function useCollider() {
  const { size } = useThree();
  const [{ autoMode }] = useAtom(musicAtom);
  const gpu = useDetectGPU();
  const { isExpanded } = usePositions();
  const colliderRadiusMultiplier =
    (isExpanded ? 0.8 : 1) *
    (size.width > 720 ? 1.2 : 1) *
    (autoMode ? 1.4 : 1) *
    (1 + gpu.tier * 0.1);
  const colliderRadius = colliderRadiusMultiplier * COLLIDER_RADIUS;
  return { colliderRadius, colliderRadiusMultiplier };
}
