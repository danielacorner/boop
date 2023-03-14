import { IconButton } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import styled from "styled-components";
import { useAtom } from "jotai";
import { POSITIONS } from "../../utils/constants";
import { positionsAtom } from "../../store/store";

export function SpreadOutButton(props) {
  const [positions, setPositions] = useAtom(positionsAtom);

  const isInitialPosition = positions.dodeca === POSITIONS.initial.dodeca;
  return (
    <StyledIconButton
      {...props}
      className={isInitialPosition ? "" : "active"}
      onClick={() => {
        setPositions(
          isInitialPosition ? POSITIONS.secondary : POSITIONS.initial
        );
      }}
    >
      <AutoAwesome />
    </StyledIconButton>
  );
}
const StyledIconButton = styled(IconButton)`
  &&&& {
    opacity: 0.4;
    svg {
      color: white;
    }
    width: 40px;
    height: 40px;
    &.active {
      opacity: 1;
    }
  }
`;
