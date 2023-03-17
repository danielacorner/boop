import { Loader } from "@react-three/drei";
import { Scene } from "./components/Scene";
import { SpreadOutButton } from "./components/UI/BtnSpreadOut";
import {
  AutoModeButton,
  Music,
  MusicButton,
  ShuffleButton,
  SpinCameraButton,
} from "./components/UI/Music/Music";
import { GithubButton } from "./GithubButton";
import styled from "styled-components";

function App() {
  return (
    <>
      <Loader />
      <Scene />
      <Music />
      <ControlsOverlay />
    </>
  );
}

export default App;

function ControlsOverlay() {
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
