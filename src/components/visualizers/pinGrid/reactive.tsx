import { folder, useControls } from "leva";
import { PointLight } from "three";
import BaseGrid from "../grid/base";
import { VisualProps } from "../common";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

const PinGridVisual = ({ coordinateMapper }: VisualProps): JSX.Element => {
  const { nPinGridRows, nPinGridCols, pinGridUnitSideLength } = useControls({
    Grid: folder(
      {
        nPinGridRows: {
          value: 50,
          min: 2,
          max: 500,
          step: 1,
        },
        nPinGridCols: {
          value: 50,
          min: 2,
          max: 500,
          step: 1,
        },
        pinGridUnitSideLength: {
          value: 0.3,
          min: 0.05,
          max: 1.0,
          step: 0.05,
        },
      },
      { collapsed: true }
    ),
  });

  const radius =
    Math.max(nPinGridCols, nPinGridRows) * 1.1 * pinGridUnitSideLength;
  // const transform = useRef<Group>(null!);
  const lightRef = useRef<PointLight>(null!);
  useFrame(({ clock }) => {
    if (lightRef?.current) {
      const t = clock.getElapsedTime() * 0.1;
      lightRef.current.position.x = (radius / 2) * Math.sin(t * 7);
      lightRef.current.position.y = (radius / 2) * Math.cos(t * 5);
      lightRef.current.position.z = Math.abs((radius / 2) * Math.cos(t * 3));
    }
  });

  return (
    <>
      <BaseGrid
        coordinateMapper={coordinateMapper}
        nGridCols={nPinGridCols}
        nGridRows={nPinGridRows}
        cubeSideLength={pinGridUnitSideLength}
        cubeSpacingScalar={1.1}
        pinStyle={true}
        // colorLut={""}
      />
      <pointLight
        ref={lightRef}
        intensity={1}
        distance={2 * radius}
        decay={1.0}
      />
      {/* <TransformControls object={transform} mode="translate" /> */}
      {/* <Ground position={new Vector3(0, 0, -2.5 * coordinateMapper.amplitude)} /> */}
    </>
  );
};

export default PinGridVisual;
