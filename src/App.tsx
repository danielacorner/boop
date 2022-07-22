import { Loader } from "@react-three/drei";
import { LotteryMachine } from "./LotteryMachine";
import { Music } from "./components/Music/Music";

function App() {
  return (
    <>
      <Loader />
      <LotteryMachine />
      <Music />
    </>
  );
}

export default App;
