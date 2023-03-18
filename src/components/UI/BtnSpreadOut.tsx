import { IconButton } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import styled from "styled-components";
import { usePositions } from "../../store/store";
import { POSITIONS } from "../../utils/constants";

export function SpreadOutButton(props) {
  const { isExpanded, setPositions } = usePositions();

  return (
    <StyledIconButton
      {...props}
      className={!isExpanded ? "" : "active"}
      onClick={() => {
        setPositions(!isExpanded ? POSITIONS.secondary : POSITIONS.initial);
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
