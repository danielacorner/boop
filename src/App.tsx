import { Loader } from "@react-three/drei";
import { Scene } from "./components/Scene";
import { Music } from "./components/Music/Music";
import { SpreadOutButton } from "./components/SpreadOutButton";

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
