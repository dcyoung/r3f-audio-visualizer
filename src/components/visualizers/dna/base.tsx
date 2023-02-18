import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Curve,
  TubeGeometry,
  Vector3,
  Mesh,
  MeshBasicMaterial,
  InstancedMesh,
  BoxGeometry,
  Matrix4,
  Quaternion,
} from "three";
import {
  COORDINATE_TYPE,
  ICoordinateMapper,
  TWO_PI,
} from "../../coordinateMappers/common";

const clipAngleRad = (rad: number) => {
  return ((rad % TWO_PI) + TWO_PI) % TWO_PI;
};

class HelixCurve extends Curve<Vector3> {
  helixLength: number;
  helixRadius: number;
  helixWindingSeparation: number;
  helixStartingAngleRad: number;

  constructor(
    helixLength: number,
    helixRadius: number,
    helixWindingSeparation: number,
    helixStartingAngleRad: number = 0.0
  ) {
    super();
    this.helixLength = helixLength;
    this.helixRadius = helixRadius;
    this.helixWindingSeparation = helixWindingSeparation;
    this.helixStartingAngleRad = clipAngleRad(helixStartingAngleRad);
  }

  getPoint(t: number, optionalTarget = new Vector3()) {
    t -= 0.5; // center around 0
    const nWindings = this.helixLength / this.helixWindingSeparation;
    const tPerWinding = 1 / nWindings;
    const tRad = TWO_PI * ((t % tPerWinding) / tPerWinding);
    const x = this.helixRadius * Math.cos(tRad + this.helixStartingAngleRad);
    const y = this.helixRadius * Math.sin(tRad + this.helixStartingAngleRad);
    const z = this.helixLength * t;
    return optionalTarget.set(x, y, z);
  }
}

