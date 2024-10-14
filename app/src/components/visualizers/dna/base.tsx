import { forwardRef, useEffect, useMemo, useRef } from "react";
import { usePalette } from "@/lib/appState";
import {
  COORDINATE_TYPE,
  TWO_PI,
  type ICoordinateMapper,
} from "@/lib/mappers/coordinateMappers/common";
import { ColorPalette } from "@/lib/palettes";
import { useFrame, type GroupProps } from "@react-three/fiber";
import {
  BoxGeometry,
  Curve,
  Euler,
  MathUtils,
  Matrix4,
  MeshBasicMaterial,
  Quaternion,
  TubeGeometry,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
} from "three";

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
    helixStartingAngleRad = 0.0,
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

const distBetweenPointsOnCircle = (r: number, angDiffRad: number) => {
  return Math.hypot(r * Math.sin(angDiffRad), r * Math.cos(angDiffRad) - r);
};

export interface BaseDoubleHelixProps {
  coordinateMapper: ICoordinateMapper;
  helixLength?: number;
  helixRadius?: number;
  helixWindingSeparation?: number;
  strandRadius?: number;
  baseSpacing?: number;
  strandOffsetRad?: number;
  mirrorEffects?: boolean;
  fixedBaseGap?: boolean;
}

export const BaseDoubleHelix = forwardRef<
  Group,
  Omit<GroupProps, "children"> & BaseDoubleHelixProps
>(
  (
    {
      coordinateMapper,
      helixLength = 10.0,
      helixWindingSeparation = 10,
      helixRadius = 1.0,
      strandRadius = 0.1,
      baseSpacing = 0.35,
      strandOffsetRad = Math.PI / 2,
      mirrorEffects = true,
      fixedBaseGap = true,
      ...props
    },
    ref,
  ) => {
    const palette = usePalette();
    const lut = ColorPalette.getPalette(palette).buildLut();
    const nBasePairs = Math.floor(helixLength / baseSpacing);
    const refBaseMesh = useRef<InstancedMesh>(null!);
    const matBase = useMemo(() => {
      return new MeshBasicMaterial({ color: "#606060" });
    }, []);
    const geoBase = useMemo(() => {
      const helixGap = distBetweenPointsOnCircle(helixRadius, strandOffsetRad);
      const baseLength = 0.45 * helixGap;
      // const geo = new CylinderGeometry(
      //   strandRadius,
      //   strandRadius,
      //   baseLength,
      //   12,
      //   1
      // );
      // geo.rotateX(Math.PI / 2);
      const geo = new BoxGeometry(strandRadius, strandRadius, baseLength, 1);
      for (let i = 0; i < geo.attributes.position.count; i++) {
        geo.attributes.position.setZ(
          i,
          geo.attributes.position.getZ(i) - baseLength / 2,
        );
      }
      geo.attributes.position.needsUpdate = true;
      return geo;
    }, [helixRadius, strandRadius, strandOffsetRad]);
    const refHelixMeshA = useRef<Mesh>(null!);
    const refHelixMeshB = useRef<Mesh>(null!);
    const matHelix = useMemo(() => {
      // return new MeshBasicMaterial({ color: "#d9d9d9" });
      return new MeshBasicMaterial({ color: lut.getColor(0.5) });
    }, [lut]);
    const [curveHelixA, geoHelixA, curveHelixB, geoHelixB] = useMemo(() => {
      const curveA = new HelixCurve(
        helixLength,
        helixRadius,
        helixWindingSeparation,
        0,
      );
      const curveB = new HelixCurve(
        helixLength,
        helixRadius,
        helixWindingSeparation,
        strandOffsetRad,
      );
      return [
        curveA,
        new TubeGeometry(curveA, 100, strandRadius, 12, false),
        curveB,
        new TubeGeometry(curveB, 100, strandRadius, 12, false),
      ];
    }, [
      helixLength,
      helixRadius,
      helixWindingSeparation,
      strandRadius,
      strandOffsetRad,
    ]);

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
        const tagA = Math.floor(3.99 * MathUtils.seededRandom(bpIdx));
        const tagB = 3 - tagA;

        curveHelixA.getPoint(normBpIdx, tmpVecA);
        curveHelixB.getPoint(normBpIdx, tmpVecB);

        // Base A
        tmpMatrix.setPosition(tmpVecA);
        tmpMatrix.lookAt(tmpVecA, tmpVecB, upVec);
        refBaseMesh.current.setMatrixAt(bpIdx * 2, tmpMatrix);
        refBaseMesh.current.setColorAt(bpIdx * 2, lut.getColor(tagA / 3));

        // Base B
        tmpMatrix.setPosition(tmpVecB);
        tmpMatrix.lookAt(tmpVecB, tmpVecA, upVec);
        refBaseMesh.current.setMatrixAt(bpIdx * 2 + 1, tmpMatrix);
        refBaseMesh.current.setColorAt(bpIdx * 2 + 1, lut.getColor(tagB / 3));
      }
      refBaseMesh.current.instanceMatrix.needsUpdate = true;
      refBaseMesh.current.instanceColor!.needsUpdate = true;
    }, [
      curveHelixA,
      curveHelixB,
      refBaseMesh,
      nBasePairs,
      lut,
      tmpMatrix,
      tmpVecA,
      tmpVecB,
      upVec,
    ]);

    useFrame(({ clock }) => {
      const elapsedTimeSec = clock.getElapsedTime();
      let normBpIdx = 0,
        targetScale = 0,
        targetScaleA = 0,
        targetScaleB = 0;
      const targetScaleMin = 0.25;
      const targetScaleMax = 1.0;
      for (let bpIdx = 0; bpIdx < nBasePairs; bpIdx++) {
        normBpIdx = bpIdx / Math.max(nBasePairs - 1, 1);

        // Range -1:1
        targetScale =
          coordinateMapper.map(
            COORDINATE_TYPE.CARTESIAN_1D,
            mirrorEffects ? 2 * Math.abs(normBpIdx - 0.5) : normBpIdx,
            0,
            0,
            elapsedTimeSec,
          ) / coordinateMapper.amplitude;
        // Range 0:1
        targetScale = (1 + targetScale) / 2;

        // Range min:max
        targetScaleA =
          targetScaleMin +
          (fixedBaseGap ? 2 * targetScale : targetScale) *
            (targetScaleMax - targetScaleMin);
        targetScaleB = fixedBaseGap
          ? targetScaleMin +
            2 * (1 - targetScale) * (targetScaleMax - targetScaleMin)
          : targetScaleA;

        // Base A
        refBaseMesh.current.getMatrixAt(bpIdx * 2, tmpMatrix);
        tmpMatrix.decompose(tmpVecA, tmpQuat, tmpVecScale);
        tmpVecScale.z = targetScaleA;
        tmpMatrix.compose(tmpVecA, tmpQuat, tmpVecScale);
        refBaseMesh.current.setMatrixAt(bpIdx * 2, tmpMatrix);

        // Base B
        refBaseMesh.current.getMatrixAt(bpIdx * 2 + 1, tmpMatrix);
        tmpMatrix.decompose(tmpVecB, tmpQuat, tmpVecScale);
        tmpVecScale.z = targetScaleB;
        tmpMatrix.compose(tmpVecB, tmpQuat, tmpVecScale);
        refBaseMesh.current.setMatrixAt(bpIdx * 2 + 1, tmpMatrix);
      }
      refBaseMesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
      <group {...props} ref={ref}>
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
  },
);
BaseDoubleHelix.displayName = "BaseDoubleHelix";

