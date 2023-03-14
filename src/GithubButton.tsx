import { IconButton } from "@mui/material";
import { GitHub } from "@mui/icons-material";
import styled from "styled-components";

export function GithubButton(props) {
  return (
    <Styles {...props}>
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
  opacity: 0.25;
  cursor: pointer;
  * {
    color: white;
  }
`;
