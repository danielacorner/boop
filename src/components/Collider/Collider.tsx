import { ColliderBox } from "./ColliderShapes/ColliderBox";
import { ColliderDodeca } from "./ColliderShapes/ColliderDodeca";
import { ColliderIcosa } from "./ColliderShapes/ColliderIcosa";
import { ColliderInvisible } from "./ColliderShapes/ColliderInvisible";
import { ColliderOcta } from "./ColliderShapes/ColliderOcta";
import { ColliderSphere } from "./ColliderShapes/ColliderSphere";
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
