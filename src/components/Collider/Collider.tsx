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
  // Get the geometry type from the GeometryContext
  const { geometryType } = useGeometry();
  
  // Map the full geometry type names to the appropriate components
  return (
    <>
      {geometryType === "sphere" && <ColliderSphere />}
      {geometryType === "icosahedron" && <ColliderIcosa />}
      {geometryType === "dodecahedron" && <ColliderDodeca />}
      {geometryType === "octahedron" && <ColliderOcta />}
      {geometryType === "box" && <ColliderBox />}
      {geometryType === "none" && <ColliderInvisible />}
      {/* Tetrahedron now has its own specialized component with proper physics */}
      {geometryType === "tetrahedron" && <ColliderTetra />}
      {/* Tetrahedron star now has its own specialized component with compound collision body */}
      {geometryType === "tetrahedron_star" && <ColliderTetraStar />}
    </>
  );
}
