import { IconButton } from "@mui/material";
import { GitHub } from "@mui/icons-material";
import styled from "styled-components";

export function GithubButton() {
  const isTabletOrLarger = window.innerWidth >= 768;
  return isTabletOrLarger ? (
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
  ) : null;
}
const Styles = styled.div`
  position: fixed;
  z-index: 10;
  bottom: 2px;
  left: 2px;
  opacity: 0.25;
  cursor: pointer;
  * {
    color: white;
  }
`;
