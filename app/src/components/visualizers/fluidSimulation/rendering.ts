/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { attribute, Fn, instanceIndex } from "three/tsl";
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshPhysicalNodeMaterial,
} from "three/webgpu";

import type { SimulationInstance } from "./simulation";

export function createParticleMesh(
  sim: SimulationInstance,
  color: string = "#0088FF",
  particleRadius: number = 0.012,
): Mesh {
  const geometry = BufferGeometryUtils.mergeVertices(
    new IcosahedronGeometry(particleRadius, 2).deleteAttribute("uv"),
  );

  const material = new MeshPhysicalNodeMaterial({
    color: new Color(color).lerp(new Color("#ffffff"), 0.6),
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.97,
    ior: 1.33,
    thickness: 0.08,
    attenuationColor: new Color(color),
    attenuationDistance: 1.0,
    specularIntensity: 0.6,
    specularColor: new Color("#ffffff"),
    envMapIntensity: 1.5,
  } as any);

  (material as any).positionNode = Fn(() => {
    const particlePosition = sim.particleBuffer
      .element(instanceIndex)
      .get("position");
    return (attribute("position") as any).add(particlePosition);
  })();

  const mesh = new Mesh(geometry, material);
  mesh.count = sim.config.initialParticleCount;
  mesh.position.set(-0.5, -0.5, -0.5);
  mesh.frustumCulled = false;

  return mesh;
}
