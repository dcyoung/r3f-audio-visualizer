import type { ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";

export const SPHERICAL_MAPPING_MODE = {
  DIRECTION_3D: "direction_3d",
  LONGITUDE: "longitude",
  LATITUDE: "latitude",
  CUBEMAP: "cubemap",
  EQUIRECT_2D: "equirect_2d",
} as const;

type ObjectValues<T> = T[keyof T];
export type SphericalMappingMode = ObjectValues<typeof SPHERICAL_MAPPING_MODE>;

export const SPHERICAL_MAPPING_MODE_LABELS: Record<
  SphericalMappingMode,
  string
> = {
  direction_3d: "Direction 3D",
  longitude: "Longitude Wrap",
  latitude: "Latitude Bands",
  cubemap: "Cubemap Faces",
  equirect_2d: "Equirect 2D",
};

export const SPHERICAL_MAPPING_MODE_OPTIONS = Object.entries(
  SPHERICAL_MAPPING_MODE_LABELS,
) as [SphericalMappingMode, string][];

export type UnitDirection = { x: number; y: number; z: number };

export const DEFAULT_SPHERICAL_MAPPING_MODE: SphericalMappingMode =
  SPHERICAL_MAPPING_MODE.DIRECTION_3D;

/** Azimuth angle mapped to [0, 1). */
export const azimuthNorm = (x: number, y: number): number => {
  let azimuth = Math.atan2(y, x) / (2 * Math.PI);
  if (azimuth < 0) {
    azimuth += 1;
  }
  return azimuth;
};

/** Colatitude (polar angle from +Z) mapped to [0, 1]. */
export const colatitudeNorm = (z: number): number => {
  return Math.acos(Math.max(-1, Math.min(1, z))) / Math.PI;
};

export const equirectNorm = (
  x: number,
  y: number,
  z: number,
): { thetaNorm: number; phiNorm: number } => ({
  thetaNorm: azimuthNorm(x, y),
  phiNorm: colatitudeNorm(z),
});

/**
 * Project a unit direction onto the dominant face of a unit cube.
 * Returns normalized face coordinates suitable for map_3DFaces.
 */
export const projectDirectionToCubemapFace = (
  x: number,
  y: number,
  z: number,
): { xNorm: number; yNorm: number; zNorm: number } => {
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const az = Math.abs(z);

  if (ax >= ay && ax >= az) {
    const inv = 0.5 / ax;
    const u = z * inv + 0.5;
    const v = y * inv + 0.5;
    return x > 0
      ? { xNorm: 1, yNorm: v, zNorm: u }
      : { xNorm: 0, yNorm: v, zNorm: 1 - u };
  }

  if (ay >= ax && ay >= az) {
    const inv = 0.5 / ay;
    const u = x * inv + 0.5;
    const v = z * inv + 0.5;
    return y > 0
      ? { xNorm: u, yNorm: 1, zNorm: v }
      : { xNorm: u, yNorm: 0, zNorm: 1 - v };
  }

  const inv = 0.5 / az;
  const u = x * inv + 0.5;
  const v = y * inv + 0.5;
  return z > 0
    ? { xNorm: u, yNorm: v, zNorm: 1 }
    : { xNorm: 1 - u, yNorm: v, zNorm: 0 };
};

/** Average 2D samples across the equirectangular longitude seam. */
export const blendEquirectSeam = (
  sample2D: (thetaNorm: number, phiNorm: number) => number,
  thetaNorm: number,
  phiNorm: number,
  epsilon = 0.02,
): number => {
  const t0 = ((thetaNorm % 1) + 1) % 1;
  const t1 = (t0 - epsilon + 1) % 1;
  const t2 = (t0 + epsilon) % 1;
  return (sample2D(t0, phiNorm) + sample2D(t1, phiNorm) + sample2D(t2, phiNorm)) / 3;
};

export const sampleSpherical = (
  mapper: ICoordinateMapper,
  mode: SphericalMappingMode,
  dir: UnitDirection,
  elapsedTimeSec = 0.0,
): number => {
  return mapper.map_spherical(mode, dir.x, dir.y, dir.z, elapsedTimeSec);
};
