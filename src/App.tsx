import { Loader } from "@react-three/drei";
import { Scene } from "./components/Scene";
import { Music } from "./components/UI/Music/Music";
import { SpreadOutButton } from "./components/UI/BtnSpreadOut";

function App() {
  return (
    <>
      <Loader />
      <Scene />
      <Music />
      <SpreadOutButton />
    </>
  );
}

export default App;
