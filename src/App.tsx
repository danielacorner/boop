import { Loader } from "@react-three/drei";
import { Scene } from "./components/Scene";
import { SpreadOutButton } from "./components/UI/BtnSpreadOut";
import {
  AutoModeButton,
  Music,
  MusicButton,
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
      <SpreadOutButton className="btn-spread" />
      <MusicButton className="btn-music" />
      <AutoModeButton className="btn-automode" />
      <SpinCameraButton className="btn-spin" />
      <GithubButton className="btn-github" />
    </ControlsOverlayStyles>
  );
}
const ControlsOverlayStyles = styled.div`
  position: fixed;
  z-index: 10;
  bottom: 20px;
  display: flex;
  gap: 1em;
  justify-content: center;
  width: 100%;
  @media (min-width: 768px) {
  }
`;
