import { IconButton } from "@mui/material";
import { GitHub } from "@mui/icons-material";
import styled from "styled-components";

export function GithubButton() {
  return (
    <Styles>
      <a
        href="https://github.com/danielacorner/boop"
        target={"_blank"}
        rel="noreferrer"
      >
        <IconButton>
          <GitHub />
        </IconButton>
      </a>
    </Styles>
  );
}
const Styles = styled.div`
  position: fixed;
  z-index: 10;
  bottom: 2px;
  right: 2px;
  @media (min-width: 768px) {
    left: 2px;
    right: unset;
  }
  opacity: 0.25;
  cursor: pointer;
  * {
    color: white;
  }
`;
