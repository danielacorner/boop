import { ColliderBox } from "./ColliderShapes/ColliderBox";
import { ColliderDodeca } from "./ColliderShapes/ColliderDodeca";
import { ColliderIcosa } from "./ColliderShapes/ColliderIcosa";
import { ColliderInvisible } from "./ColliderShapes/ColliderInvisible";
import { ColliderOcta } from "./ColliderShapes/ColliderOcta";
import { ColliderSphere } from "./ColliderShapes/ColliderSphere";
import { ColliderTetraStar } from "./ColliderShapes/ColliderTetraStar";
import { ColliderTetra } from "./ColliderShapes/ColliderTetra";
// Use GeometryContext instead of the older useShape hook
import { useGeometry } from "../../context/GeometryContext";
import { GeometryProvider } from "../../context/GeometryContext";

export function Collider() {
  // Use optional chaining to safely access geometryType
  const geometry = useGeometry();
  const geometryType = geometry?.geometryType || "sphere";
  
  return (
    <>
      {geometryType === "sphere" && <ColliderSphere geometryType={geometryType} />}
      {geometryType === "dodecahedron" && <ColliderDodeca geometryType={geometryType} />}
      {geometryType === "icosahedron" && <ColliderIcosa geometryType={geometryType} />}
      {geometryType === "octahedron" && <ColliderOcta geometryType={geometryType} />}
      {geometryType === "box" && <ColliderBox geometryType={geometryType} />}
      {geometryType === "none" && <ColliderInvisible />}
      {/* Tetrahedron now has its own specialized component with proper physics */}
      {geometryType === "tetrahedron" && <ColliderTetra geometryType={geometryType} />}
      {/* Tetrahedron star now has its own specialized component with compound collision body */}
      {geometryType === "tetrahedron_star" && <ColliderTetraStar geometryType={geometryType} />}
    </>
  );
}
