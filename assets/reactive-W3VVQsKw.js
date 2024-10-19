import{r as a,u as b,V as h,a as m,b as g,j as s,C as w,c as y,d as z}from"./index-DwhXMaNP.js";const j=`
precision mediump float;
uniform vec3 color;

void main() {
    gl_FragColor = vec4(color, 1.0);
}
`,D=`
precision mediump float;

uniform float max_amplitude;
uniform vec2 resolution;
uniform sampler2D samples;
uniform vec2 sample_scale;
uniform bool b_should_interpolate;

attribute float index;

float decode(vec2 c) {
    float unscaled = (c.x * 255.0 * 256.0 + c.y * 255.0) / (256.0 * 256.0 - 1.0);
    return (unscaled * 2.0 - 1.0) * max_amplitude;
}

vec2 interpolate_sample(int i) {
    // calculate the size of single pixel in normalized coords
    float texture_size_x = float(textureSize(samples, 0).x);
    float texel_size_x = 1.0 / texture_size_x; 

    // normalize the input coordinate (range 0-1)
    float norm_x = float(i) / sample_scale.x;
    
    float nearest_tex_x_below = 1.0 * floor(norm_x * texture_size_x);
    vec2 tex_coord_below_norm = vec2(nearest_tex_x_below  / texture_size_x, 0.0);
    vec2 tex_coord_above_norm = tex_coord_below_norm + vec2(texel_size_x, 0.0);

    // Sample the 1D texture above and below
    vec4 sample_below = texture2D(samples, tex_coord_below_norm);
    vec4 sample_above = texture2D(samples, tex_coord_above_norm);

    // decode the byte structures into a 2D xy coordinate
    vec2 nearest_below = vec2(decode(sample_below.rg), decode(sample_below.ba));
    vec2 nearest_above = vec2(decode(sample_above.rg), decode(sample_above.ba));
    
    // Interpolate between the coords
    float a = fract((norm_x - tex_coord_below_norm.x) / texel_size_x );
    return mix(nearest_below, nearest_above, a);
}

vec2 get_sample(int i, bool interp) {
    if (interp){
        return interpolate_sample(i);
    }
    // normalize the coordinate (range 0-1) and then sample the 1D texture
    vec4 my_sample = texture2D(samples, vec2(i, 0.0) / sample_scale);
    
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
    vec2 pos = get_sample(i, b_should_interpolate);

    vec2 prev_pos = get_sample(i - 1, b_should_interpolate);
    vec2 next_pos = get_sample(i + 1, b_should_interpolate);

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


    // // Pass info to fragment shader
    // relative_length = avg_len;
    // norm_index = float(i) / sample_scale.x;
    // vec2 diff = next_pos - prev_pos;
    // // angle = ...
}
`,S=({textureMapper:r,nParticles:t=512,usePoints:c=!0,interpolate:i=!1,color:u=new w("green")})=>{const{tex:n,textureData:p}=r.generateSupportedTextureAndData();n.needsUpdate=!0;const e=a.useRef(null),l=b(o=>o.size),d=a.useMemo(()=>new Float32Array(t).fill(0).map((o,v)=>v),[t]),f=a.useMemo(()=>new Float32Array(t*3).fill(0),[t]),x=a.useMemo(()=>({color:{value:new h},max_amplitude:{value:r.maxAmplitude},sample_scale:{value:new m(t,1)},samples:{type:"t",value:n},resolution:{value:new m(l.width,l.height)},b_should_interpolate:{value:i}}),[t,r,i,l,n]);g(()=>{r.updateTextureData(p),n.needsUpdate=!0,e.current.uniforms.max_amplitude.value=r.maxAmplitude,e.current.uniforms.samples.value=n}),a.useEffect(()=>{var o;(o=e.current)!=null&&o.uniforms&&(e.current.uniforms.resolution.value.x=l.width,e.current.uniforms.resolution.value.y=l.height)},[l]),a.useEffect(()=>{var o;(o=e.current)!=null&&o.uniforms&&(e.current.uniforms.b_should_interpolate.value=i,e.current.uniforms.color.value.x=u.r,e.current.uniforms.color.value.y=u.g,e.current.uniforms.color.value.z=u.b)},[i,u]),a.useEffect(()=>{var o;(o=e.current)!=null&&o.uniforms&&(e.current.uniforms.sample_scale.value.x=t,e.current.uniforms.sample_scale.value.y=1)},[t]);const _=s.jsxs(a.Fragment,{children:[s.jsxs("bufferGeometry",{children:[s.jsx("bufferAttribute",{attach:"attributes-position",count:t,array:f,itemSize:3}),s.jsx("bufferAttribute",{attach:"attributes-index",count:t,array:d,itemSize:1})]}),s.jsx("shaderMaterial",{ref:e,depthWrite:!1,fragmentShader:j,vertexShader:D,uniforms:x})]});return c?s.jsx("points",{children:_}):s.jsx("line",{children:_})},C=({textureMapper:r})=>{const t=y(),c=z.getPalette(t).lerpColor(.5);return s.jsx(S,{textureMapper:r,usePoints:!0,interpolate:!1,color:c})};export{C as default};
