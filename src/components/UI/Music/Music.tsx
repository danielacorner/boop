import {
  VolumeUp,
  VolumeOff,
  AutoFixHigh,
  AutoFixOff,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useAtom, atom } from "jotai";
import ReactPlayer from "react-player";
import { MUSIC } from "./MUSIC_DATA";
import { useMount } from "react-use";
import { atomWithStorage } from "jotai/utils";
import { animated, useSpring } from "@react-spring/web";
import { SoundButtonStyles } from "./SoundButtonStyles";

const isFirstTimeVisitAtom = atomWithStorage<boolean>(
  "atoms:isFirstTimeVisit",
  true
);

function randIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function useMusic() {
  return useAtom(musicAtom);
}
export const musicAtom = atom<{
  playing: boolean;
  autoMode: boolean;
  trackNumber: number;
  internal: boolean;
  url: string;
  bpm: number;
  title: string;
}>({
  playing: false,
  autoMode: false,
  trackNumber: 0,
  internal: false,
  url: "",
  title: "",
  bpm: 0,
});

/** Mute button with hidden a <ReactPlayer/> */
export function Music() {
  const [
    { internal, trackNumber, playing, autoMode, title, url, bpm },
    setMusic,
  ] = useAtom(musicAtom);

  const [isFirstTimeVisit, setIsFirstTimeVisit] = useAtom(isFirstTimeVisitAtom);

  useMount(() => {
    const nextTrackNumber = isFirstTimeVisit
      ? // first-time visitors always hear the same song
        0
      : // repeat visitors get a random song
        randIntBetween(0, MUSIC.length - 1);
    setMusic((p) => ({
      ...p,
      trackNumber: nextTrackNumber,
      ...MUSIC[nextTrackNumber],
    }));
    setIsFirstTimeVisit(false);
  });

  return (
    <>
      {internal ? null : (
        <ReactPlayer
          style={{ visibility: "hidden", position: "fixed" }}
          playing={Boolean(playing)}
          url={url}
          onEnded={() =>
            setMusic((p) => {
              const trackNumber = getNewRandomNumber(
                p.trackNumber,
                0,
                MUSIC.length - 1
              );
              return {
                ...p,
                trackNumber,
                ...MUSIC[trackNumber],
              };
            })
          }
        />
      )}
    </>
  );
}
export function getNewRandomNumber(prevNum, min, max) {
  let nextNum = prevNum;
  while (nextNum === prevNum) {
    nextNum = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return nextNum;
}

export function MusicButton(props) {
  const [
    { url, title, internal, trackNumber, playing, autoMode, bpm },
    setMusic,
  ] = useAtom(musicAtom);
  const [springGrowHorizontallyFrom0] = useSpring(
    {
      from: { width: 0 },
      to: { width: playing ? 100 : 0 },
    },
    [playing]
  );
  return (
    <SoundButtonStyles {...{ isAudioPlaying: Boolean(playing) }} {...props}>
      <IconButton
        className={playing ? "active" : ""}
        onClick={() => setMusic((p) => ({ ...p, playing: !playing, bpm }))}
      >
        {playing ? <VolumeUp /> : <VolumeOff />}
      </IconButton>
      <animated.div style={springGrowHorizontallyFrom0} className="soundInfo">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {/* <marquee scrollamount={3}>{title}</marquee> */}
          {title}
        </a>
      </animated.div>
    </SoundButtonStyles>
  );
}

export function AutoModeButton(props) {
  const [
    { url, title, internal, trackNumber, playing, autoMode, bpm },
    setMusic,
  ] = useAtom(musicAtom);
  return (
    <SoundButtonStyles {...props}>
      <IconButton
        disabled={!playing}
        className={autoMode ? "active" : ""}
        onClick={() => setMusic((p) => ({ ...p, autoMode: !autoMode }))}
      >
        {autoMode ? <AutoFixHigh /> : <AutoFixOff />}
      </IconButton>
    </SoundButtonStyles>
  );
}
