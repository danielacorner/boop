// import ReactPlayer from "react-player";
import styled from "styled-components";
import { useState } from "react";
import { VolumeUp, VolumeOff } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import { useAtom, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import ReactPlayer from "react-player";
const NUM_VOLUME_STEPS = 20;

const isMusicOnAtom = atomWithStorage<boolean>("atoms:isMusicOn", false);
const volumeAtom = atom<number>(5);

/** Mute button with hidden a <ReactPlayer/> */
export function AudioSoundButton({ title, href }) {
  const [isMusicOn, setIsMusicOn] = useAtom(isMusicOnAtom);

  const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useAtom(volumeAtom);
  const volLevel = Number(volume) / NUM_VOLUME_STEPS;
  return (
    <>
      <SoundButtonStyles
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...{ isAudioPlaying: Boolean(isMusicOn) }}
      >
        <div className="soundInfo">
          <a href={href} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </div>
        <Tooltip title={isMusicOn ? "mute 🔈" : "unmute 🔊"}>
          <IconButton onClick={() => setIsMusicOn(!isMusicOn)}>
            {isMusicOn ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
        </Tooltip>
      </SoundButtonStyles>
      <ReactPlayer
        style={{ visibility: "hidden", position: "fixed" }}
        playing={Boolean(isMusicOn)}
        volume={volLevel}
        url={href}
      />
    </>
  );
}
const SoundButtonStyles = styled.div<{ isAudioPlaying: boolean }>`
  pointer-events: auto;
  height: 48px;
  white-space: nowrap;
  display: flex;
  position: fixed;
  bottom: 8px;
  right: 12px;
  opacity: 0.6;
  align-items: center;
  z-index: 9;
  .MuiButtonBase-root {
    color: hsla(0, 100%, 100%, 1);
  }
  .soundInfo {
    font-family: system-ui;
    a {
      color: white;
    }
    opacity: ${(p) => (p.isAudioPlaying ? 0.1 : 0)};
    margin-top: -6px;
  }
  &:hover,
  &:active {
    .soundInfo {
      opacity: 1;
    }
  }
`;
