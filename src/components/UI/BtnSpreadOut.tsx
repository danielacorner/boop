import { IconButton } from "@mui/material";
import { ZoomInMap, ZoomOutMap } from "@mui/icons-material";
import styled from "styled-components";
import { useAtom } from "jotai";
import {
  positionsAtom,
  INITIAL_POSITIONS,
  SECONDARY_POSITIONS,
} from "../Scene";

export function SpreadOutButton() {
  const [positions, setPositions] = useAtom(positionsAtom);

  return (
    <StyledIconButton
      className="SpreadOutButton"
      onClick={() => {
        setPositions(
          positions.dodeca === INITIAL_POSITIONS.dodeca
            ? SECONDARY_POSITIONS
            : INITIAL_POSITIONS
        );
      }}
    >
      {positions.dodeca === INITIAL_POSITIONS.dodeca ? (
        <ZoomInMap />
      ) : (
        <ZoomOutMap />
      )}
    </StyledIconButton>
  );
}
const StyledIconButton = styled(IconButton)`
  &&&& {
    opacity: 0.4;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1;
    svg {
      color: white;
    }
    width: 40px;
    height: 40px;
    @media (min-width: 768px) {
      right: calc(50vw - 20px);
    }
  }
`;
