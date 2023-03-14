import styled from "styled-components";
import {
  VolumeUp,
  VolumeOff,
  AutoFixHigh,
  AutoFixOff,
  ThreeSixty,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useAtom, atom } from "jotai";
import ReactPlayer from "react-player";
import { MUSIC } from "./MUSIC_DATA";
import { useMount } from "react-use";
import { atomWithStorage } from "jotai/utils";
import { isCameraMovingAtom } from "../../../store/store";

const isFirstTimeVisitAtom = atomWithStorage<boolean>(
  "atoms:isFirstTimeVisit",
  true
);

function randIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
function getNewRandomNumber(prevNum, min, max) {
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
  return (
    <SoundButtonStyles {...{ isAudioPlaying: Boolean(playing) }} {...props}>
      <IconButton
        className={playing ? "active" : ""}
        onClick={() => setMusic((p) => ({ ...p, playing: !playing, bpm }))}
      >
        {playing ? <VolumeUp /> : <VolumeOff />}
      </IconButton>
      {playing && (
        <div className="soundInfo">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {/* <marquee scrollamount={3}>{title}</marquee> */}
            {title}
          </a>
        </div>
      )}
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
export function SpinCameraButton(props) {
  const [isCameraMoving, setIsCameraMoving] = useAtom(isCameraMovingAtom);
  return (
    <SoundButtonStyles {...props}>
      <IconButton
        className={isCameraMoving ? "active" : ""}
        onClick={() => setIsCameraMoving((p) => !p)}
      >
        <ThreeSixty
          style={{ transform: `rotate(${isCameraMoving ? 0.5 : 0}turn)` }}
        />
      </IconButton>
    </SoundButtonStyles>
  );
}
const SoundButtonStyles = styled.div<{ isAudioPlaying: boolean }>`
  pointer-events: auto;
  white-space: nowrap;
  display: flex;
  align-items: center;
  .MuiButtonBase-root {
    color: hsla(0, 100%, 100%, 1);
    &.Mui-disabled {
      color: hsla(0, 100%, 100%, 0.5);
    }
    &.active {
      .MuiSvgIcon-root {
        opacity: 1;
      }
    }
  }
  .MuiSvgIcon-root {
    opacity: 0.4;
    &:hover,
    &:active {
      opacity: 0.7;
    }
    width: 22px;
    height: 22px;
  }
  .soundInfo {
    margin-top: -3px;
    font-family: system-ui;
    position: relative;
    overflow: hidden;
    width: 100px;
    height: 100%;
    display: flex;
    align-items: center;
    a {
      width: 100%;
      position: absolute;
      animation: scroll-left 10s linear infinite;
      font-size: 12px;
      color: white;
      text-decoration: none;
      opacity: ${(p) => (p.isAudioPlaying ? 0.5 : 0)};
      &:hover,
      &:active {
        opacity: 1;
      }
    }
  }

  @keyframes scroll-left {
    0% {
      transform: translateX(90%);
    }
    100% {
      transform: translateX(-90%);
    }
  }

  @media (min-width: 768px) {
    display: flex;
    justify-content: center;
    .MuiSvgIcon-root {
      width: 24px;
      height: 24px;
    }
    .soundInfo {
      margin-top: -2px;
      a {
        font-size: 14px;
      }
      position: relative;
    }
  }
`;
