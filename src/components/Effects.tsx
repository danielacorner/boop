/* eslint-disable react/no-unknown-property */
import { Effects as EffectComposer } from "@react-three/drei";
import { extend, useThree } from "@react-three/fiber";
import { SSAOPass } from "three-stdlib";

export function Effects(props) {
  const { scene, camera } = useThree();
  return (
    <EffectComposer {...props}>
      <sSAOPass
        args={[scene, camera, 100, 100]}
        kernelRadius={0.1}
        kernelSize={0}
      />
    </EffectComposer>
  );
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      sSAOPass: any;
      marquee: any;
    }
  }
}
extend({ SSAOPass });
