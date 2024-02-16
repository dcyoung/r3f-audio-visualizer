import { useEffect, useMemo, useRef } from "react";
import { usePalette } from "@/lib/appState";
import {
  COORDINATE_TYPE,
  type ICoordinateMapper,
} from "@/lib/mappers/coordinateMappers/common";
import { ColorPalette } from "@/lib/palettes";
import { Plane } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Vector3, type Mesh } from "three";

const BaseRibbons = ({
  coordinateMapper,
  ribbonWidth = 1,
  ribbonHeight = 10,
  ribbonWidthSegments = 1,
  ribbonHeightSegments = 64,
}: {
  coordinateMapper: ICoordinateMapper;
  ribbonWidth?: number;
  ribbonHeight?: number;
  ribbonWidthSegments?: number;
  ribbonHeightSegments?: number;
}) => {
  const ribbonRefs = [
    useRef<Mesh>(null!),
    useRef<Mesh>(null!),
    useRef<Mesh>(null!),
    useRef<Mesh>(null!),
    useRef<Mesh>(null!),
  ];
  const ribbonCount = ribbonRefs.length;

  const gridHalfWidth = (ribbonWidth * ribbonCount) / 2;
  const gridHalfHeight = ribbonHeight / 2;
  const ribbonPositions = Array.from({ length: ribbonCount }).map(
    (_, i) =>
      new Vector3(gridHalfWidth - ribbonWidth * i - ribbonWidth / 2, 0, 0),
  );
  const palette = usePalette();
  const lut = ColorPalette.getPalette(palette).buildLut();

  const material = useMemo(() => {
    return (
      <meshPhysicalMaterial
        color={lut.getColor(0.25).getHex()}
        clearcoat={1.0}
        clearcoatRoughness={0}
        metalness={0.5}
        side={DoubleSide}
      />
    );
  }, [lut]);

  // Recolor
  useEffect(() => {
    if (!lut) {
      return;
    }
  });

  useFrame(({ clock }) => {
    //in ms
    const elapsedTimeSec = clock.getElapsedTime();

    let w, h, vIdx, normX, normY, z, alpha;
    ribbonRefs.forEach((ribbonRef, ribbonIdx) => {
      if (!ribbonRef.current) {
        return;
      }

      const positionsBuffer = ribbonRef.current.geometry.attributes.position;
      for (h = 0; h <= ribbonHeightSegments; h++) {
        alpha =
          1 -
          Math.abs(h - ribbonHeightSegments / 2) / (ribbonHeightSegments / 2);
        for (w = 0; w <= ribbonWidthSegments; w++) {
          normX = (ribbonIdx + 0.5) / ribbonCount;
          normY = (h + 0.5) / ribbonHeightSegments;
          vIdx = h * (ribbonWidthSegments + 1) + w;
          z = coordinateMapper.map(
            COORDINATE_TYPE.CARTESIAN_2D,
            normX,
            normY,
            0,
            elapsedTimeSec,
          );

          positionsBuffer.setZ(vIdx, z * alpha);
        }
      }
      positionsBuffer.needsUpdate = true;
    });
  });

  const planeSize = 250;
  return (
    <>
      <ambientLight />
      <Plane
        args={[planeSize / 2, planeSize, 1, 1]}
        position={[gridHalfWidth + planeSize / 4, 0, 0]}
        castShadow={true}
        receiveShadow={true}
      >
        {material}
      </Plane>
      <Plane
        args={[planeSize / 2, planeSize, 1, 1]}
        position={[-gridHalfWidth - planeSize / 4, 0, 0]}
        castShadow={true}
        receiveShadow={true}
      >
        {material}
      </Plane>
      <Plane
        args={[planeSize / 4, planeSize / 2 - gridHalfHeight, 1, 1]}
        position={[
          0,
          -gridHalfHeight - (planeSize / 2 - gridHalfHeight) / 2,
          0,
        ]}
        castShadow={true}
        receiveShadow={true}
      >
        {material}
      </Plane>
      <Plane
        args={[planeSize / 4, planeSize / 2 - gridHalfHeight, 1, 1]}
        position={[0, gridHalfHeight + (planeSize / 2 - gridHalfHeight) / 2, 0]}
        castShadow={true}
        receiveShadow={true}
      >
        {material}
      </Plane>
      {ribbonRefs.map((ref, i) => (
        <Plane
          key={`ribbon-plane-${i}`}
          args={[
            ribbonWidth,
            ribbonHeight,
            ribbonWidthSegments,
            ribbonHeightSegments,
          ]}
          ref={ref}
          position={ribbonPositions[i]}
          castShadow={true}
          receiveShadow={true}
        >
          {material}
        </Plane>
      ))}
    </>
  );
};

export default BaseRibbons;
