// import ReactPlayer from "react-player";
import styled from "styled-components";
import { useState } from "react";
import { VolumeUp, VolumeOff } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import { useAtom, atom } from "jotai";
import ReactPlayer from "react-player";
const NUM_VOLUME_STEPS = 20;

const isMusicOnAtom = atom<boolean>(false);
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
        <Tooltip title={isMusicOn ? "mute 🔈" : "unmute 🔊"}>
          <IconButton onClick={() => setIsMusicOn(!isMusicOn)}>
            {isMusicOn ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
        </Tooltip>
        {isMusicOn && (
          <div className="soundInfo">
            <a href={href} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          </div>
        )}
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
  white-space: nowrap;
  display: flex;
  position: fixed;
  opacity: 0.3;
  align-items: center;
  z-index: 9;
  .MuiButtonBase-root {
    color: hsla(0, 100%, 100%, 1);
  }
  bottom: 4px;
  left: 4px;
  .MuiSvgIcon-root {
    width: 22px;
    height: 22px;
  }
  .soundInfo {
    font-family: system-ui;
    display: flex;
    a {
      font-size: 12px;
      color: white;
      text-decoration: none;
    }
    opacity: ${(p) => (p.isAudioPlaying ? 0.5 : 0)};
  }
  &:hover,
  &:active {
    .soundInfo {
      opacity: 1;
    }
  }
  @media (min-width: 768px) {
    bottom: 8px;
    left: 0px;
    right: 0px;
    display: flex;
    justify-content: center;
    .MuiSvgIcon-root {
      width: 36px;
      height: 36px;
    }
    .soundInfo a {
      font-size: 18px;
    }
  }
`;