export const MultiStrand = (props: BaseDoubleHelixProps) => {
  const strandRefs = [
    useRef<Group>(null!),
    useRef<Group>(null!),
    useRef<Group>(null!),
    useRef<Group>(null!),
    useRef<Group>(null!),
  ];
  const strandCount = strandRefs.length;
  const bounds = 15;

  const strandPositions = Array.from({ length: strandCount }).map((_, i) => {
    return new Vector3()
      .fromArray(
        Array.from({ length: 3 }).map(
          (_, j) => 2 * MathUtils.seededRandom(i + j) - 1,
        ),
      )
      .normalize()
      .multiplyScalar(bounds);
  });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const amplitude = 0.0005;
    const speed = 0.05;
    let tmpVec;
    let norm = 0;
    strandRefs.forEach((strandRef, strandIdx) => {
      if (!strandRef.current) {
        return;
      }
      tmpVec = strandPositions[strandIdx];
      norm = Math.sin(
        speed * (0.5 + 0.5 * MathUtils.seededRandom(strandIdx)) * t +
          MathUtils.seededRandom(strandIdx) / speed,
      );
      strandRef.current.position.set(
        tmpVec.x * norm,
        tmpVec.y * norm,
        tmpVec.z * norm,
      );
      strandRef.current.rotation.z +=
        amplitude *
        Math.cos((0.5 + 0.5 * MathUtils.seededRandom(strandIdx)) * t);
      strandRef.current.rotation.y +=
        amplitude *
        Math.cos((0.5 + 0.5 * MathUtils.seededRandom(strandIdx)) * t);
    });
  });

  return (
    <>
      {strandRefs.map((ref, i) => (
        <BaseDoubleHelix
          key={i}
          ref={ref}
          position={strandPositions[i]}
          rotation={
            new Euler(
              ...Array.from({ length: 3 }).map(
                (_, j) => Math.PI * (2 * MathUtils.seededRandom(i + j) - 1),
              ),
            )
          }
          {...props}
        />
      ))}
    </>
  );
};

export default MultiStrand;
