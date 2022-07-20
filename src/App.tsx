import { AudioSoundButton } from "./AudioSoundButton";
import { LotteryMachine } from "./LotteryMachine";

const { title, href } = shuffleArray([
  {
    title: "Memories (Someone We'll Never Know) - Moon OST",
    href: "https://www.youtube.com/watch?v=QVuoul47Q_w&list=OLAK5uy_l3rRYn-9yNjarAoHvVh8tNmaOWIeJVEU0&index=5",
  },
  {
    title: "The Nursery - Moon OST",
    href: "https://www.youtube.com/watch?v=RgVzeqPIt-8&list=OLAK5uy_l3rRYn-9yNjarAoHvVh8tNmaOWIeJVEU0&index=9",
  },
  {
    title: "We're Going Home - Moon OST",
    href: "https://www.youtube.com/watch?v=O3Kn9mFgr_o&list=OLAK5uy_l3rRYn-9yNjarAoHvVh8tNmaOWIeJVEU0&index=11",
  },
  {
    title: "Cygnus - Endless Space 2 OST",
    href: "https://www.youtube.com/watch?v=PeGv-QtHyaA&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=22",
  },
  // {
  //   title: "Worship the Endless - Endless Space 2 OST",
  //   href: "https://www.youtube.com/watch?v=uN6JFzeSAz0&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=2",
  // },
  // {
  //   title: "Three Quarks in a Row - Endless Space 2 OST",
  //   href: "https://www.youtube.com/watch?v=MEvIBLiGDu8&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=17",
  // },
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
