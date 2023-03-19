import styled from "styled-components";

export const SoundButtonStyles = styled.div<{ isAudioPlaying: boolean }>`
  pointer-events: auto;
  white-space: nowrap;
  display: flex;
  align-items: center;
  .MuiButtonBase-root {
    color: hsla(0, 100%, 100%, 1);
    &.Mui-disabled {
      color: hsla(0, 100%, 100%, 0.5);
    }
    &.active,
    &:active {
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
