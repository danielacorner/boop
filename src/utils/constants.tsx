import { atomWithStorage } from "jotai/utils";
import palettes from "nice-color-palettes";
export const COLORS = [
  ...palettes[0],
  ...palettes[1],
  ...palettes[3],
  ...palettes[2],
];

export const BALL_RADIUS = 0.4;
export const BALL_MASS = 1;

export const PULL_FORCE = 1.5;

// Collision filter groups - must be powers of 2!
export const GROUP1 = 1;
export const GROUP2 = 2;
export const GROUP3 = 4;

export const COLLIDER_RADIUS = 1.5;
export const COLLIDER_LERP_SPEED = 0.35;

/** positions in the range [-1, 1] - will get multiplied by viewport width/height */
type Positions = { [key: string]: [number, number, number] };
export const POSITIONS: { initial: Positions; secondary: Positions } = {
  initial: {
    galaxy: [0, 0, 0],
    earth: [0, 0, 0],
    moon: [0, 0, 0],
    jupiter: [0, 0, 0],
    sun: [0, 0, 0],
    cell: [0, 0, 0],
    glass: [0, 0, 0],
    romanesco: [0, 0, 0],
    starry_night: [0, 0, 0],
    marble: [0, 0, 0],
    icosa: [0, 0, 0],
    dodeca: [0, 0, 0],
    d20: [0, 0, 0],
  },
  secondary: {
    galaxy: [1, -1, 0],
    earth: [0, 0, 0],
    moon: [0, 0, 0],
    jupiter: [-1, -1, 0],
    sun: [0, -3.2, 0],
    cell: [1, 0, 0],
    glass: [-1, 0, 0],
    romanesco: [-1, 1, 0],
    starry_night: [1, 1, 0],
    marble: [0, 1, 0],
    icosa: [-1, 0, 0],
    dodeca: [-1, 0, 0],
    d20: [0, -1, 0],
  },
};
export const INITIAL_CAMERA_POSITION: [number, number, number] = [0, 0, 20];

export const MIN_DPR = 0.6;
export const MAX_DPR = 0.8;
export const MAX_DPR_BY_TIER = {
  "0": MIN_DPR,
  "1": MIN_DPR,
  "2": MAX_DPR,
  "3": MAX_DPR,
};

export const dprAtom = atomWithStorage("dpr", MIN_DPR);
