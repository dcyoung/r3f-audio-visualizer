import { useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
  type Group,
} from "three";

const TWO_PI = Math.PI * 2;
const UP = new Vector3(0, 1, 0);
const RIGHT = new Vector3(1, 0, 0);

export type DendriteSegment = {
  id: string;
  parentId: string | null;
  depth: number;
  curve: CatmullRomCurve3;
  rootDirection: Vector3;
  radiusStart: number;
  radiusEnd: number;
};

export type NeuronConfig = {
  seed: number;
  somaRadius: number;
  primaryCount: number;
  maxDepth: number;
  branchLength: number;
  branchRadius: number;
  branchLengthFalloff: number;
  branchRadiusFalloff: number;
  tubularSegments: number;
  radialSegments: number;
};

const DEFAULT_CONFIG: NeuronConfig = {
  seed: 721,
  somaRadius: 1.35,
  primaryCount: 9,
  maxDepth: 1,
  branchLength: 10.5,
  branchRadius: 0.22,
  branchLengthFalloff: 0.18,
  branchRadiusFalloff: 0.5,
  tubularSegments: 30,
  radialSegments: 8,
};

const random = (seed: number) => MathUtils.seededRandom(seed);

const getBranchBasis = (direction: Vector3, seed: number) => {
  const reference = Math.abs(direction.dot(UP)) > 0.86 ? RIGHT : UP;
  const normal = new Vector3().crossVectors(direction, reference).normalize();
  const binormal = new Vector3().crossVectors(direction, normal).normalize();
  const angle = TWO_PI * random(seed);

  normal
    .multiplyScalar(Math.cos(angle))
    .addScaledVector(binormal, Math.sin(angle))
    .normalize();
  binormal.crossVectors(direction, normal).normalize();

  return { normal, binormal };
};

const createDendriteCurve = (
  start: Vector3,
  direction: Vector3,
  length: number,
  seed: number,
) => {
  const forward = direction.clone().normalize();
  const { normal, binormal } = getBranchBasis(forward, seed);
  const curveBend =
    0.18 + 0.18 * random(seed + 1) + 0.08 * Math.sin(seed * 0.37);
  const firstBend = normal
    .clone()
    .multiplyScalar(length * curveBend * (random(seed + 2) - 0.35));
  const secondBend = binormal
    .clone()
    .multiplyScalar(length * curveBend * (random(seed + 3) - 0.35));

  return new CatmullRomCurve3([
    start.clone(),
    start
      .clone()
      .addScaledVector(forward, length * 0.24)
      .addScaledVector(normal, length * 0.1 * (random(seed + 4) - 0.5)),
    start
      .clone()
      .addScaledVector(forward, length * 0.52)
      .add(firstBend),
    start
      .clone()
      .addScaledVector(forward, length * 0.8)
      .add(secondBend),
    start
      .clone()
      .addScaledVector(forward, length)
      .addScaledVector(normal, length * 0.08 * (random(seed + 5) - 0.5)),
  ]);
};

const buildEvenlyDistributedDirections = (count: number, seed: number) => {
  const directions = Array.from({ length: count }).map((_, i) => {
    const z = 1 - (2 * i) / Math.max(1, count - 1);
    const radius = Math.sqrt(Math.max(0, 1 - z * z));
    const theta = i * Math.PI * (3 - Math.sqrt(5));

    return new Vector3(
      Math.cos(theta) * radius,
      z,
      Math.sin(theta) * radius,
    ).normalize();
  });

  for (let iteration = 0; iteration < 10; iteration += 1) {
    const nudges = directions.map(() => new Vector3());

    for (let i = 0; i < directions.length; i += 1) {
      for (let j = i + 1; j < directions.length; j += 1) {
        const delta = directions[i].clone().sub(directions[j]);
        const distanceSq = Math.max(delta.lengthSq(), 0.001);
        const force = delta.normalize().multiplyScalar(0.004 / distanceSq);
        nudges[i].add(force);
        nudges[j].sub(force);
      }
    }

    for (let i = 0; i < directions.length; i += 1) {
      directions[i].add(nudges[i]).normalize();
    }
  }

  return directions.map((direction, i) => {
    const { normal, binormal } = getBranchBasis(direction, seed + i * 31);
    const angle = TWO_PI * random(seed + i * 47);

    return direction
      .clone()
      .addScaledVector(normal, 0.075 * Math.cos(angle))
      .addScaledVector(binormal, 0.075 * Math.sin(angle))
      .normalize();
  });
};

