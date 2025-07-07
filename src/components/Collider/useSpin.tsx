import { rfs } from "../../utils/hooks";
import { useInterval, useMount, useUpdateEffect } from "react-use";
import { useMusic } from "../UI/Music/Music";
import { useRotation } from "../../context/RotationContext";
import { useEffect } from "react";

const BASE_SPIN = 5;

export function useSpin(api) {
  const { rotationVelocity, isKinematic } = useRotation();
  const [{ autoMode, bpm }] = useMusic();
  const secondsPerBeat = 60 / bpm;
  
  // Set initial rotation velocity based on context
  useMount(() => {
    if (isKinematic) {
      const spinFactor = rotationVelocity * BASE_SPIN;
      api.angularVelocity.set(rfs(spinFactor), rfs(spinFactor), rfs(spinFactor));
    } else {
      // For dynamic bodies, stop rotation when rotationVelocity is 0
      api.angularVelocity.set(0, 0, 0);
    }
  });

  // Update rotation velocity when the slider value changes
  useEffect(() => {
    if (isKinematic) {
      const spinFactor = rotationVelocity * BASE_SPIN;
      api.angularVelocity.set(rfs(spinFactor), rfs(spinFactor), rfs(spinFactor));
    } else {
      // For dynamic bodies, stop rotation when rotationVelocity is 0
      api.angularVelocity.set(0, 0, 0);
    }
    
    // For bodies switching between kinematic and dynamic, wake them up
    api.wakeUp();
  }, [api, rotationVelocity, isKinematic]);

  // Random rotation changes on music beat
  useInterval(() => {
    if (!autoMode || !isKinematic) {
      return;
    }
    const spinFactor = rotationVelocity * BASE_SPIN;
    api.angularVelocity.set(rfs(spinFactor), rfs(spinFactor), rfs(spinFactor));
  }, secondsPerBeat * 1000);
}
