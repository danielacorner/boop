import { ColliderBox } from "./ColliderBox";
import { ColliderDodeca } from "./ColliderDodeca";
import { ColliderIcosa } from "./ColliderIcosa";
import { ColliderInvisible } from "./ColliderInvisible";
import { ColliderOcta } from "./ColliderOcta";
import { ColliderSphere } from "./ColliderSphere";
import { useShape } from "./useShape";

export function Collider() {
  const [shape] = useShape();
  return shape === "sphere" ? (
    <ColliderSphere />
  ) : shape === "icosa" ? (
    <ColliderIcosa />
  ) : shape === "dodeca" ? (
    <ColliderDodeca />
  ) : shape === "octa" ? (
    <ColliderOcta />
  ) : shape === "box" ? (
    <ColliderBox />
  ) : shape === "none" ? (
    <ColliderInvisible />
  ) : null;
}
