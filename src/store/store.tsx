import { atom } from "jotai";
import { POSITIONS } from "../utils/constants";

export const isCameraMovingAtom = atom(false);
export const positionsAtom = atom(POSITIONS.initial);
