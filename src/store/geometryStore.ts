import { atom } from "jotai";

export type GeometryType = "sphere" | "dodecahedron" | "icosahedron" | "box" | "tetrahedron" | "octahedron";

export const geometryTypeAtom = atom<GeometryType>("dodecahedron");
