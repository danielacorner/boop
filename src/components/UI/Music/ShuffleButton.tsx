import { Shuffle } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useAtom } from "jotai";
import { MUSIC } from "./MUSIC_DATA";
import { musicAtom, getNewRandomNumber } from "./Music";
import { SoundButtonStyles } from "./SoundButtonStyles";
import { useDoubleClicked } from "../../Collider/useDoubleClicked";

export function ShuffleButton(props) {
  const [
    { url, title, internal, trackNumber, playing, autoMode, bpm },
    setMusic,
  ] = useAtom(musicAtom);
  const [, setDoubleClicked] = useDoubleClicked();
  return (
    <SoundButtonStyles {...props}>
      <IconButton
        disabled={!playing}
        onClick={() => {
          const nextTrackNumber = getNewRandomNumber(
            trackNumber,
            0,
            MUSIC.length - 1
          );
          setMusic((p) => ({
            ...p,
            trackNumber: nextTrackNumber,
            ...MUSIC[nextTrackNumber],
          }));
          setDoubleClicked(true);
        }}
      >
        <Shuffle />
      </IconButton>
    </SoundButtonStyles>
  );
}
