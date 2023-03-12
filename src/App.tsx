import { Loader } from "@react-three/drei";
import { Scene } from "./components/Scene";
import { SpreadOutButton } from "./components/UI/BtnSpreadOut";
import { Music } from "./components/UI/Music/Music";
import { GithubButton } from "./GithubButton";

function App() {
  return (
    <>
      <Loader />
      <Scene />
      {process.env.NODE_ENV === "production" && <Music />}
      <SpreadOutButton />
      <GithubButton />
    </>
  );
}

export default App;
