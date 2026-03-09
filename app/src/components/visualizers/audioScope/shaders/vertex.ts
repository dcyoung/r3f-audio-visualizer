const vertexShader = `
precision mediump float;

uniform vec2 resolution;
uniform sampler2D samples;
uniform float n_samples;
uniform float u_point_scale;

attribute float index;

varying float v_angular_velocity;
varying float v_noise;
varying float v_position;

vec4 get_sample(int i) {
    float u = (float(i) + 0.5) / n_samples;
    return texture2D(samples, vec2(u, 0.5));
}

const float t_max = 5.0;
const float t_min = 1.0;
const float t_flat = 0.005;

void main() {
    int i = int(index);

    vec4 s = get_sample(i);
    vec2 pos = s.xy;
    v_angular_velocity = s.z;
    v_noise = s.w;
    v_position = float(i) / n_samples;

    vec4 prev_s = get_sample(i - 1);
    vec4 next_s = get_sample(i + 1);
    vec2 prev_pos = prev_s.xy;
    vec2 next_pos = next_s.xy;

    float prev_len = distance(pos, prev_pos);
    float next_len = distance(pos, next_pos);
    float avg_len = mix(prev_len, next_len, 0.5);

    float thickness = (t_max - t_min) * t_flat / (t_flat + avg_len) + t_min;

    float side = min(resolution.x, resolution.y);

    gl_PointSize = u_point_scale * (3.0 + 6.0 * thickness / side);

    if (resolution.x < resolution.y) {
        pos = pos.yx;
    }
    gl_Position = vec4(pos / resolution * side, 0.0, 1.0);
}
`;

export default vertexShader;
