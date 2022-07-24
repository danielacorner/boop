import { AudioSoundButton } from "./AudioSoundButton";
import { atomWithStorage } from "jotai/utils";
import { useMount } from "react-use";
import { useMemo } from "react";
import { atom, useAtom } from "jotai";
export const musicUrlAtom = atom<{ url: string; internal: boolean }>({
  url: "",
  internal: false,
});
const isFirstTimeVisitAtom = atomWithStorage<boolean>(
  "atoms:isFirstTimeVisit",
  true
);
export function Music() {
  const [isFirstTimeVisit, setIsFirstTimeVisit] = useAtom(isFirstTimeVisitAtom);
  const [, setMusicUrl] = useAtom(musicUrlAtom);

  const { title, href, bpm, internal } = useMemo(
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
    if (internal) {
      setMusicUrl({ internal: true, url: href });
    }
    setIsFirstTimeVisit(false);
  });
  return (
    <>
      <AudioSoundButton {...{ title, href, internal, bpm }} />
    </>
  );
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
const MUSIC: {
  title: string;
  href: string;
  internal?: boolean;
  bpm: number;
}[] = [
  {
    bpm: 125,
    title: "Is This Our Earth? (Mixed)",
    href: "https://www.youtube.com/watch?v=6MlaAq2DnbE",
    // href: "/music/is_this_our_earth_mixed.mp3",
    // internal: true,
  },
  {
    bpm: 125,
    title: "Is This Our Earth? - Lane 8",
    href: "https://www.youtube.com/watch?v=rs80mrSQliM",
  },
  {
    bpm: 110,
    title: "Welcome to Lunar Industries - Moon OST",
    href: "https://www.youtube.com/watch?v=WUraLNrTVeg",
  },
  {
    bpm: 78,
    title: "Memories (Someone We'll Never Know) - Moon OST",
    href: "https://www.youtube.com/watch?v=XSJJuDLtCqY",
  },
  {
    bpm: 66,
    title: "The Nursery - Moon OST",
    href: "https://www.youtube.com/watch?v=RgVzeqPIt-8",
  },
  {
    bpm: 116,
    title: "Battlestar Sonatica",
    href: "https://www.youtube.com/watch?v=5vcFFf9aa7k",
  },
  {
    bpm: 86,
    title: "Cygnus - Endless Space 2 OST",
    href: "https://www.youtube.com/watch?v=PeGv-QtHyaA",
  },
  {
    bpm: 86,
    title: "Singularity - Endless Space 2 OST",
    href: "https://www.youtube.com/watch?v=kLyBwJageak&t=1m51s",
  },
  {
    bpm: 122,
    title: "Axial Tilt Zero - Endless Space 2 OST",
    href: "https://www.youtube.com/watch?v=3Ql_ENGlTRM",
  },
  {
    bpm: 74,
    title: "Tristram - Diablo 2 OST",
    href: "https://www.youtube.com/watch?v=VWziHqEd0Uw&t=1372s",
  },
  {
    bpm: 99,
    title: "Stafrænn Hákon - P-Rofi",
    href: "https://www.youtube.com/watch?v=GC_xfnEXtqs",
  },
  {
    bpm: 40,
    title: "Space Me Out (Jody Wisternoff & James Grant Edit)",
    href: "https://www.youtube.com/watch?v=8AjzuJVp7pw",
  },
  // {
  // bpm:40,
  //   title: "Three Quarks in a Row - Endless Space 2 OST",
  //   href: "https://www.youtube.com/watch?v=MEvIBLiGDu8&list=PLtzah_dj5hUXssVw_j55Fnwjud0fZRle6&index=17",
  // },
];
