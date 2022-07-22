import { AudioSoundButton } from "./AudioSoundButton";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { useMount } from "react-use";
import { useMemo } from "react";

const isFirstTimeVisitAtom = atomWithStorage<boolean>(
  "atoms:isFirstTimeVisit",
  true
);
export function Music() {
  const [isFirstTimeVisit, setIsFirstTimeVisit] = useAtom(isFirstTimeVisitAtom);

  const { title, href } = useMemo(
    () =>
      isFirstTimeVisit
        ? // first-time visitors always hear the same song
          MUSIC[0]
        : // repeat visitors get a random song
          shuffleArray(MUSIC)[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useMount(() => {
    setIsFirstTimeVisit(false);
  });
  return <AudioSoundButton title={title} href={href} />;
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
const MUSIC = [
  {
    title: "Is This Our Earth? (Mixed)",
    href: "https://www.youtube.com/watch?v=6MlaAq2DnbE",
  },
  {
    title: "Welcome to Lunar Industries - Moon OST",
    href: "https://www.youtube.com/watch?v=WUraLNrTVeg",
  },
  {
    title: "Memories (Someone We'll Never Know) - Moon OST",
    href: "https://www.youtube.com/watch?v=QVuoul47Q_w&list=OLAK5uy_l3rRYn-9yNjarAoHvVh8tNmaOWIeJVEU0&index=5",
  },
  {
    title: "The Nursery - Moon OST",
    href: "https://www.youtube.com/watch?v=RgVzeqPIt-8&list=OLAK5uy_l3rRYn-9yNjarAoHvVh8tNmaOWIeJVEU0&index=9",
  },
  {
    title: "Battlestar Sonatica",
    href: "https://www.youtube.com/watch?v=5vcFFf9aa7k",
  },
  {
    title: "Cygnus - Endless Space 2 OST",
    href: "https://www.youtube.com/watch?v=PeGv-QtHyaA&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=22",
  },
  {
    title: "Singularity - Endless Space 2 OST",
    href: "https://www.youtube.com/watch?v=kLyBwJageak&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=6",
  },
  {
    title: "Axial Tilt Zero - Endless Space 2 OST",
    href: "https://www.youtube.com/watch?v=3Ql_ENGlTRM&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=3",
  },
  {
    title: "Tristram - Diablo 2 OST",
    href: "https://www.youtube.com/watch?v=VWziHqEd0Uw&t=1372s",
  },

  {
    title: "Space Me Out (Jody Wisternoff & James Grant Edit)",
    href: "https://www.youtube.com/watch?v=8AjzuJVp7pw",
  },
  {
    title: "Stafrænn Hákon - P-Rofi",
    href: "https://www.youtube.com/watch?v=GC_xfnEXtqs",
  },
  // {
  //   title: "Three Quarks in a Row - Endless Space 2 OST",
  //   href: "https://www.youtube.com/watch?v=MEvIBLiGDu8&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=17",
  // },
];
