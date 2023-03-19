import { useAtom, atom } from "jotai";

const doubleClickedAtom = atom(false);
export function useDoubleClicked() {
  return useAtom(doubleClickedAtom);
}
