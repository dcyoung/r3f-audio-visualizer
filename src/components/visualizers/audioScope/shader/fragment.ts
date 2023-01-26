const fragmentShader = `
precision mediump float;

void main() {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    
    // #include <tonemapping_fragment>
    // #include <encodings_fragment>
}
`;
export default fragmentShader;
