import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PublicApi } from "@react-three/cannon";

export function usePullSingleTowardsCenter({
  position,
  api,
  d20Position,
}: {
  position: [number, number, number] | null;
  api?: PublicApi;
  d20Position: React.MutableRefObject<[number, number, number]>;
}) {
  useFrame(() => {
    // api.applyForce(
    //   new THREE.Vector3(
    //     d20Position.current[0],
    //     d20Position.current[1],
    //     d20Position.current[2]
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
          d20Position.current[0],
          d20Position.current[1],
          d20Position.current[2]
        ),
        new THREE.Vector3(
          position ? position[0] : 0,
          position ? position[1] : 0,
          position ? position[2] : 0
        )
      )
      // then normalize and
      // multiply by a negative scalar to send it towards that point
      .normalize()
      .multiplyScalar(-50)
      .toArray();

    if (!api) {
      return;
    }
    api.applyForce(force2, [0, 0, 0]);
  });
}
