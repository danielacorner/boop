/* eslint-disable react/no-unknown-property */
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { useEffect, useRef, useState } from "react";
import { useEventListener, getPosition, rfs } from "../utils/hooks";
import { GROUP1, GROUP2, POSITIONS } from "../utils/constants";
import { useSpring, animated } from "@react-spring/three";
import { useAtom } from "jotai";
import { musicAtom } from "./UI/Music/Music";
import { MUSIC } from "./UI/Music/MUSIC_DATA";
import { positionsAtom } from "../store/store";

const LERP_SPEED = 0.4;
const COLLIDER_RADIUS = 2;

export function ColliderSphere() {
  const { viewport, size } = useThree();
  const [{ playing, trackNumber, autoMode }] = useAtom(musicAtom);
  const { bpm } = MUSIC[trackNumber];

  // on double click, keep the sphere interactive with the clumps
  const [doubleclicked, setDoubleclicked] = useState(false);
  useEventListener("dblclick", () => {
    setDoubleclicked(!doubleclicked);
  });

  // const {tier} = useDetectGPU();
  const [positions] = useAtom(positionsAtom);
  const isExpanded = positions.dodeca === POSITIONS.secondary.dodeca;
  const colliderRadiusMultiplier = isExpanded ? 0.6 : 1;
  const colliderRadius = colliderRadiusMultiplier * COLLIDER_RADIUS;

  const shouldLerpRef = useRef<boolean>(true);

  // A collision is allowed if
  // (bodyA.collisionFilterGroup & bodyB.collisionFilterMask) && (bodyB.collisionFilterGroup & bodyA.collisionFilterMask)
  //  These are indeed bitwise operations. https://en.wikipedia.org/wiki/Bitwise_operation#Truth_table_for_all_binary_logical_operators
  // examples https://github.com/schteppe/cannon.js/blob/master/demos/collisionFilter.html#L50
  const [sphereRef, api] = useSphere<any>(
    () => ({
      name: "colliderSphere",
      type: "Kinematic",
      args: [colliderRadius],
      position: [0, 0, 0],
      collisionFilterGroup: GROUP1, // Put the sphere in group 1
      collisionFilterMask: GROUP1 | GROUP2, // It can only collide with group 1 and 2
      // collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
      // collisionFilterMask,
    }),
    null,
    [doubleclicked, colliderRadius]
  );

  // subscribe to sphere position
  const position = useRef([0, 0, 0]);
  useEffect(
    () => api.position.subscribe((v) => (position.current = v)),
    [api, colliderRadius]
  );

  const touchingRef = useRef<[number, number, number] | null>(null);

  const isTabActive = useRef(true);
  useEventListener("visibilitychange", () => {
    if (document.hidden) {
      console.log("not visible");
      isTabActive.current = false;
    } else {
      console.log("is visible");
      isTabActive.current = true;
    }
  });

  useFrame((state) => {
    if (autoMode || !isTabActive.current) {
      return;
    }
    const nextX =
      ((touchingRef.current?.[0] ?? state.pointer.x) * viewport.width) / 2;
    const nextY =
      ((touchingRef.current?.[1] ?? state.pointer.y) * viewport.height) / 2;
    const nextXL = THREE.MathUtils.lerp(position.current[0], nextX, LERP_SPEED);
    const nextYL = THREE.MathUtils.lerp(position.current[1], nextY, LERP_SPEED);
    return api.position.set(
      shouldLerpRef.current ? nextXL : nextX,
      shouldLerpRef.current ? nextYL : nextY,
      0
    );
  });
  useEventListener("touchmove", (event) => {
    shouldLerpRef.current = false;
    // performance.regress();
    touchingRef.current = getPosition({
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
      size,
      viewport,
    });
  });

  useEventListener("click", (event) => {
    shouldLerpRef.current = true;
    // performance.regress();
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });
  useEventListener("mousemove", (event) => {
    shouldLerpRef.current = false;
    // performance.regress();
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });

  // double click to change width
  const [dblClicked, setDblClicked] = useState(false);
  useEventListener("dblclick", (event) => {
    setDblClicked(true);
    const timer = setTimeout(() => {
      setDblClicked(false);
    }, 1000);
    return () => clearTimeout(timer);
  });
  const { scale } = useSpring({
    scale: (dblClicked ? [1.2, 1.2, 1.2] : [1, 1, 1]) as [
      number,
      number,
      number
    ],
    config: {
      mass: 0.5,
      tension: 500,
      friction: 7,
    },
  });

  // fake bpm-based dancing when music is playing
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
          LERP_SPEED * nextBeat.current.lerpSpeed * (1 / moveDistanceMultiplier)
        ),
        THREE.MathUtils.lerp(
          position.current[1],
          nextPosition.current[1],
          LERP_SPEED * nextBeat.current.lerpSpeed * (1 / moveDistanceMultiplier)
        ),
        0
      );
    }
  });

  return (
    <animated.mesh name="colliderSphere" ref={sphereRef} scale={scale}>
      <Sphere
        args={[COLLIDER_RADIUS, 32, 32]}
        matrixWorldAutoUpdate={undefined}
        getObjectsByProperty={undefined}
        getVertexPosition={undefined}
      >
        <meshPhysicalMaterial
          transmission={1}
          thickness={colliderRadius / 2}
          roughness={0}
        />
      </Sphere>
    </animated.mesh>
  );
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
