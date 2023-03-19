import { rfs } from "../../utils/hooks";
import { useMount } from "react-use";

export function useSpin(api) {
  useMount(() => {
    api.angularVelocity.set(rfs(1), rfs(1), rfs(1));
  });
}
