import { ColliderBox } from "./ColliderShapes/ColliderBox";
import { ColliderDodeca } from "./ColliderShapes/ColliderDodeca";
import { ColliderIcosa } from "./ColliderShapes/ColliderIcosa";
import { ColliderInvisible } from "./ColliderShapes/ColliderInvisible";
import { ColliderOcta } from "./ColliderShapes/ColliderOcta";
import { ColliderSphere } from "./ColliderShapes/ColliderSphere";
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
      {/* Tetrahedron and other shapes can use ColliderSphere which now renders the correct geometry */}
      {(geometryType === "tetrahedron" || geometryType === "tetrahedron_star") && <ColliderSphere />}
    </>
  );
}