export const buildNeuronSegments = (
  partialConfig: Partial<NeuronConfig> = {},
): DendriteSegment[] => {
  const config = { ...DEFAULT_CONFIG, ...partialConfig };
  const segments: DendriteSegment[] = [];
  const primaryDirections = buildEvenlyDistributedDirections(
    config.primaryCount,
    config.seed,
  );

  const appendBranch = (
    id: string,
    parentId: string | null,
    depth: number,
    start: Vector3,
    direction: Vector3,
    length: number,
    radiusStart: number,
    seed: number,
  ) => {
    const radiusEnd = Math.max(
      0.026,
      radiusStart * config.branchRadiusFalloff * (0.84 + 0.22 * random(seed)),
    );
    const curve = createDendriteCurve(start, direction, length, seed);
    const segment: DendriteSegment = {
      id,
      parentId,
      depth,
      curve,
      rootDirection: direction.clone().normalize(),
      radiusStart,
      radiusEnd,
    };
    segments.push(segment);

    if (depth >= config.maxDepth) {
      return;
    }

    const childCount = depth === 0 ? 4 + Math.floor(2 * random(seed + 102)) : 0;

    for (let childIndex = 0; childIndex < childCount; childIndex += 1) {
      const childSeed = seed + 211 + childIndex * 43;
      const childT = 0.88 + 0.08 * random(childSeed);
      const childStart = curve.getPoint(childT);
      const tangent = curve.getTangent(childT).normalize();
      const { normal, binormal } = getBranchBasis(tangent, childSeed);
      const childAngle = TWO_PI * random(childSeed + 1);
      const sideDirection = normal
        .clone()
        .multiplyScalar(Math.cos(childAngle))
        .addScaledVector(binormal, Math.sin(childAngle))
        .normalize();
      const childDirection = tangent
        .clone()
        .multiplyScalar(0.42 + 0.2 * random(childSeed + 2))
        .addScaledVector(sideDirection, 0.92)
        .normalize();
      const childLength =
        length *
        config.branchLengthFalloff *
        (0.7 + 0.32 * random(childSeed + 3));

      appendBranch(
        `${id}.${childIndex}`,
        id,
        depth + 1,
        childStart,
        childDirection,
        childLength,
        radiusEnd * (0.7 + 0.12 * random(childSeed + 4)),
        childSeed,
      );
    }
  };

  for (let i = 0; i < config.primaryCount; i += 1) {
    const direction = primaryDirections[i];

    appendBranch(
      `d${i}`,
      null,
      0,
      direction.clone().multiplyScalar(config.somaRadius * 0.78),
      direction,
      config.branchLength * (0.78 + 0.34 * random(config.seed + i * 11)),
      config.branchRadius * (0.82 + 0.24 * random(config.seed + i * 13)),
      config.seed + i * 97,
    );
  }

  return segments;
};

const createOrganicSomaGeometry = (
  radius: number,
  seed: number,
  segments: DendriteSegment[],
) => {
  const geometry = new SphereGeometry(radius, 96, 48);
  const position = geometry.attributes.position;
  const vertex = new Vector3();
  const primarySegments = segments.filter(
    (segment) => segment.parentId === null,
  );

  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i).normalize();
    const theta = Math.atan2(vertex.z, vertex.x);
    const phi = Math.acos(MathUtils.clamp(vertex.y, -1, 1));
    let lobe =
      1 +
      0.06 * Math.sin(3 * theta + seed * 0.11) * Math.sin(2 * phi) +
      0.04 * Math.cos(4 * phi - seed * 0.07) +
      0.03 * Math.sin(2 * theta - 3 * phi + seed * 0.17);

    for (const segment of primarySegments) {
      const alignment = Math.max(0, vertex.dot(segment.rootDirection));
      const neck = Math.pow(alignment, 18);
      lobe += neck * (0.28 + segment.radiusStart * 0.8);
    }

    vertex
      .multiplyScalar(radius * lobe)
      .set(vertex.x * 1.04, vertex.y * 0.92, vertex.z * 1.0);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
};

const createTaperedTubeGeometry = (
  curve: CatmullRomCurve3,
  radiusStart: number,
  radiusEnd: number,
  tubularSegments: number,
  radialSegments: number,
) => {
  const geometry = new BufferGeometry();
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const center = new Vector3();
  const vertex = new Vector3();

  for (let i = 0; i <= tubularSegments; i += 1) {
    const t = i / tubularSegments;
    const radius = MathUtils.lerp(radiusStart, radiusEnd, t);
    curve.getPointAt(t, center);

    for (let j = 0; j <= radialSegments; j += 1) {
      const v = j / radialSegments;
      const angle = v * TWO_PI;
      vertex
        .copy(center)
        .addScaledVector(frames.normals[i], Math.cos(angle) * radius)
        .addScaledVector(frames.binormals[i], Math.sin(angle) * radius);
      positions.push(vertex.x, vertex.y, vertex.z);
      uvs.push(t, v);
    }
  }

  for (let i = 0; i < tubularSegments; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const rowLength = radialSegments + 1;
      const a = rowLength * i + j;
      const b = rowLength * (i + 1) + j;
      const c = rowLength * (i + 1) + j + 1;
      const d = rowLength * i + j + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
};

type NeuronModelProps = ThreeElements["group"] & {
  segments?: DendriteSegment[];
};

export const NeuronModel = ({
  children,
  segments,
  ...props
}: NeuronModelProps) => {
  const groupRef = useRef<Group>(null);
  const generatedSegments = useMemo(() => buildNeuronSegments(), []);
  const modelSegments = segments ?? generatedSegments;
  const somaGeometry = useMemo(
    () =>
      createOrganicSomaGeometry(
        DEFAULT_CONFIG.somaRadius,
        DEFAULT_CONFIG.seed,
        modelSegments,
      ),
    [modelSegments],
  );
  const somaMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color("#202761"),
        metalness: 0,
        roughness: 0.74,
      }),
    [],
  );
  const dendriteMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color("#202761"),
        metalness: 0,
        roughness: 0.74,
      }),
    [],
  );
  const dendriteGeometries = useMemo(
    () =>
      modelSegments.map((segment) => ({
        id: segment.id,
        geometry: createTaperedTubeGeometry(
          segment.curve,
          segment.radiusStart,
          segment.radiusEnd,
          DEFAULT_CONFIG.tubularSegments,
          DEFAULT_CONFIG.radialSegments,
        ),
      })),
    [modelSegments],
  );

  useFrame(({ elapsed }) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y = elapsed * 0.035;
    groupRef.current.rotation.x = Math.sin(elapsed * 0.18) * 0.08;
    groupRef.current.position.y = Math.sin(elapsed * 0.35) * 0.18;
  });

  return (
    <group ref={groupRef} {...props}>
      <mesh geometry={somaGeometry} material={somaMaterial} />
      {dendriteGeometries.map(({ id, geometry }) => (
        <mesh key={id} geometry={geometry} material={dendriteMaterial} />
      ))}
      {children}
    </group>
  );
};
