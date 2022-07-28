import styled from "styled-components";
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

const isFirstTimeVisitAtom = atomWithStorage<boolean>(
  "atoms:isFirstTimeVisit",
  true
);

function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const musicAtom = atom<{
  playing: boolean;
  autoMode: boolean;
  trackNumber: number;
  internal: boolean;
}>({
  playing: false,
  autoMode: false,
  trackNumber: 0,
  internal: false,
});

/** Mute button with hidden a <ReactPlayer/> */
export function Music() {
  const [{ internal, trackNumber, playing, autoMode }, setMusic] =
    useAtom(musicAtom);

  const [isFirstTimeVisit, setIsFirstTimeVisit] = useAtom(isFirstTimeVisitAtom);

  useMount(() => {
    const nextTrackNumber = isFirstTimeVisit
      ? // first-time visitors always hear the same song
        0
      : // repeat visitors get a random song
        randBetween(0, MUSIC.length - 1);
    setMusic((p) => ({ ...p, internal: true, trackNumber }));
    setIsFirstTimeVisit(false);
  });

  const { title, url, bpm } = MUSIC[trackNumber];
  return (
    <>
      <SoundButtonStyles {...{ isAudioPlaying: Boolean(playing) }}>
        <IconButton
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
            {playing && (
              <IconButton
                className="btnAutoMode"
                onClick={() => setMusic((p) => ({ ...p, autoMode: !autoMode }))}
              >
                {autoMode ? <AutoFixHigh /> : <AutoFixOff />}
              </IconButton>
            )}
          </div>
        )}
      </SoundButtonStyles>

      {internal ? null : (
        <ReactPlayer
          style={{ visibility: "hidden", position: "fixed" }}
          playing={Boolean(playing)}
          url={url}
          onEnded={() =>
            setMusic((p) => ({
              ...p,
              trackNumber: getNewRandomNumber(
                p.trackNumber,
                0,
                MUSIC.length - 1
              ),
            }))
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
const SoundButtonStyles = styled.div<{ isAudioPlaying: boolean }>`
  pointer-events: auto;
  white-space: nowrap;
  display: flex;
  position: fixed;
  align-items: center;
  z-index: 9;
  .MuiButtonBase-root {
    color: hsla(0, 100%, 100%, 1);
  }
  bottom: 4px;
  left: 4px;
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
    a {
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
  .MuiIconButton-root.btnAutoMode {
    position: fixed;
    bottom: 4px;
    right: 4px;
  }
  @media (min-width: 768px) {
    bottom: 8px;
    left: 0px;
    right: 0px;
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
    .MuiIconButton-root.btnAutoMode {
      position: absolute;
      right: -84px;
      top: 0;
      bottom: 0;
    }
  }
`;
