import palettes from "nice-color-palettes";
export const COLORS = [
  ...palettes[0],
  ...palettes[1],
  ...palettes[3],
  ...palettes[2],
];

export const BALL_RADIUS = 0.5;
export const BALL_MASS = 1;

// Collision filter groups - must be powers of 2!
export const GROUP1 = 1;
export const GROUP2 = 2;
export const GROUP3 = 4;
