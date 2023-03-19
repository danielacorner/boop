import { useDetectGPU, useTexture } from "@react-three/drei";
import { Clump } from "./Clump";
import { BALL_MASS, BALL_RADIUS } from "../../utils/constants";
import { usePositions } from "../../store/store";

export function Clumpz({ positions }) {
  const { isExpanded } = usePositions();
  const gpu = useDetectGPU();
  // const num = 2;
  const num = 6 + 4 * gpu.tier;

  // const texture = useLoader(
  //   RGBELoader as any,
  //   "/textures/royal_esplanade_1k.hdr"
  // );
  // const texture = useLoader(
  //   RGBELoader as any,
  //   "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr"
  // );
  const ballGalaxyTexture = useTexture("ball_galaxy.jpg");
  const ballEarthTexture = useTexture("ball_earth.jpg");
  const ballMoonTexture = useTexture("ball_moon.jpg");
  const ballJupiterTexture = useTexture("ball_jupiter.jpg");
  const ballSunTexture = useTexture("ball_sun.jpg");
  const ballCellTexture = useTexture("ball_cell.jpg");
  const ballVangoghTexture = useTexture("ball_vangogh.jpg");
  const ballRomanescoTexture = useTexture("ball_romanesco.jpg");
  const ballMarbleTexture = useTexture("marble/marble_big.jpg");

  const planetNormalMap = useTexture("planet_normal.jpg");

  // const roughnessMap = useTexture(roughnessMapPath);
  // const normalMap = useTexture(normalMapPath);
  // const aoMap = useTexture(aoMapPath);
  // const bumpMap = useTexture(bumpMapPath);
  // const displacementMap = useTexture(displacementMapPath);

  return (
    <>
      {/* galaxy */}
      <Clump
        texture={ballGalaxyTexture}
        texturePath={"ball_galaxy.jpg"}
        numNodes={num * 0.5}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0.1,
          envMapIntensity: 3,
          transmission: 0,
        }}
        position={positions.galaxy}
      />

      {/* earth */}
      <Clump
        texture={ballEarthTexture}
        texturePath={"ball_earth.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 4,
          transmission: 0,
        }}
        radius={BALL_RADIUS * 1.4 * (isExpanded ? 0.6 : 1)}
        mass={BALL_MASS * 1.4 * 2}
        position={positions.earth}
      />
      {/* moon */}
      <Clump
        texture={ballMoonTexture}
        texturePath={"ball_moon.jpg"}
        normalMap={planetNormalMap}
        normalMapPath={"planet_normal.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0.9,
          emissive: null,
          metalness: 0.2,
          envMapIntensity: 3,
          transmission: 0,
        }}
        radius={
          BALL_RADIUS *
          1.2 *
          // shrink when it's alone with the earth
          (!isExpanded ? 1 : 0.25)
        }
        mass={BALL_MASS * 2}
        position={positions.moon}
      />
      {/* jupiter */}
      <Clump
        texture={ballJupiterTexture}
        texturePath={"ball_jupiter.jpg"}
        normalMap={planetNormalMap}
        normalMapPath={"planet_normal.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0.6,
          emissive: null,
          metalness: 0.1,
          envMapIntensity: 1.5,
          transmission: 0,
        }}
        radius={BALL_RADIUS * 1.8 * (isExpanded ? 1.5 : 1)}
        mass={BALL_MASS * 1.8 * 2}
        position={positions.jupiter}
      />
      {/* sun */}
      <Clump
        texture={ballSunTexture}
        texturePath={"ball_sun.jpg"}
        // normalMapPath={"wavy-normal.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0.5,
          emissive: "#c04b14",
          metalness: 0.1,
          envMapIntensity: 4,
          transmission: 0,
        }}
        radius={BALL_RADIUS * 2.4 * (isExpanded ? 8 : 1)}
        mass={BALL_MASS * 2.4 * 2}
        position={positions.sun}
      />
      {/* <Clump
        texture={ballSunTexture}
        texturePath={"ball_sun.jpg"}
        // normalMapPath={"wavy-normal.jpg"}
        numNodes={1}
        materialProps={{
          roughness: 0.5,
          emissive: "#c04b14",
          metalness: 0.1,
          envMapIntensity: 4,
          transmission: 0,
        }}
        radius={BALL_RADIUS * 2.4 * (isExpanded ? 8 : 1)}
        mass={BALL_MASS * 2.4 * 2}
        position={positions.sun}
      /> */}
      {/* colored cell */}
      <Clump
        texture={ballCellTexture}
        texturePath={"ball_cell.jpg"}
        // normalMapPath={"planet_normal_sm.png"}
        // roughnessMapPath={"roughness_map.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0.7,
          emissive: null,
          metalness: 0.9,
          envMapIntensity: 4.2,
          transmission: 0,
          thickness: BALL_RADIUS,
        }}
        coloredTexture={true}
        position={positions.cell}
      />
      {/* glassy */}
      <Clump
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 0,
          transmission: 1,
          thickness: BALL_RADIUS * 7,
        }}
        radius={BALL_RADIUS * 1.2}
        position={positions.glass}
      />

      {/* shiny starry night */}

      {/* starry night */}
      <Clump
        texture={ballVangoghTexture}
        texturePath={"ball_vangogh.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 1,
          emissive: null,
          metalness: 0,
          envMapIntensity: 4,
          transmission: 0,
        }}
        position={positions.starry_night}
      />
      {/* marble */}
      <Clump
        coloredTexture={true}
        texture={ballMarbleTexture}
        texturePath={"marble/marble_big.jpg"}
        // normalMapPath={"marble/marble_normal.jpg"}
        // displacementMapPath={"marble/marble_displacement.jpg"}
        // aoMapPath={"marble/marble_spec.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0.35,
          envMapIntensity: 2,
          transmission: 0,
        }}
        position={positions.marble}
      />
      {/* romanesco */}
      <Clump
        texture={ballRomanescoTexture}
        texturePath={"ball_romanesco.jpg"}
        numNodes={num}
        materialProps={{
          roughness: 0.2,
          metalness: 0.1,
          envMapIntensity: 1.5,
          transmission: 0,
        }}
        radius={BALL_RADIUS}
        position={positions.romanesco}
        // coloredTexture={true}
      />
      {/* shiny icosahedron */}
      <Clump
        icosa={true}
        numNodes={num * (gpu.tier > 1 ? 3 : 2)}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 5,
          transmission: 1,
          thickness: BALL_RADIUS,
        }}
        radius={BALL_RADIUS * 1.2}
        mass={BALL_MASS * 1.2}
        position={positions.icosa}
      />
      {/* shiny dodecaahedron */}
      <Clump
        dodeca={true}
        numNodes={num * (gpu.tier > 1 ? 6 : 3)}
        materialProps={{
          roughness: 0,
          emissive: null,
          metalness: 0,
          envMapIntensity: 5,
          transmission: 1,
          thickness: BALL_RADIUS * 1.2,
        }}
        radius={BALL_RADIUS * 1.2 * 0.5}
        mass={BALL_MASS}
        position={positions.dodeca}
      />
    </>
  );
}
