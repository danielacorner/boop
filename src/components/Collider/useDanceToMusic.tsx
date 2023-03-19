import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { rfs } from "../../utils/hooks";
import { useAtom } from "jotai";
import { musicAtom } from "../UI/Music/Music";
import { MUSIC } from "../UI/Music/MUSIC_DATA";
import { usePositions } from "../../store/store";
import { COLLIDER_LERP_SPEED } from "../../utils/constants";

export function useDanceToMusic({
  api,
  position,
  isTabActive,
  colliderRadius,
}) {
  const { isExpanded } = usePositions();
  const { viewport } = useThree();
  const [{ playing, trackNumber, autoMode }] = useAtom(musicAtom);
  const { bpm } = MUSIC[trackNumber];

  const bps = bpm / 60;
  const secondsPerBeat = 1 / bps;
  const nextBeat = useRef({ time: 0, number: 0, lerpSpeed: 1 });
  const nextPosition = useRef<[number, number, number]>([0, 0, 0]);

  const moveDistanceMultiplier = isExpanded ? 1.5 : 1;

  // TODO record nextBeat even when not autoMode
  useFrame(({ clock: { elapsedTime } }) => {
    if (!bps || !playing || !isTabActive.current) {
      return;
    }
    // set the first beat when they turn on the music
    if (!nextBeat.current.time) {
      nextBeat.current = {
        ...nextBeat.current,
        number: 0,
        time: elapsedTime + secondsPerBeat,
      };
    }

    // time for the next beat
    else if (elapsedTime >= nextBeat.current.time) {
      // beat it!
      const beatNum: 1 | 2 | 3 | 4 = ((nextBeat.current.number % 4) + 1) as
        | 1
        | 2
        | 3
        | 4;

      nextBeat.current = {
        ...nextBeat.current,
        number: nextBeat.current.number + 1,
        time: nextBeat.current.time + secondsPerBeat,
      };

      let minDistance = 0;
      // eslint-disable-next-line prefer-const
      let maxDistance = Infinity;
      // the first beat is 4x size
      if (beatNum === 1) {
        nextBeat.current = { ...nextBeat.current, lerpSpeed: 1 + rfs(0.25) };
        minDistance = Math.min(
          viewport.width * 0.75,
          viewport.height * 0.75,
          colliderRadius * 4
        );
      }

      // the third beat is 2x size
      else if (beatNum === 3) {
        nextBeat.current = { ...nextBeat.current, lerpSpeed: 0.75 + rfs(0.25) };
        minDistance = Math.min(
          viewport.width * 0.75,
          viewport.height * 0.75,
          colliderRadius * 2
        );
        maxDistance = colliderRadius * 3; // ?
      }

      // second, fourth beats are 1x size
      else if ([2, 4].includes(beatNum)) {
        nextBeat.current = { ...nextBeat.current, lerpSpeed: 0.5 + rfs(0.25) };
        minDistance = Math.min(viewport.width, viewport.height, colliderRadius);
        maxDistance = colliderRadius * 2;
      }

      // on the first and third beats, intersect through the middle of the screen
      const intersect = [1].includes(beatNum);
      nextPosition.current = getNextPosition(
        nextPosition.current,
        { minDistance, maxDistance },
        viewport,
        0,
        intersect,
        moveDistanceMultiplier
      );
    }

    if (autoMode) {
      api.position.set(
        THREE.MathUtils.lerp(
          position.current[0],
          nextPosition.current[0],
          COLLIDER_LERP_SPEED *
            nextBeat.current.lerpSpeed *
            (1 / moveDistanceMultiplier)
        ),
        THREE.MathUtils.lerp(
          position.current[1],
          nextPosition.current[1],
          COLLIDER_LERP_SPEED *
            nextBeat.current.lerpSpeed *
            (1 / moveDistanceMultiplier)
        ),
        0
      );
    }
  });
}
function getNextPosition(
  currentPosition: [number, number, number],
  { minDistance, maxDistance }: { minDistance: number; maxDistance: number },
  viewport,
  attemps = 0,
  intersect: boolean,
  multiplier: number
): [number, number, number] {
  const initialNextPosition: [number, number, number] = [
    rfs(viewport.width) * multiplier,
    rfs(viewport.height) * multiplier,
    0,
  ];
  let nextPosition = initialNextPosition;
  if (intersect) {
    nextPosition = [
      // make sure x and y have flipped
      (Math.sign(nextPosition[0]) === Math.sign(currentPosition[0]) ? -1 : 1) *
        nextPosition[0],
      (Math.sign(nextPosition[1]) === Math.sign(currentPosition[1]) ? -1 : 1) *
        nextPosition[1],
      0,
    ];
  }
  const distance = getDistanceBetweenPoints(currentPosition, nextPosition);
  if (
    distance < minDistance ||
    (distance > maxDistance * multiplier && attemps < 10)
  ) {
    nextPosition = getNextPosition(
      currentPosition,
      { minDistance, maxDistance },
      viewport,
      attemps + 1,
      intersect,
      multiplier
    );
  }
  return nextPosition;
}
function getDistanceBetweenPoints([x1, y1, z1], [x2, y2, z2]) {
  return Math.sqrt(
    Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2)
  );
}
