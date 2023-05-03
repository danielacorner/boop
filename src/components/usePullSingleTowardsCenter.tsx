import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PublicApi } from "@react-three/cannon";
import { PULL_FORCE } from "../utils/constants";

const CENTER_VEC = new THREE.Vector3(0, 0, 0);
export function usePullSingleTowardsCenter({
  position,
  api,
  pulledItem,
}: {
  position?: [number, number, number] | null;
  api?: PublicApi;
  pulledItem: React.MutableRefObject<[number, number, number]>;
}) {
  useFrame(() => {
    // api.applyForce(
    //   new THREE.Vector3(
    //     pulledItem.current[0],
    //     pulledItem.current[1],
    //     pulledItem.current[2]
    //   )
    //     .normalize()
    //     .multiplyScalar(-50)
    //     .toArray(),
    //   [0, 0, 0]
    // );
    // drive it towards center or a specified point
    const force2 = new THREE.Vector3()
      // add the position
      .addVectors(
        new THREE.Vector3(
          pulledItem.current[0],
          pulledItem.current[1],
          pulledItem.current[2]
        ),
        position
          ? new THREE.Vector3(position[0], position[1], position[2])
          : CENTER_VEC
      )
      // then normalize and
      // multiply by a negative scalar to send it towards that point
      .normalize()
      .multiplyScalar(-50 * PULL_FORCE)
      .toArray();

    if (!api) {
      return;
    }
    api.applyForce(force2, [0, 0, 0]);
  });
}
