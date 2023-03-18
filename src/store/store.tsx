import { atom, useAtom } from "jotai";
import { POSITIONS } from "../utils/constants";

export const isCameraMovingAtom = atom(false);
const positionsAtom = atom(POSITIONS.initial);
export function usePositions() {
  const [positions, setPositions] = useAtom(positionsAtom);
  return {
    positions,
    setPositions,
    isExpanded: positions.dodeca[0] !== POSITIONS.initial.dodeca[0],
  };
}
