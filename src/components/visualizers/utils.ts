const _2PI = 2 * Math.PI;
const NORM_QUADRANT_HYPOTENUSE_2D = Math.hypot(0.5, 0.5);
const NORM_QUADRANT_HYPOTENUSE_3D = Math.hypot(0.5, 0.5, 0.5);

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

export {
    _2PI,
    NORM_QUADRANT_HYPOTENUSE_2D,
    NORM_QUADRANT_HYPOTENUSE_3D,
    gaussianRandom,
}