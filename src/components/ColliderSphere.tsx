import { Sphere, useDetectGPU } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { useEffect, useRef, useState } from "react";
import { useEventListener, getPosition } from "../utils/hooks";
import { GROUP1, GROUP2 } from "../utils/constants";

export function ColliderSphere() {
  const { viewport, size } = useThree();
  const state1 = GROUP1;
  const state2 = GROUP2;
  const [collisionFilterGroup, setCollisionFilterGroup] = useState<any>(state1);
  useEventListener("dblclick", () => {
    setCollisionFilterGroup(collisionFilterGroup === state1 ? state2 : state1);
    console.log(
      "🌟🚨 ~ file: Clump.tsx ~ line 37 ~ useEventListener ~ collisionFilterGroup",
      collisionFilterGroup
    );
  });
  const gpu = useDetectGPU();
  const colliderRadius = gpu.tier > 2 ? 3 : 2;

  // A collision is allowed if
  // (bodyA.collisionFilterGroup & bodyB.collisionFilterMask) && (bodyB.collisionFilterGroup & bodyA.collisionFilterMask)
  //  These are indeed bitwise operations. https://en.wikipedia.org/wiki/Bitwise_operation#Truth_table_for_all_binary_logical_operators
  // examples https://github.com/schteppe/cannon.js/blob/master/demos/collisionFilter.html#L50
  const [ref, api] = useSphere<any>(
    () => ({
      type: "Kinematic",
      args: [colliderRadius],
      position: [0, 0, 0],
      collisionFilterGroup, // Put the sphere in group 1
      collisionFilterMask: GROUP1 | GROUP2, // it can only collide with GROUP1
      // collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
      // collisionFilterMask,
    }),
    null
    // [collisionFilterMask]
  );

  // subscribe to sphere position
  const position = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((v) => (position.current = v)), [api]);

  const touchingRef = useRef<[number, number, number] | null>(null);
  useFrame((state) => {
    const nextX =
      ((touchingRef.current?.[0] ?? state.pointer.x) * viewport.width) / 2;
    const nextY =
      ((touchingRef.current?.[1] ?? state.pointer.y) * viewport.height) / 2;
    const nextXL = THREE.MathUtils.lerp(position.current[0], nextX, 0.24);
    const nextYL = THREE.MathUtils.lerp(position.current[1], nextY, 0.24);
    return api.position.set(nextXL, nextYL, 0);
  });

  useEventListener("touchmove", (event) => {
    touchingRef.current = getPosition({
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
      size,
      viewport,
    });
  });

  useEventListener("click", (event) => {
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });
  useEventListener("mousemove", (event) => {
    touchingRef.current = getPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      size,
      viewport,
    });
  });

  // double click to change width
  const [big, setBig] = useState(false);
  useEventListener("dblclick", (event) => {
    setBig(true);
    const timer = setTimeout(() => {
      setBig(false);
    }, 1000);
    return () => clearTimeout(timer);
  });
  useFrame((state) => {
    const nextRadius = colliderRadius * (big ? 2 : 1);
    // const lerp = THREE.MathUtils.lerp(api.args[0], nextRadius, 0.24);
    // console.log(
    //   "🌟🚨 ~ file: ColliderSphere.tsx ~ line 72 ~ useFrame ~ api",
    //   api
    // );
    // console.log(
    //   "🌟🚨 ~ file: ColliderSphere.tsx ~ line 77 ~ useFrame ~ ref.current.scale",
    //   ref.current.scale
    // );
  });
  return (
    <Sphere ref={ref} args={[colliderRadius, 32, 32]}>
      <meshPhysicalMaterial
        transmission={1}
        thickness={colliderRadius / 2}
        roughness={0}
      />
    </Sphere>
  );
}
