import { useEffect, useMemo, useRef } from "react";
import { type ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";
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
    step((deltaTimeSec * 1000) / sloMoX);
  });
  return <></>;
};

const CHANNEL_COLORS = ["white", "yellow", "red", "green"] as const;

const NeuronVisual = () => {
  const ring = useHistory();
  const cubeSideLength = 0.02;
  const n = ring.getSize();
  const vMMeshRef = useRef<InstancedMesh>(null!);
  const iKMeshRef = useRef<InstancedMesh>(null!);
  const iNaMeshRef = useRef<InstancedMesh>(null!);
  const iKLeakMeshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);

  useFrame(() => {
    const sizeX = n * 2 * cubeSideLength;
    let normX, x, data, Vm, Ik, INa, IKLeak;
    for (let instanceIdx = 0; instanceIdx < n; instanceIdx++) {
      data = ring.get(instanceIdx);
      normX = instanceIdx / (n - 1);
      x = sizeX * (normX - 0.5);
      Vm = data?.VM ?? NaN;
      Ik = data?.IK ?? NaN;
      INa = data?.INa ?? NaN;
      IKLeak = data?.IKleak ?? NaN;
      tmpMatrix.setPosition(
        x,
        0 * cubeSideLength,
        isNaN(Vm) ? 0 : Vm * cubeSideLength,
      );
      vMMeshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
      tmpMatrix.setPosition(
        x,
        2 * cubeSideLength,
        isNaN(Ik) ? 0 : (Ik * cubeSideLength) / 10,
      );
      iKMeshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
      tmpMatrix.setPosition(
        x,
        4 * cubeSideLength,
        isNaN(INa) ? 0 : (INa * cubeSideLength) / 10,
      );
      iNaMeshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
      tmpMatrix.setPosition(
        x,
        6 * cubeSideLength,
        isNaN(INa) ? 0 : IKLeak * cubeSideLength,
      );
      iKLeakMeshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
    }
    vMMeshRef.current.instanceMatrix.needsUpdate = true;
    iKMeshRef.current.instanceMatrix.needsUpdate = true;
    iNaMeshRef.current.instanceMatrix.needsUpdate = true;
    iKLeakMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  const meshRefs = [vMMeshRef, iKMeshRef, iNaMeshRef, iKLeakMeshRef];

  return (
    <>
      {meshRefs.map((ref, idx) => (
        <instancedMesh
          ref={ref}
          key={`neuron-channel-${idx}`}
          castShadow={true}
          receiveShadow={true}
          args={[new BoxGeometry(), new MeshBasicMaterial(), n]}
        >
          <boxGeometry
            attach="geometry"
            args={[cubeSideLength, cubeSideLength, cubeSideLength, 1]}
          />
          <meshPhongMaterial
            attach="material"
            color={CHANNEL_COLORS[idx]}
            toneMapped={false}
          />
        </instancedMesh>
      ))}
    </>
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
