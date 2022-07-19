import { AudioSoundButton } from "./AudioSoundButton";
import { LotteryMachine } from "./LotteryMachine";

const { title, href } = shuffleArray([
  {
    title: "Cygnus - Endless Space 2 Original Soundtrack",
    href: "https://www.youtube.com/watch?v=PeGv-QtHyaA&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=22",
  },
  {
    title: "Worship the Endless - Endless Space 2 Original Soundtrack",
    href: "https://www.youtube.com/watch?v=uN6JFzeSAz0&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=2",
  },
  {
    title: "Three Quarks in a Row - Endless Space 2 Original Soundtrack",
    href: "https://www.youtube.com/watch?v=MEvIBLiGDu8&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=17",
  },
])[0];
function App() {
  return (
    <>
      <LotteryMachine />
      <AudioSoundButton title={title} href={href} />
    </>
  );
}

export default App;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
