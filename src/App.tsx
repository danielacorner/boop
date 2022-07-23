import { Loader } from "@react-three/drei";
import { Scene } from "./components/Scene";
import { Music } from "./components/Music/Music";

function App() {
  return (
    <>
      <Loader />
      <Scene />
      <Music />
    </>
  );
}

export default App;
