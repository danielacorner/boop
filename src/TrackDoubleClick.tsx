import { useEventListener } from "./utils/hooks";
import { useDoubleClicked } from "./components/Collider/useDoubleClicked";
import { MouseEvent, MouseEventHandler, useCallback, useRef } from "react";

export function TrackDoubleClick() {
  const [, setDoubleclicked] = useDoubleClicked();
  // useEventListener("dblclick", () => {
  //   setDoubleclicked(true);
  // });
  // useDoubleTap(() => {
  //   setDoubleclicked(true);
  // });

  return null;
}

// https://github.com/minwork/use-double-tap/blob/master/src/index.ts
type EmptyCallback = () => void;

type CallbackFunction<Target = Element> =
  | MouseEventHandler<Target>
  | EmptyCallback;

type DoubleTapCallback<Target = Element> = CallbackFunction<Target> | null;

interface DoubleTapOptions<Target = Element> {
  onSingleTap?: CallbackFunction<Target>;
}

type DoubleTapResult<Target, Callback> =
  Callback extends CallbackFunction<Target>
    ? {
        onClick: CallbackFunction<Target>;
      }
    : Callback extends null
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      {}
    : never;
export function useDoubleTap<
  Target = Element,
  Callback extends DoubleTapCallback<Target> = DoubleTapCallback<Target>
>(
  callback: Callback,
  threshold = 300,
  options: DoubleTapOptions<Target> = {}
): DoubleTapResult<Target, Callback> {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const handler = useCallback<CallbackFunction<Target>>(
    (event: MouseEvent<Target>) => {
      if (!timer.current) {
        timer.current = setTimeout(() => {
          if (options.onSingleTap) {
            options.onSingleTap(event);
          }
          timer.current = null;
        }, threshold);
      } else {
        clearTimeout(timer.current);
        timer.current = null;
        callback && callback(event);
      }
    },
    [threshold, options, callback]
  );

  return (
    callback
      ? {
          onClick: handler,
        }
      : {}
  ) as DoubleTapResult<Target, Callback>;
}
