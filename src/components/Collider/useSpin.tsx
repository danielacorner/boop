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
    try {
      // Try to update the physics body type based on rotation velocity
      // Not all physics bodies support dynamic type changing
      if (api.type && typeof api.type.set === 'function') {
        if (isKinematic) {
          api.type.set("Kinematic");
        } else {
          api.type.set("Dynamic");
        }
      }
      
      // Set angular velocity regardless of body type
      if (isKinematic) {
        const spinFactor = rotationVelocity * BASE_SPIN;
        api.angularVelocity.set(rfs(spinFactor), rfs(spinFactor), rfs(spinFactor));
      } else {
        // For dynamic bodies, stop rotation
        api.angularVelocity.set(0, 0, 0);
      }
      
      // Wake up the body to ensure changes take effect immediately
      api.wakeUp();
    } catch (error) {
      // Fallback for bodies that don't support certain operations
      console.log('Physics body does not support all operations', error);
      
      // Still try to set angular velocity which should work on most bodies
      try {
        if (isKinematic) {
          const spinFactor = rotationVelocity * BASE_SPIN;
          api.angularVelocity.set(rfs(spinFactor), rfs(spinFactor), rfs(spinFactor));
        } else {
          api.angularVelocity.set(0, 0, 0);
        }
      } catch (e) {
        console.error('Could not set angular velocity on physics body', e);
      }
    }
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
