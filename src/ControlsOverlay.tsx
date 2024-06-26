import { SpreadOutButton } from "./components/UI/BtnSpreadOut";
import { AutoModeButton, MusicButton } from "./components/UI/Music/Music";
import { SpinCameraButton } from "./components/UI/Music/SpinCameraButton";
import { ShuffleButton } from "./components/UI/Music/ShuffleButton";
import { GithubButton } from "./GithubButton";
import styled from "styled-components";

export function ControlsOverlay() {
  return (
    <ControlsOverlayStyles>
      <MusicButton />
      <ShuffleButton />
      <AutoModeButton />
      <SpreadOutButton />
      <SpinCameraButton />
      <GithubButton className="btn-github" />
    </ControlsOverlayStyles>
  );
}
const ControlsOverlayStyles = styled.div`
  position: fixed;
  z-index: 10;
  bottom: 32px;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.5em;
  justify-content: center;
  width: 100%;
  .btn-github {
    transform: scale(0.7);
    transform-origin: bottom left;
    position: fixed;
    bottom: 0px;
    left: 0px;
  }
  @media (min-width: 768px) {
  }
`;
