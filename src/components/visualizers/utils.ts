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


export { interpolateValueForNormalizedCoord }