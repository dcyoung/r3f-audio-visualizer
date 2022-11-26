import { MutableRefObject } from "react";

const NORM_QUADRANT_HYPOTENUSE_2D = Math.hypot(0.5, 0.5);
const NORM_QUADRANT_HYPOTENUSE_3D = Math.hypot(0.5, 0.5, 0.5);
const _2PI = 2 * Math.PI;

const interpolateValueForNormalizedCoord = (bars: number[], normalizedCoord: number): number => {
    if (bars === undefined || !bars || bars.length === 0) {
        return 0;
    }
    // Interpolate from the bar values based on the normalized Coord
    let rawIdx = normalizedCoord * (bars.length - 1);
    let valueBelow = bars[Math.floor(rawIdx)];
    let valueAbove = bars[Math.ceil(rawIdx)];
    return valueBelow + (rawIdx % 1) * (valueAbove - valueBelow);
}

const gaussianRandom = (): number => {
    let u = 0,
        v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(_2PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return gaussianRandom(); // resample between 0 and 1
    return num;
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export interface SourceSequenceDataOpts {
    dataRef: MutableRefObject<number[]>;
};

export interface SourceWaveformOpts {
    frequencyHz: number;
};

type CoordinateMapperSourceOpt = XOR<SourceSequenceDataOpts, SourceWaveformOpts>;

export interface ICoordinateMapper1D {
    (xNorm: number, elapsedTimeSec?: number): number;
}
export interface ICoordinateMapper2D {
    (xNorm: number, yNorm: number, elapsedTimeSec?: number): number;
}
export interface ICoordinateMapper3D {
    (xNorm: number, yNorm: number, zNorm: number, elapsedTimeSec?: number): number;
}

const getCoordinateMapper1D = (amplitude: number, source: CoordinateMapperSourceOpt): ICoordinateMapper1D => {
    // sample data sequence
    if (source?.dataRef) {
        return (xNorm: number) => {
            return amplitude * interpolateValueForNormalizedCoord(source.dataRef?.current, xNorm);
        }
    }
    // waveform
    const periodSec = 1 / source.frequencyHz;
    const b = _2PI / periodSec;
    return (xNorm: number, elapsedTimeSec: number = 0.0) => {
        return amplitude * Math.sin(b * xNorm + elapsedTimeSec);
    }
}

const getCoordinateMapper2D = (amplitude: number, source: CoordinateMapperSourceOpt): ICoordinateMapper2D => {
    // sample data sequence
    if (source?.dataRef) {
        return (xNorm: number, yNorm: number) => {
            const normRadialOffset =
                Math.hypot(xNorm - 0.5, yNorm - 0.5) / NORM_QUADRANT_HYPOTENUSE_2D;
            return amplitude * interpolateValueForNormalizedCoord(source.dataRef?.current, normRadialOffset);
        }
    }
    // waveform
    const periodSec = 1 / source.frequencyHz;
    const b = _2PI / periodSec;
    return (xNorm: number, yNorm: number, elapsedTimeSec: number = 0.0) => {
        const normRadialOffset = Math.hypot(xNorm - 0.5, yNorm - 0.5) / NORM_QUADRANT_HYPOTENUSE_2D;
        return amplitude * Math.sin(b * normRadialOffset + elapsedTimeSec);
    }
}


const getCoordinateMapper3D = (amplitude: number, source: CoordinateMapperSourceOpt, volume: boolean = true): ICoordinateMapper3D => {
    return volume
        ? getCoordinateMapper3DVolume(amplitude, source)
        : getCoordinateMapper3DFaces(amplitude, source);
}

const getCoordinateMapper3DVolume = (amplitude: number, source: CoordinateMapperSourceOpt): ICoordinateMapper3D => {
    // sample data sequence
    if (source?.dataRef) {
        return (xNorm: number, yNorm: number, zNorm: number) => {
            const normRadialOffset = Math.hypot(xNorm - 0.5, yNorm - 0.5, zNorm - 0.5) / NORM_QUADRANT_HYPOTENUSE_3D;
            return amplitude * interpolateValueForNormalizedCoord(source.dataRef?.current, normRadialOffset);
        }
    }
    // waveform
    const periodSec = 1 / source.frequencyHz;
    const b = _2PI / periodSec;
    return (xNorm: number, yNorm: number, zNorm: number, elapsedTimeSec: number = 0.0) => {
        const normRadialOffset = Math.hypot(xNorm - 0.5, yNorm - 0.5, zNorm - 0.5) / NORM_QUADRANT_HYPOTENUSE_3D;
        return amplitude * Math.sin(b * normRadialOffset + elapsedTimeSec);
    }
}

const cubeFaceCenterRadialOffset = (
    xNorm: number,
    yNorm: number,
    zNorm: number,
    interiorValue: number = 1.0
): number => {
    // calculate a radial offset for each face
    // (ie: treat each face as a grid and calculate radial dist from center of grid)
    // Exterior:
    if (xNorm == 0 || xNorm == 1) {
        return Math.hypot(yNorm - 0.5, zNorm - 0.5) /
            NORM_QUADRANT_HYPOTENUSE_2D;
    }
    if (yNorm == 0 || yNorm == 1) {
        return Math.hypot(xNorm - 0.5, xNorm - 0.5) /
            NORM_QUADRANT_HYPOTENUSE_2D;
    }
    if (zNorm == 0 || zNorm == 1) {
        return Math.hypot(xNorm - 0.5, yNorm - 0.5) /
            NORM_QUADRANT_HYPOTENUSE_2D;
    }
    // interior
    return interiorValue;
}
const getCoordinateMapper3DFaces = (amplitude: number, source: CoordinateMapperSourceOpt): ICoordinateMapper3D => {
    // sample data sequence
    if (source?.dataRef) {
        return (xNorm: number, yNorm: number, zNorm: number) => {
            const normRadialOffset = cubeFaceCenterRadialOffset(xNorm, yNorm, zNorm, 1.0);
            return amplitude * interpolateValueForNormalizedCoord(source.dataRef?.current, normRadialOffset);
        }
    }
    // waveform
    const periodSec = 1 / source.frequencyHz;
    const b = _2PI / periodSec;
    return (xNorm: number, yNorm: number, zNorm: number, elapsedTimeSec: number = 0.0) => {

        const normRadialOffset = cubeFaceCenterRadialOffset(xNorm, yNorm, zNorm, 1.0);
        return amplitude * Math.sin(b * normRadialOffset + elapsedTimeSec);
    }
}


export {
    _2PI,
    NORM_QUADRANT_HYPOTENUSE_2D,
    NORM_QUADRANT_HYPOTENUSE_3D,
    interpolateValueForNormalizedCoord,
    gaussianRandom,
    getCoordinateMapper1D,
    getCoordinateMapper2D,
    getCoordinateMapper3D,
}