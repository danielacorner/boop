/* eslint-disable react/no-unknown-property */
import { MeshRefractionMaterial, useGLTF, CubeCamera } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
// import { useControls } from "leva";
import { useRef } from "react";
import { RGBELoader } from "three-stdlib";

export default function Diamond(props) {
  const ref = useRef();
  const { nodes } = useGLTF("/models/dflat.glb");
  // Use a custom envmap/scene-backdrop for the diamond material
  // This way we can have a clear BG while cube-cam can still film other objects
  const texture = useLoader(RGBELoader, "/adamsbridge.hdr");
  // Optional config
  // const config = useControls({
  //   bounces: { value: 4, min: 0, max: 8, step: 1 },
  //   aberrationStrength: { value: 0.01, min: 0, max: 0.1, step: 0.01 },
  //   ior: { value: 2.4, min: 0, max: 10 },
  //   fresnel: { value: 1, min: 0, max: 1 },
  //   color: "white",
  //   fastChroma: false,
  // });
  return (
    <CubeCamera resolution={256} frames={1} envMap={texture}>
      {(texture) => (
        <mesh
          castShadow={true}
          ref={ref}
          geometry={nodes.Diamond_1_0.geometry}
          {...props}
        >
          <MeshRefractionMaterial
            envMap={texture}
            // {...config}
            toneMapped={false}
          />
        </mesh>
      )}
    </CubeCamera>
  );
}
