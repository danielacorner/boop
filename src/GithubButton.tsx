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
  top: 2px;
  left: 2px;
  @media (min-width: 768px) {
    bottom: 2px;
    top: unset;
  }
  opacity: 0.25;
  cursor: pointer;
  * {
    color: white;
  }
`;
