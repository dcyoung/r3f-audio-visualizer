import { useEffect, useMemo, useRef } from "react";
import { usePalette } from "@/lib/appState";
import { type ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";
import { ColorPalette } from "@/lib/palettes";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  Matrix4,
  MeshBasicMaterial,
  type InstancedMesh,
} from "three";

import { useActions, useHistory } from "./store";

const StimulusCurrentControls = () => {
  const { setStimulusCurrent } = useActions();
  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener("keydown", () => setStimulusCurrent(20), {
      signal: controller.signal,
    });
    window.addEventListener("keyup", () => setStimulusCurrent(0), {
      signal: controller.signal,
    });
    return () => {
      controller.abort();
    };
  }, [setStimulusCurrent]);
  return <></>;
};

const NeuronSim = () => {
  const { step } = useActions();
  const sloMoX = 500;
  useFrame((_, deltaTimeSec) => {
    // sim - in ms, scaled for slo-mo
    step((deltaTimeSec * 1000) / sloMoX);
  });
  return <></>;
};

const NeuronVisual = () => {
  const ring = useHistory();
  const cubeSideLength = 0.02;
  const n = ring.getSize();
  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);
  const palette = usePalette();
  const lut = ColorPalette.getPalette(palette).buildLut();

  // Recolor
  useEffect(() => {
    if (!lut) {
      return;
    }
    for (let instanceIdx = 0; instanceIdx < n; instanceIdx++) {
      meshRef.current.setColorAt(
        instanceIdx,
        lut.getColor(instanceIdx / (n - 1)),
      );
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  });

  useFrame(() => {
    // in ms
    const sizeX = n * 2 * cubeSideLength;
    let normX, x, data, z, Vm;
    for (let instanceIdx = 0; instanceIdx < n; instanceIdx++) {
      data = ring.get(instanceIdx);
      normX = instanceIdx / (n - 1);
      x = sizeX * (normX - 0.5);
      // console.log(data?.VM);
      Vm = data?.VM ?? NaN;
      z = isNaN(Vm) ? 0 : Vm * cubeSideLength;
      tmpMatrix.setPosition(x, 0, z);
      meshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
    }
    // Update the instance
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={meshRef}
      castShadow={true}
      receiveShadow={true}
      args={[new BoxGeometry(), new MeshBasicMaterial(), n]}
    >
      <boxGeometry
        attach="geometry"
        args={[cubeSideLength, cubeSideLength, cubeSideLength, 1]}
      />
      <meshPhongMaterial attach="material" color="white" toneMapped={false} />
    </instancedMesh>
  );
};
const BaseNeuron = (_: { coordinateMapper: ICoordinateMapper }) => {
  return (
    <>
      <StimulusCurrentControls />
      <NeuronSim />
      <NeuronVisual />
    </>
  );
};

export default BaseNeuron;
