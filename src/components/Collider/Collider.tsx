import { ColliderBox } from "./ColliderBox";
import { ColliderIcosa } from "./ColliderIcosa";
import { ColliderSphere } from "./ColliderSphere";
import { useShape } from "./useShape";

export function Collider() {
  const [shape] = useShape();
  return shape === "sphere" ? (
    <ColliderSphere />
  ) : shape === "icosa" ? (
    <ColliderIcosa />
  ) : shape === "box" ? (
    <ColliderBox />
  ) : shape === "none" ? null : null; // <ColliderInvisible />
}