interface BaseDoubleHelixProps {
  coordinateMapper: ICoordinateMapper;
  helixLength?: number;
  helixRadius?: number;
  helixWindingSeparation?: number;
  strandRadius?: number;
  baseSpacing?: number;
  mirrorEffects?: boolean;
}
const BaseDoubleHelix = ({
  coordinateMapper,
  helixLength = 10.0,
  helixWindingSeparation = 10,
  helixRadius = 1.0,
  strandRadius = 0.1,
  baseSpacing = 0.35,
  mirrorEffects = true,
}: BaseDoubleHelixProps): JSX.Element => {
  const nBasePairs = Math.floor(helixLength / baseSpacing);
  const refBaseMesh = useRef<InstancedMesh>(null!);
  const matBase = useMemo(() => {
    return new MeshBasicMaterial({ color: "#606060" });
  }, []);
  const geoBase = useMemo(() => {
    const baseLength = helixRadius * 0.9;
    const geo = new BoxGeometry(strandRadius, strandRadius, baseLength, 1);
    for (let i = 0; i < geo.attributes.position.count; i++) {
      geo.attributes.position.setZ(
        i,
        geo.attributes.position.getZ(i) - baseLength / 2
      );
    }
    geo.attributes.position.needsUpdate = true;
    return geo;
  }, [helixRadius, strandRadius]);
  const refHelixMeshA = useRef<Mesh>(null!);
  const refHelixMeshB = useRef<Mesh>(null!);
  const matHelix = useMemo(() => {
    return new MeshBasicMaterial({ color: "#d9d9d9" });
  }, []);
  const [curveHelixA, geoHelixA, curveHelixB, geoHelixB] = useMemo(() => {
    const curveA = new HelixCurve(
      helixLength,
      helixRadius,
      helixWindingSeparation,
      0
    );
    const curveB = new HelixCurve(
      helixLength,
      helixRadius,
      helixWindingSeparation,
      Math.PI / 2
    );
    return [
      curveA,
      new TubeGeometry(curveA, 100, strandRadius, 12, false),
      curveB,
      new TubeGeometry(curveB, 100, strandRadius, 12, false),
    ];
  }, [helixLength, helixRadius, helixWindingSeparation, strandRadius]);
  const tmpMatrix = useMemo(() => new Matrix4(), []);
  const tmpVecA = useMemo(() => new Vector3(), []);
  const tmpVecB = useMemo(() => new Vector3(), []);
  const tmpVecScale = useMemo(() => new Vector3(), []);
  const tmpQuat = useMemo(() => new Quaternion(), []);
  const upVec = useMemo(() => new Vector3(0, 0, 1), []);

  useEffect(() => {
    // Initialize positions
    let normBpIdx = 0;
    for (let bpIdx = 0; bpIdx < nBasePairs; bpIdx++) {
      normBpIdx = bpIdx / Math.max(nBasePairs - 1, 1);

      curveHelixA.getPoint(normBpIdx, tmpVecA);
      curveHelixB.getPoint(normBpIdx, tmpVecB);

      // Base A
      tmpMatrix.lookAt(tmpVecA, tmpVecB, upVec);
      tmpMatrix.setPosition(tmpVecA);
      refBaseMesh.current.setMatrixAt(bpIdx * 2, tmpMatrix);

      // Base B
      tmpMatrix.lookAt(tmpVecB, tmpVecA, upVec);
      tmpMatrix.setPosition(tmpVecB);
      refBaseMesh.current.setMatrixAt(bpIdx * 2 + 1, tmpMatrix);
    }
    refBaseMesh.current.instanceMatrix.needsUpdate = true;
  }, [curveHelixA, curveHelixB, refBaseMesh]);

  useFrame(({ clock }) => {
    const elapsedTimeSec = clock.getElapsedTime();
    let normBpIdx = 0,
      targetScale = 0;
    const targetScaleMin = 0.25;
    const targetScaleMax = 1.0;
    const eps = 1 ** -5;
    for (let bpIdx = 0; bpIdx < nBasePairs; bpIdx++) {
      normBpIdx = bpIdx / Math.max(nBasePairs - 1, 1);

      // Range -1:1
      targetScale =
        coordinateMapper.map(
          COORDINATE_TYPE.CARTESIAN_1D,
          mirrorEffects ? Math.abs(normBpIdx - 0.5) : normBpIdx,
          0,
          0,
          elapsedTimeSec
        ) / coordinateMapper.amplitude;
      // Range min:max
      targetScale =
        targetScaleMin +
        ((1 + targetScale) / 2) * (targetScaleMax - targetScaleMin);

      // Base A
      refBaseMesh.current.getMatrixAt(bpIdx * 2, tmpMatrix);
      tmpMatrix.decompose(tmpVecA, tmpQuat, tmpVecScale);
      tmpVecScale.setZ(targetScale / tmpVecScale.z);
      tmpMatrix.scale(tmpVecScale);
      refBaseMesh.current.setMatrixAt(bpIdx * 2, tmpMatrix);
      // Base B
      refBaseMesh.current.getMatrixAt(bpIdx * 2 + 1, tmpMatrix);
      tmpMatrix.decompose(tmpVecB, tmpQuat, tmpVecScale);
      tmpVecScale.setZ(targetScale / tmpVecScale.z);
      tmpMatrix.scale(tmpVecScale);
      refBaseMesh.current.setMatrixAt(bpIdx * 2 + 1, tmpMatrix);
    }
    refBaseMesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh
        ref={refHelixMeshA}
        geometry={geoHelixA}
        material={matHelix}
        castShadow={true}
        receiveShadow={true}
      />
      <mesh
        ref={refHelixMeshB}
        geometry={geoHelixB}
        material={matHelix}
        castShadow={true}
        receiveShadow={true}
      />
      <instancedMesh
        ref={refBaseMesh}
        args={[geoBase, matBase, 2 * nBasePairs]}
        castShadow={true}
        receiveShadow={true}
      />
    </group>
  );
};

export default BaseDoubleHelix;
