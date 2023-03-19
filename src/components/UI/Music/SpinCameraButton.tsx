import { ThreeSixty } from "@mui/icons-material";
import { useAtom } from "jotai";
import { isCameraMovingAtom } from "../../../store/store";
import { animated, useSpring } from "@react-spring/web";
import { SoundButtonStyles } from "./SoundButtonStyles";
import { IconButton } from "@mui/material";

export function SpinCameraButton(props) {
  const [isCameraMoving, setIsCameraMoving] = useAtom(isCameraMovingAtom);
  const springAnimateRotateWhileCameraIsMoving = useSpring({
    // spring animates the div by rotating it continuously while the camera is moving
    from: { transform: "rotate(0turn)" },
    to: { transform: `rotate(${isCameraMoving ? 1 : 0}turn)` },
    config: isCameraMoving
      ? { duration: 4 * 1000 }
      : { duration: undefined, tension: 100, friction: 28, mass: 1 },
    loop: isCameraMoving,
  });
  return (
    <SoundButtonStyles {...props}>
      <AnimatedIconButton
        style={springAnimateRotateWhileCameraIsMoving}
        className={isCameraMoving ? "active" : ""}
        onClick={() => setIsCameraMoving((p) => !p)}
      >
        <ThreeSixty
          style={{ transform: `rotate(${isCameraMoving ? 0.5 : 0}turn)` }}
        />
      </AnimatedIconButton>
    </SoundButtonStyles>
  );
}
const AnimatedIconButton = animated(IconButton);
