import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PublicApi } from "@react-three/cannon";
import { PULL_FORCE } from "../../utils/constants";
const CENTER_VEC = new THREE.Vector3(0, 0, 0);
export function usePullTowardsCenter({
  sphereRef,
  vec,
  position,
  mat,
  api,
  numNodes,
}: {
  sphereRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  vec: THREE.Vector3;
  position: [number, number, number] | null;
  mat: THREE.Matrix4;
  api: PublicApi;
  numNodes: number;
}) {
  useFrame((state) => {
    if (!sphereRef?.current) {
      return;
    }
    for (let i = 0; i < numNodes; i++) {
      // Get current whereabouts of the instanced sphere
      sphereRef.current.getMatrixAt(i, mat);

      // drive it towards center or a specified point
      const force1 = vec.setFromMatrixPosition(mat);
      const force2 = force1
        // add the position
        .addVectors(
          force1,
          position
            ? new THREE.Vector3(position[0], position[1], position[2])
            : CENTER_VEC
        )
        // then normalize and
        // multiply by a negative scalar to send it towards that point
        .normalize()
        .multiplyScalar(-50 * PULL_FORCE)
        .toArray();
      const apiAtI = api.at(i);
      apiAtI?.applyForce(force2, [0, 0, 0]);
    }
  });
}
