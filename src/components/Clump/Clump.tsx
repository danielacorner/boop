import { useMemo } from "react";
import * as THREE from "three";
import { BALL_RADIUS, BALL_MASS, COLORS } from "../../utils/constants";
import { IcoClump } from "./IcoClump";
import { SphereClump } from "./SphereClump";

export const WHITE_PIXEL = "/white_pixel.png";
const mat = new THREE.Matrix4();
const vec = new THREE.Vector3();

export function Clump({
  materialProps = {} as any,
  numNodes,
  texturePath = WHITE_PIXEL,
  roughnessMapPath = WHITE_PIXEL,
  normalMapPath = WHITE_PIXEL,
  aoMapPath = WHITE_PIXEL,
  bumpMapPath = WHITE_PIXEL,
  displacementMapPath = WHITE_PIXEL,
  position = null as [number, number, number] | null,
  coloredTexture = false,
  icosa = false,
  dodeca = false,
  radius = BALL_RADIUS,
  mass = BALL_MASS,
  CustomMaterial = undefined as ((props: any) => JSX.Element) | undefined,
  texture = null as null | THREE.Texture,
  roughnessMap = null as null | THREE.Texture,
  normalMap = null as null | THREE.Texture,
  aoMap = null as null | THREE.Texture,
  bumpMap = null as null | THREE.Texture,
  displacementMap = null as null | THREE.Texture,
}) {
  const colorArray = useMemo(
    () =>
      new Array(numNodes).fill(null).flatMap((_, i) => {
        const color = COLORS[i];
        return color;
      }),
    [numNodes]
  );
  const props = {
    radius,
    mass,
    numNodes,
    mat,
    position,
    vec,
    colorArray,
    materialProps,
    texturePath,
    coloredTexture,
    icosa,
    dodeca,
    texture,
    roughnessMap,
    roughnessMapPath,
    normalMapPath,
    normalMap,
    aoMapPath,
    aoMap,
    bumpMapPath,
    bumpMap,
    displacementMapPath,
    displacementMap,
    CustomMaterial,
  };
  return icosa || dodeca ? <IcoClump {...props} /> : <SphereClump {...props} />;
}
