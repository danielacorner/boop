import { IconButton } from "@mui/material";
import { ZoomInMap, ZoomOutMap } from "@mui/icons-material";
import styled from "styled-components";
import { useAtom } from "jotai";
import { POSITIONS, positionsAtom } from "../../utils/constants";

export function SpreadOutButton() {
  const [positions, setPositions] = useAtom(positionsAtom);

  const isInitialPosition = positions.dodeca === POSITIONS.initial.dodeca;
  return (
    <StyledIconButton
      className="SpreadOutButton"
      onClick={() => {
        setPositions(
          isInitialPosition ? POSITIONS.secondary : POSITIONS.initial
        );
      }}
    >
      {isInitialPosition ? <ZoomInMap /> : <ZoomOutMap />}
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
