import styled from "styled-components";
import { VolumeUp, VolumeOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useAtom, atom } from "jotai";
import ReactPlayer from "react-player";

const isMusicOnAtom = atom<boolean>(false);

/** Mute button with hidden a <ReactPlayer/> */
export function AudioSoundButton({ title, href }) {
  const [isMusicOn, setIsMusicOn] = useAtom(isMusicOnAtom);

  return (
    <>
      <SoundButtonStyles {...{ isAudioPlaying: Boolean(isMusicOn) }}>
        <IconButton onClick={() => setIsMusicOn(!isMusicOn)}>
          {isMusicOn ? <VolumeUp /> : <VolumeOff />}
        </IconButton>
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
    margin-top: -3px;
    font-family: system-ui;
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
      width: 24px;
      height: 24px;
    }
    .soundInfo {
      margin-top: -2px;
      a {
        font-size: 14px;
      }
    }
  }
`;
