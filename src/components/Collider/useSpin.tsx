import { rfs } from "../../utils/hooks";
import { useInterval, useMount } from "react-use";
import { useMusic } from "../UI/Music/Music";
const SPIN = 5;
export function useSpin(api) {
  useMount(() => {
    api.angularVelocity.set(rfs(SPIN), rfs(SPIN), rfs(SPIN));
  });
  const [{ autoMode, bpm }] = useMusic();
  const secondsPerBeat = 60 / bpm;
  useInterval(() => {
    if (!autoMode) {
      return;
    }
    api.angularVelocity.set(rfs(SPIN), rfs(SPIN), rfs(SPIN));
  }, secondsPerBeat * 1000);
}
