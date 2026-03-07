import { useEffect, useMemo, useRef } from "react";
import { type TVisualProps } from "@/components/visualizers/models";
import { usePalette } from "@/lib/appState";
import { ColorPalette } from "@/lib/palettes";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type AnimationClip, type Group, type Mesh } from "three";
import { type GLTF } from "three-stdlib";

import MODEL_HORSE from "./horse.png";

type ActionName = "horse_A_";

interface GLTFAction extends AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    mesh_0: Mesh;
  };
  materials: Record<string, never>;
  animations: GLTFAction[];
};

const Horse = (_: TVisualProps) => {
  const group = useRef<Group>(null);
  const { nodes, animations } = useGLTF(MODEL_HORSE) as unknown as GLTFResult;
  const palette = usePalette();
  const lut = ColorPalette.getPalette(palette).buildLut();

  const material = useMemo(() => {
    // const mat = nodes.mesh_0.material as MeshStandardMaterial;
    return (
      <meshStandardMaterial
        color={lut.getColor(0.5)}
        flatShading={true}
        // vertexColors={mat.vertexColors}
        // blendColor={mat.blendColor}
        // userData={mat.userData}
        // defines={mat.defines}
        // emissive={mat.emissive}
        // normalScale={mat.normalScale}
        // flatShading={mat.flatShading}
      />
    );
  }, [lut]);

  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    actions?.horse_A_?.play();
  });

  useFrame(({ elapsed }) => {
    const t = elapsed;

    const rateOfChange = 0.5;
    const tScale = (Math.sin(rateOfChange * t) + 1) / 2;
    actions?.horse_A_?.setEffectiveTimeScale(tScale);
  });

  return (
    <group
      ref={group}
      scale={[0.025, 0.025, 0.025]}
      rotation={[Math.PI / 2, Math.PI, 0]}
      // {...props}
      dispose={null}
    >
      <group name="AuxScene">
        <pointLight position={[10, 100, 200]} intensity={100} />
        <mesh
          name="mesh_0"
          castShadow
          receiveShadow
          geometry={nodes.mesh_0.geometry}
          // material={nodes.mesh_0.material}
          morphTargetDictionary={nodes.mesh_0.morphTargetDictionary}
          morphTargetInfluences={nodes.mesh_0.morphTargetInfluences}
        >
          {material}
        </mesh>
      </group>
    </group>
  );
};

export default Horse;
