import { useEffect, useMemo, useRef } from "react";
import { usePalette } from "@/lib/appState";
import { type ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";
import { ColorPalette, GradientLinear } from "@/lib/palettes";
import { useFrame, useThree } from "@react-three/fiber";
import { Color } from "three";
import {
  Fn,
  If,
  PI,
  cos,
  float,
  hash,
  instanceIndex,
  instancedArray,
  mix,
  sin,
  uint,
  uniform,
  vec3,
  vec4,
} from "three/tsl";
import {
  AdditiveBlending,
  PlaneGeometry,
  SpriteNodeMaterial,
  type InstancedMesh,
} from "three/webgpu";

import { NeuronSimulation } from "./sim";

const PARTICLE_COUNT = 2 ** 18;
const GRID_SIZE = 5;
const RESET_THRESHOLD = 5;
const PARTICLE_ALPHA = 0.85;

const StimulusControls = ({ sim }: { sim: NeuronSimulation }) => {
  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener("keydown", () => sim.setStimulusCurrent(20), {
      signal: controller.signal,
    });
    window.addEventListener("keyup", () => sim.setStimulusCurrent(0), {
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [sim]);
  return null;
};

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
const sphericalToVec3 = Fn(({ phi, theta }: { phi: any; theta: any }) => {
  const sinPhiRadius = sin(phi);
  return vec3(
    sinPhiRadius.mul(sin(theta)),
    cos(phi),
    sinPhiRadius.mul(cos(theta)),
  );
});

function useMembraneParticles(sim: NeuronSimulation) {
  const uTime = uniform(float(0));
  const uColorK = uniform(new Color(1, 1, 1));
  const uColorNa = uniform(new Color(1, 1, 1));

  const { positionBuffer, initPositionBuffer, velocityBuffer } = useMemo(
    () => ({
      positionBuffer: instancedArray(PARTICLE_COUNT, "vec3"),
      initPositionBuffer: instancedArray(PARTICLE_COUNT, "vec3"),
      velocityBuffer: instancedArray(PARTICLE_COUNT, "vec3"),
    }),
    [],
  );

  const { initCompute, updateCompute } = useMemo(() => {
    const init = Fn(() => {
      const position = positionBuffer.element(instanceIndex);
      const velocity = velocityBuffer.element(instanceIndex);
      const initPosition = initPositionBuffer.element(instanceIndex);

      const basePosition = vec3(
        hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
        hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
        hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
      )
        .sub(0.5)
        .mul(vec3(GRID_SIZE, GRID_SIZE, 0.35));
      position.assign(basePosition);
      initPosition.assign(basePosition);

      const phi = hash(instanceIndex.add(uint(Math.random() * 0xffffff)))
        .mul(PI)
        .mul(2);
      const theta = hash(
        instanceIndex.add(uint(Math.random() * 0xffffff)),
      ).mul(PI);
      velocity.assign(sphericalToVec3(phi, theta).mul(0.05));
    });

    const update = Fn(() => {
      const position = positionBuffer.element(instanceIndex);
      const velocity = velocityBuffer.element(instanceIndex);
      const initPosition = initPositionBuffer.element(instanceIndex);

      const probReset = position.z
        .abs()
        .div(RESET_THRESHOLD)
        .saturate()
        .oneMinus()
        .mul(-20)
        .exp2()
        .toVar();

      If(position.x.abs().sub(GRID_SIZE / 2).greaterThan(0), () => {
        probReset.assign(1);
      });

      const randValue = hash(uTime.add(instanceIndex.toFloat()));
      If(
        randValue
          .lessThan(probReset)
          .or(position.z.abs().greaterThanEqual(RESET_THRESHOLD)),
        () => {
          position.assign(initPosition);
        },
      );

      If(instanceIndex.modInt(2).equal(0), () => {
        const xNorm = position.x.div(GRID_SIZE).add(0.5);
        const iK = sim.history.get_currents(xNorm).x.div(850);
        const distAlpha = float(0.5).sub(position.z.abs()).mul(2).saturate();
        const expEaseOut = distAlpha.mul(-10).exp2();
        const vZ = iK.mul(expEaseOut.add(0.01)).mul(0.15);
        position.z.assign(position.z.add(vZ));
        velocity.z.assign(vZ);
      }).Else(() => {
        const xNorm = position.x.div(GRID_SIZE).add(0.5);
        const iNa = sim.history.get_currents(xNorm).y.div(800);
        const distAlpha = float(0.5).sub(position.z.abs()).mul(2).saturate();
        const expEaseOut = distAlpha.mul(-10).exp2();
        const vZ = iNa.mul(expEaseOut.add(0.01)).mul(0.15);
        position.z.assign(position.z.add(vZ));
        velocity.z.assign(vZ);
      });

      const vNoise = vec3(
        hash(uTime.add(instanceIndex.toFloat())),
        hash(uTime.add(instanceIndex.toFloat().add(1))),
        hash(uTime.add(instanceIndex.toFloat().add(2))),
      )
        .sub(0.5)
        .normalize()
        .mul(0.0025);
      position.addAssign(vNoise);
    });

    return {
      initCompute: init().compute(PARTICLE_COUNT),
      updateCompute: update().compute(PARTICLE_COUNT),
    };
  }, [sim, positionBuffer, initPositionBuffer, velocityBuffer, uTime]);

  const material = useMemo(() => {
    const mat = new SpriteNodeMaterial({
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    mat.positionNode = positionBuffer.toAttribute();
    // Derive per-particle color from palette uniforms + instanceIndex
    const isNa = instanceIndex.modInt(2).toFloat();
    mat.colorNode = vec4(
      mix(uColorK as any, uColorNa as any, isNa),
      float(PARTICLE_ALPHA),
    );
    mat.scaleNode = uniform(0.004);
    return mat;
  }, [positionBuffer, uColorK, uColorNa]);
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

  return { material, initCompute, updateCompute, uTime, uColorK, uColorNa };
}

const BaseMembrane = (_: { coordinateMapper: ICoordinateMapper }) => {
  const simRef = useRef<NeuronSimulation>(null);
  if (!simRef.current) {
    simRef.current = new NeuronSimulation();
  }
  const sim = simRef.current;

  const { material, initCompute, updateCompute, uTime, uColorK, uColorNa } =
    useMembraneParticles(sim);
  const meshRef = useRef<InstancedMesh>(null!);
  const geometry = useMemo(() => new PlaneGeometry(1, 1), []);
  const initialized = useRef(false);

  const renderer = useThree((s) => s.gl);

  // Pick two distinct, bright ion colors from the active palette.
  // The background is a dark desaturated sample from ~0 on the gradient,
  // so we sample well away from there and force high saturation + lightness.
  const palette = usePalette();
  useEffect(() => {
    const grad = new GradientLinear(ColorPalette.getPalette(palette));
    const hsl = { h: 0, s: 0, l: 0 };

    const cK = grad.getAt(0.25);
    cK.getHSL(hsl);
    cK.setHSL(hsl.h, Math.max(hsl.s, 0.8), Math.max(hsl.l, 0.65));
    uColorK.value.copy(cK);

    const cNa = grad.getAt(0.8);
    cNa.getHSL(hsl);
    cNa.setHSL(hsl.h, Math.max(hsl.s, 0.8), Math.max(hsl.l, 0.65));
    uColorNa.value.copy(cNa);
  }, [palette, uColorK, uColorNa]);

  useFrame(({ elapsed }, delta) => {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const r = renderer as any;

    if (!initialized.current) {
      r.compute(initCompute);
      initialized.current = true;
    }

    uTime.value = elapsed;
    sim.step(0.002 * delta * 1000);
    r.compute(updateCompute);
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  });

  return (
    <>
      <StimulusControls sim={sim} />
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, PARTICLE_COUNT]}
      />
    </>
  );
};

export default BaseMembrane;
