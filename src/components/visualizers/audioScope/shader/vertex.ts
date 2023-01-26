const vertexShader = `
precision mediump float;

uniform float maxAmplitude;
uniform vec2 resolution;
uniform sampler2D samples;
uniform vec2 sampleScale;

attribute float index;

float decode(vec2 c) {
    float unscaled = (c.x * 255.0 * 256.0 + c.y * 255.0) / (256.0 * 256.0 - 1.0);
    return (unscaled * 2.0 - 1.0) * maxAmplitude;
}

vec2 get_sample(int i) {
    // normalize the coordinate (range 0-1) and then sample the 1D texture
    vec4 my_sample = texture2D(samples, vec2(i, 0.0) / sampleScale);
    
    // decode the byte structure into a 2D xy coordinate
    return vec2(decode(my_sample.rg), decode(my_sample.ba));
}

const float t_max = 5.0;
const float t_min = 1.0;
const float t_flat = 0.005;

void main() {
    // Read off the row/col texture coordinates
    int i = int(index);
    int j = 0;
    
    // translate to screen x/y
    vec2 pos = get_sample(i);

    vec2 prev_pos = get_sample(i - 1);
    vec2 next_pos = get_sample(i + 1);

    float prev_len = distance(pos, prev_pos);
    float next_len = distance(pos, next_pos);
    float avg_len = mix(prev_len, next_len, 0.5);

    float thickness = (t_max - t_min) * t_flat / (t_flat + avg_len) + t_min;

    vec2 delta = vec2(0.0, 0.0);
    if (j == 0) {
        delta = pos - prev_pos;
    } else if (j == 1) {
        delta = prev_pos - pos;
    } else if (j == 2) {
        delta = next_pos - pos;
    } else if (j == 3) {
        delta = pos - next_pos;
    }

    float side = min(resolution.x, resolution.y);

    // pos = pos + thickness / side * normalize(vec2(-delta.y, delta.x));

    gl_PointSize = 3.0 + 5.0 * thickness / side;

    if (resolution.x < resolution.y) {
        pos = pos.yx;
    }
    gl_Position = vec4(pos / resolution * side, 0.0, 1.0);


    // vec4 modelPosition = modelMatrix * vec4(pos, 0.0, 1.0);
    // vec4 viewPosition = viewMatrix * modelPosition;
    // vec4 projectedPosition = projectionMatrix * viewPosition;
    // gl_Position = projectedPosition;

    // gl_PointSize = 3.0;
}
`;

export default vertexShader;
