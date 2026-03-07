import{Z as re,J as ae,b as C,R as ie,y as u,W as L,a3 as Y,L as I,z as ne,a9 as oe,a0 as se,a1 as X,A as le,aa as ue,r as a,a5 as he,a as N,ab as me,V as y,M as q,a2 as J,_ as fe,D as ve,ac as ce,ad as de,c as pe,a8 as xe,j as H}from"./index-YNAAgOdW.js";const _e=()=>parseInt(re.replace(/\D+/g,"")),ge=_e();class De extends ae{constructor(e=new C){super({uniforms:{inputBuffer:new u(null),depthBuffer:new u(null),resolution:new u(new C),texelSize:new u(new C),halfTexelSize:new u(new C),kernel:new u(0),scale:new u(1),cameraNear:new u(0),cameraFar:new u(1),minDepthThreshold:new u(0),maxDepthThreshold:new u(1),depthScale:new u(0),depthToBlurRatioBias:new u(.25)},fragmentShader:`#include <common>
        #include <dithering_pars_fragment>      
        uniform sampler2D inputBuffer;
        uniform sampler2D depthBuffer;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          float depthFactor = 0.0;
          
          #ifdef USE_DEPTH
            vec4 depth = texture2D(depthBuffer, vUv);
            depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
            depthFactor *= depthScale;
            depthFactor = max(0.0, min(1.0, depthFactor + 0.25));
          #endif
          
          vec4 sum = texture2D(inputBuffer, mix(vUv0, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv1, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv2, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv3, vUv, depthFactor));
          gl_FragColor = sum * 0.25 ;

          #include <dithering_fragment>
          #include <tonemapping_fragment>
          #include <${ge>=154?"colorspace_fragment":"encodings_fragment"}>
        }`,vertexShader:`uniform vec2 texelSize;
        uniform vec2 halfTexelSize;
        uniform float kernel;
        uniform float scale;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          vec2 uv = position.xy * 0.5 + 0.5;
          vUv = uv;

          vec2 dUv = (texelSize * vec2(kernel) + halfTexelSize) * scale;
          vUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);
          vUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);
          vUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);
          vUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);

          gl_Position = vec4(position.xy, 1.0, 1.0);
        }`,blending:ie,depthWrite:!1,depthTest:!1}),this.toneMapped=!1,this.setTexelSize(e.x,e.y),this.kernel=new Float32Array([0,1,2,2,3])}setTexelSize(e,t){this.uniforms.texelSize.value.set(e,t),this.uniforms.halfTexelSize.value.set(e,t).multiplyScalar(.5)}setResolution(e){this.uniforms.resolution.value.copy(e)}}class Se{constructor({gl:e,resolution:t,width:s=500,height:f=500,minDepthThreshold:d=0,maxDepthThreshold:p=1,depthScale:x=0,depthToBlurRatioBias:S=.25}){this.renderToScreen=!1,this.renderTargetA=new L(t,t,{minFilter:I,magFilter:I,stencilBuffer:!1,depthBuffer:!1,type:Y}),this.renderTargetB=this.renderTargetA.clone(),this.convolutionMaterial=new De,this.convolutionMaterial.setTexelSize(1/s,1/f),this.convolutionMaterial.setResolution(new C(s,f)),this.scene=new ne,this.camera=new oe,this.convolutionMaterial.uniforms.minDepthThreshold.value=d,this.convolutionMaterial.uniforms.maxDepthThreshold.value=p,this.convolutionMaterial.uniforms.depthScale.value=x,this.convolutionMaterial.uniforms.depthToBlurRatioBias.value=S,this.convolutionMaterial.defines.USE_DEPTH=x>0;const m=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),_=new Float32Array([0,0,2,0,0,2]),h=new se;h.setAttribute("position",new X(m,3)),h.setAttribute("uv",new X(_,2)),this.screen=new le(h,this.convolutionMaterial),this.screen.frustumCulled=!1,this.scene.add(this.screen)}render(e,t,s){const f=this.scene,d=this.camera,p=this.renderTargetA,x=this.renderTargetB;let S=this.convolutionMaterial,m=S.uniforms;m.depthBuffer.value=t.depthTexture;const _=S.kernel;let h=t,U,g,P;for(g=0,P=_.length-1;g<P;++g)U=(g&1)===0?p:x,m.kernel.value=_[g],m.inputBuffer.value=h.texture,e.setRenderTarget(U),e.render(f,d),h=U;m.kernel.value=_[g],m.inputBuffer.value=h.texture,e.setRenderTarget(this.renderToScreen?null:s),e.render(f,d)}}let Te=class extends ue{constructor(e={}){super(e),this._tDepth={value:null},this._distortionMap={value:null},this._tDiffuse={value:null},this._tDiffuseBlur={value:null},this._textureMatrix={value:null},this._hasBlur={value:!1},this._mirror={value:0},this._mixBlur={value:0},this._blurStrength={value:.5},this._minDepthThreshold={value:.9},this._maxDepthThreshold={value:1},this._depthScale={value:0},this._depthToBlurRatioBias={value:.25},this._distortion={value:1},this._mixContrast={value:1},this.setValues(e)}onBeforeCompile(e){var t;(t=e.defines)!=null&&t.USE_UV||(e.defines.USE_UV=""),e.uniforms.hasBlur=this._hasBlur,e.uniforms.tDiffuse=this._tDiffuse,e.uniforms.tDepth=this._tDepth,e.uniforms.distortionMap=this._distortionMap,e.uniforms.tDiffuseBlur=this._tDiffuseBlur,e.uniforms.textureMatrix=this._textureMatrix,e.uniforms.mirror=this._mirror,e.uniforms.mixBlur=this._mixBlur,e.uniforms.mixStrength=this._blurStrength,e.uniforms.minDepthThreshold=this._minDepthThreshold,e.uniforms.maxDepthThreshold=this._maxDepthThreshold,e.uniforms.depthScale=this._depthScale,e.uniforms.depthToBlurRatioBias=this._depthToBlurRatioBias,e.uniforms.distortion=this._distortion,e.uniforms.mixContrast=this._mixContrast,e.vertexShader=`
        uniform mat4 textureMatrix;
        varying vec4 my_vUv;
      ${e.vertexShader}`,e.vertexShader=e.vertexShader.replace("#include <project_vertex>",`#include <project_vertex>
        my_vUv = textureMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );`),e.fragmentShader=`
        uniform sampler2D tDiffuse;
        uniform sampler2D tDiffuseBlur;
        uniform sampler2D tDepth;
        uniform sampler2D distortionMap;
        uniform float distortion;
        uniform float cameraNear;
			  uniform float cameraFar;
        uniform bool hasBlur;
        uniform float mixBlur;
        uniform float mirror;
        uniform float mixStrength;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float mixContrast;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec4 my_vUv;
        ${e.fragmentShader}`,e.fragmentShader=e.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>

      float distortionFactor = 0.0;
      #ifdef USE_DISTORTION
        distortionFactor = texture2D(distortionMap, vUv).r * distortion;
      #endif

      vec4 new_vUv = my_vUv;
      new_vUv.x += distortionFactor;
      new_vUv.y += distortionFactor;

      vec4 base = texture2DProj(tDiffuse, new_vUv);
      vec4 blur = texture2DProj(tDiffuseBlur, new_vUv);

      vec4 merge = base;

      #ifdef USE_NORMALMAP
        vec2 normal_uv = vec2(0.0);
        vec4 normalColor = texture2D(normalMap, vUv * normalScale);
        vec3 my_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
        vec3 coord = new_vUv.xyz / new_vUv.w;
        normal_uv = coord.xy + coord.z * my_normal.xz * 0.05;
        vec4 base_normal = texture2D(tDiffuse, normal_uv);
        vec4 blur_normal = texture2D(tDiffuseBlur, normal_uv);
        merge = base_normal;
        blur = blur_normal;
      #endif

      float depthFactor = 0.0001;
      float blurFactor = 0.0;

      #ifdef USE_DEPTH
        vec4 depth = texture2DProj(tDepth, new_vUv);
        depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
        depthFactor *= depthScale;
        depthFactor = max(0.0001, min(1.0, depthFactor));

        #ifdef USE_BLUR
          blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
          merge = merge * min(1.0, depthFactor + 0.5);
        #else
          merge = merge * depthFactor;
        #endif

      #endif

      float reflectorRoughnessFactor = roughness;
      #ifdef USE_ROUGHNESSMAP
        vec4 reflectorTexelRoughness = texture2D( roughnessMap, vUv );
        reflectorRoughnessFactor *= reflectorTexelRoughness.g;
      #endif

      #ifdef USE_BLUR
        blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
        merge = mix(merge, blur, blurFactor);
      #endif

      vec4 newMerge = vec4(0.0, 0.0, 0.0, 1.0);
      newMerge.r = (merge.r - 0.5) * mixContrast + 0.5;
      newMerge.g = (merge.g - 0.5) * mixContrast + 0.5;
      newMerge.b = (merge.b - 0.5) * mixContrast + 0.5;

      diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);
      `)}get tDiffuse(){return this._tDiffuse.value}set tDiffuse(e){this._tDiffuse.value=e}get tDepth(){return this._tDepth.value}set tDepth(e){this._tDepth.value=e}get distortionMap(){return this._distortionMap.value}set distortionMap(e){this._distortionMap.value=e}get tDiffuseBlur(){return this._tDiffuseBlur.value}set tDiffuseBlur(e){this._tDiffuseBlur.value=e}get textureMatrix(){return this._textureMatrix.value}set textureMatrix(e){this._textureMatrix.value=e}get hasBlur(){return this._hasBlur.value}set hasBlur(e){this._hasBlur.value=e}get mirror(){return this._mirror.value}set mirror(e){this._mirror.value=e}get mixBlur(){return this._mixBlur.value}set mixBlur(e){this._mixBlur.value=e}get mixStrength(){return this._blurStrength.value}set mixStrength(e){this._blurStrength.value=e}get minDepthThreshold(){return this._minDepthThreshold.value}set minDepthThreshold(e){this._minDepthThreshold.value=e}get maxDepthThreshold(){return this._maxDepthThreshold.value}set maxDepthThreshold(e){this._maxDepthThreshold.value=e}get depthScale(){return this._depthScale.value}set depthScale(e){this._depthScale.value=e}get depthToBlurRatioBias(){return this._depthToBlurRatioBias.value}set depthToBlurRatioBias(e){this._depthToBlurRatioBias.value=e}get distortion(){return this._distortion.value}set distortion(e){this._distortion.value=e}get mixContrast(){return this._mixContrast.value}set mixContrast(e){this._mixContrast.value=e}};const Ue=a.forwardRef(({mixBlur:c=0,mixStrength:e=1,resolution:t=256,blur:s=[0,0],minDepthThreshold:f=.9,maxDepthThreshold:d=1,depthScale:p=0,depthToBlurRatioBias:x=.25,mirror:S=0,distortion:m=1,mixContrast:_=1,distortionMap:h,reflectorOffset:U=0,...g},P)=>{he({MeshReflectorMaterialImpl:Te});const n=N(({gl:r})=>r),R=N(({camera:r})=>r),Z=N(({scene:r})=>r);s=Array.isArray(s)?s:[s,s];const A=s[0]+s[1]>0,O=s[0],$=s[1],M=a.useRef(null);a.useImperativeHandle(P,()=>M.current,[]);const[B]=a.useState(()=>new me),[D]=a.useState(()=>new y),[T]=a.useState(()=>new y),[V]=a.useState(()=>new y),[b]=a.useState(()=>new q),[j]=a.useState(()=>new y(0,0,-1)),[v]=a.useState(()=>new J),[F]=a.useState(()=>new y),[z]=a.useState(()=>new y),[E]=a.useState(()=>new J),[w]=a.useState(()=>new q),[l]=a.useState(()=>new fe),K=a.useCallback(()=>{var r;const i=M.current.parent||((r=M.current)==null||(r=r.__r3f.parent)==null?void 0:r.object);if(!i||(T.setFromMatrixPosition(i.matrixWorld),V.setFromMatrixPosition(R.matrixWorld),b.extractRotation(i.matrixWorld),D.set(0,0,1),D.applyMatrix4(b),T.addScaledVector(D,U),F.subVectors(T,V),F.dot(D)>0))return;F.reflect(D).negate(),F.add(T),b.extractRotation(R.matrixWorld),j.set(0,0,-1),j.applyMatrix4(b),j.add(V),z.subVectors(T,j),z.reflect(D).negate(),z.add(T),l.position.copy(F),l.up.set(0,1,0),l.up.applyMatrix4(b),l.up.reflect(D),l.lookAt(z),l.far=R.far,l.updateMatrixWorld(),l.projectionMatrix.copy(R.projectionMatrix),w.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),w.multiply(l.projectionMatrix),w.multiply(l.matrixWorldInverse),w.multiply(i.matrixWorld),B.setFromNormalAndCoplanarPoint(D,T),B.applyMatrix4(l.matrixWorldInverse),v.set(B.normal.x,B.normal.y,B.normal.z,B.constant);const o=l.projectionMatrix;E.x=(Math.sign(v.x)+o.elements[8])/o.elements[0],E.y=(Math.sign(v.y)+o.elements[9])/o.elements[5],E.z=-1,E.w=(1+o.elements[10])/o.elements[14],v.multiplyScalar(2/v.dot(E)),o.elements[2]=v.x,o.elements[6]=v.y,o.elements[10]=v.z+1,o.elements[14]=v.w},[R,U]),[G,Q,ee,k]=a.useMemo(()=>{const r={minFilter:I,magFilter:I,type:Y},i=new L(t,t,r);i.depthBuffer=!0,i.depthTexture=new ve(t,t),i.depthTexture.format=ce,i.depthTexture.type=de;const o=new L(t,t,r),W=new Se({gl:n,resolution:t,width:O,height:$,minDepthThreshold:f,maxDepthThreshold:d,depthScale:p,depthToBlurRatioBias:x}),te={mirror:S,textureMatrix:w,mixBlur:c,tDiffuse:i.texture,tDepth:i.depthTexture,tDiffuseBlur:o.texture,hasBlur:A,mixStrength:e,minDepthThreshold:f,maxDepthThreshold:d,depthScale:p,depthToBlurRatioBias:x,distortion:m,distortionMap:h,mixContrast:_,"defines-USE_BLUR":A?"":void 0,"defines-USE_DEPTH":p>0?"":void 0,"defines-USE_DISTORTION":h?"":void 0};return[i,o,W,te]},[n,O,$,w,t,S,A,c,e,f,d,p,x,m,h,_]);return pe(()=>{var r;const i=M.current.parent||((r=M.current)==null||(r=r.__r3f.parent)==null?void 0:r.object);if(!i)return;i.visible=!1;const o=n.xr.enabled,W=n.shadowMap.autoUpdate;K(),n.xr.enabled=!1,n.shadowMap.autoUpdate=!1,n.setRenderTarget(G),n.state.buffers.depth.setMask(!0),n.autoClear||n.clear(),n.render(Z,l),A&&ee.render(n,G,Q),n.xr.enabled=o,n.shadowMap.autoUpdate=W,i.visible=!0,n.setRenderTarget(null)}),a.createElement("meshReflectorMaterialImpl",xe({attach:"material",key:"key"+k["defines-USE_BLUR"]+k["defines-USE_DEPTH"]+k["defines-USE_DISTORTION"],ref:M},k,g))}),we=({size:c=250,...e})=>H.jsxs("mesh",{...e,children:[H.jsx("planeGeometry",{args:[c,c]}),H.jsx(Ue,{mirror:1,blur:[500,100],resolution:1024,mixBlur:12,mixStrength:1.5,roughness:1,depthScale:1.2,minDepthThreshold:.4,maxDepthThreshold:1.4})]});export{we as G};
