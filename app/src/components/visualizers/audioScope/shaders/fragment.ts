const fragmentShader = `
precision mediump float;

uniform float u_base_hue;
uniform float u_decay;
uniform float u_desaturation;
uniform float u_min_saturation;

varying float v_angular_velocity;
varying float v_noise;
varying float v_position;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 pc = 2.0 * gl_PointCoord - 1.0;
    float dist = dot(pc, pc);
    if (dist > 1.0) discard;
    float soft = 1.0 - smoothstep(0.6, 1.0, dist);

    float alpha = mix(1.0 - u_decay, 1.0, v_position) * soft;

    float phase = log2(max(v_angular_velocity, 1.0e-10));
    float saturation = max(u_min_saturation, 1.0 / (1.0 + u_desaturation * v_noise));
    vec3 hsv = vec3(u_base_hue + phase, saturation, 1.0);
    gl_FragColor = vec4(hsv2rgb(hsv), alpha);
}
`;
export default fragmentShader;
