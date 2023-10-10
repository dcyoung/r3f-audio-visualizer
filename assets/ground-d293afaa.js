import{x as ee,A as u,l as C,a1 as te,Z as re,W as L,L as I,O as J,J as ae,ae as ie,af as ne,ag as H,a2 as oe,aL as se,au as le,r,ak as V,aM as ue,V as w,M as G,n as q,$ as he,D as fe,aN as me,aO as ve,a as ce,aP as de,j as O}from"./index-8f6c4088.js";function pe(f){return function(e){f.forEach(function(t){typeof t=="function"?t(e):t!=null&&(t.current=e)})}}class xe extends ee{constructor(e=new C){super({uniforms:{inputBuffer:new u(null),depthBuffer:new u(null),resolution:new u(new C),texelSize:new u(new C),halfTexelSize:new u(new C),kernel:new u(0),scale:new u(1),cameraNear:new u(0),cameraFar:new u(1),minDepthThreshold:new u(0),maxDepthThreshold:new u(1),depthScale:new u(0),depthToBlurRatioBias:new u(.25)},fragmentShader:`#include <common>
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
          #include <${parseInt(te.replace(/\D+/g,""))>=154?"colorspace_fragment":"encodings_fragment"}>
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
        }`,blending:re,depthWrite:!1,depthTest:!1}),this.toneMapped=!1,this.setTexelSize(e.x,e.y),this.kernel=new Float32Array([0,1,2,2,3])}setTexelSize(e,t){this.uniforms.texelSize.value.set(e,t),this.uniforms.halfTexelSize.value.set(e,t).multiplyScalar(.5)}setResolution(e){this.uniforms.resolution.value.copy(e)}}class _e{constructor({gl:e,resolution:t,width:i=500,height:v=500,minDepthThreshold:d=0,maxDepthThreshold:p=1,depthScale:x=0,depthToBlurRatioBias:S=.25}){this.renderToScreen=!1,this.renderTargetA=new L(t,t,{minFilter:I,magFilter:I,stencilBuffer:!1,depthBuffer:!1,type:J}),this.renderTargetB=this.renderTargetA.clone(),this.convolutionMaterial=new xe,this.convolutionMaterial.setTexelSize(1/i,1/v),this.convolutionMaterial.setResolution(new C(i,v)),this.scene=new ae,this.camera=new ie,this.convolutionMaterial.uniforms.minDepthThreshold.value=d,this.convolutionMaterial.uniforms.maxDepthThreshold.value=p,this.convolutionMaterial.uniforms.depthScale.value=x,this.convolutionMaterial.uniforms.depthToBlurRatioBias.value=S,this.convolutionMaterial.defines.USE_DEPTH=x>0;const m=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),_=new Float32Array([0,0,2,0,0,2]),h=new ne;h.setAttribute("position",new H(m,3)),h.setAttribute("uv",new H(_,2)),this.screen=new oe(h,this.convolutionMaterial),this.screen.frustumCulled=!1,this.scene.add(this.screen)}render(e,t,i){const v=this.scene,d=this.camera,p=this.renderTargetA,x=this.renderTargetB;let S=this.convolutionMaterial,m=S.uniforms;m.depthBuffer.value=t.depthTexture;const _=S.kernel;let h=t,M,g,P;for(g=0,P=_.length-1;g<P;++g)M=g&1?x:p,m.kernel.value=_[g],m.inputBuffer.value=h.texture,e.setRenderTarget(M),e.render(v,d),h=M;m.kernel.value=_[g],m.inputBuffer.value=h.texture,e.setRenderTarget(this.renderToScreen?null:i),e.render(v,d)}}let ge=class extends se{constructor(e={}){super(e),this._tDepth={value:null},this._distortionMap={value:null},this._tDiffuse={value:null},this._tDiffuseBlur={value:null},this._textureMatrix={value:null},this._hasBlur={value:!1},this._mirror={value:0},this._mixBlur={value:0},this._blurStrength={value:.5},this._minDepthThreshold={value:.9},this._maxDepthThreshold={value:1},this._depthScale={value:0},this._depthToBlurRatioBias={value:.25},this._distortion={value:1},this._mixContrast={value:1},this.setValues(e)}onBeforeCompile(e){var t;(t=e.defines)!=null&&t.USE_UV||(e.defines.USE_UV=""),e.uniforms.hasBlur=this._hasBlur,e.uniforms.tDiffuse=this._tDiffuse,e.uniforms.tDepth=this._tDepth,e.uniforms.distortionMap=this._distortionMap,e.uniforms.tDiffuseBlur=this._tDiffuseBlur,e.uniforms.textureMatrix=this._textureMatrix,e.uniforms.mirror=this._mirror,e.uniforms.mixBlur=this._mixBlur,e.uniforms.mixStrength=this._blurStrength,e.uniforms.minDepthThreshold=this._minDepthThreshold,e.uniforms.maxDepthThreshold=this._maxDepthThreshold,e.uniforms.depthScale=this._depthScale,e.uniforms.depthToBlurRatioBias=this._depthToBlurRatioBias,e.uniforms.distortion=this._distortion,e.uniforms.mixContrast=this._mixContrast,e.vertexShader=`
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
      `)}get tDiffuse(){return this._tDiffuse.value}set tDiffuse(e){this._tDiffuse.value=e}get tDepth(){return this._tDepth.value}set tDepth(e){this._tDepth.value=e}get distortionMap(){return this._distortionMap.value}set distortionMap(e){this._distortionMap.value=e}get tDiffuseBlur(){return this._tDiffuseBlur.value}set tDiffuseBlur(e){this._tDiffuseBlur.value=e}get textureMatrix(){return this._textureMatrix.value}set textureMatrix(e){this._textureMatrix.value=e}get hasBlur(){return this._hasBlur.value}set hasBlur(e){this._hasBlur.value=e}get mirror(){return this._mirror.value}set mirror(e){this._mirror.value=e}get mixBlur(){return this._mixBlur.value}set mixBlur(e){this._mixBlur.value=e}get mixStrength(){return this._blurStrength.value}set mixStrength(e){this._blurStrength.value=e}get minDepthThreshold(){return this._minDepthThreshold.value}set minDepthThreshold(e){this._minDepthThreshold.value=e}get maxDepthThreshold(){return this._maxDepthThreshold.value}set maxDepthThreshold(e){this._maxDepthThreshold.value=e}get depthScale(){return this._depthScale.value}set depthScale(e){this._depthScale.value=e}get depthToBlurRatioBias(){return this._depthToBlurRatioBias.value}set depthToBlurRatioBias(e){this._depthToBlurRatioBias.value=e}get distortion(){return this._distortion.value}set distortion(e){this._distortion.value=e}get mixContrast(){return this._mixContrast.value}set mixContrast(e){this._mixContrast.value=e}};le({MeshReflectorMaterialImpl:ge});const De=r.forwardRef(({mixBlur:f=0,mixStrength:e=1,resolution:t=256,blur:i=[0,0],minDepthThreshold:v=.9,maxDepthThreshold:d=1,depthScale:p=0,depthToBlurRatioBias:x=.25,mirror:S=0,distortion:m=1,mixContrast:_=1,distortionMap:h,reflectorOffset:M=0,...g},P)=>{const n=V(({gl:s})=>s),y=V(({camera:s})=>s),X=V(({scene:s})=>s);i=Array.isArray(i)?i:[i,i];const A=i[0]+i[1]>0,R=r.useRef(null),[U]=r.useState(()=>new ue),[D]=r.useState(()=>new w),[T]=r.useState(()=>new w),[W]=r.useState(()=>new w),[F]=r.useState(()=>new G),[j]=r.useState(()=>new w(0,0,-1)),[c]=r.useState(()=>new q),[b]=r.useState(()=>new w),[z]=r.useState(()=>new w),[E]=r.useState(()=>new q),[B]=r.useState(()=>new G),[l]=r.useState(()=>new he),Z=r.useCallback(()=>{var s;const a=R.current.parent||((s=R.current)==null?void 0:s.__r3f.parent);if(!a||(T.setFromMatrixPosition(a.matrixWorld),W.setFromMatrixPosition(y.matrixWorld),F.extractRotation(a.matrixWorld),D.set(0,0,1),D.applyMatrix4(F),T.addScaledVector(D,M),b.subVectors(T,W),b.dot(D)>0))return;b.reflect(D).negate(),b.add(T),F.extractRotation(y.matrixWorld),j.set(0,0,-1),j.applyMatrix4(F),j.add(W),z.subVectors(T,j),z.reflect(D).negate(),z.add(T),l.position.copy(b),l.up.set(0,1,0),l.up.applyMatrix4(F),l.up.reflect(D),l.lookAt(z),l.far=y.far,l.updateMatrixWorld(),l.projectionMatrix.copy(y.projectionMatrix),B.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),B.multiply(l.projectionMatrix),B.multiply(l.matrixWorldInverse),B.multiply(a.matrixWorld),U.setFromNormalAndCoplanarPoint(D,T),U.applyMatrix4(l.matrixWorldInverse),c.set(U.normal.x,U.normal.y,U.normal.z,U.constant);const o=l.projectionMatrix;E.x=(Math.sign(c.x)+o.elements[8])/o.elements[0],E.y=(Math.sign(c.y)+o.elements[9])/o.elements[5],E.z=-1,E.w=(1+o.elements[10])/o.elements[14],c.multiplyScalar(2/c.dot(E)),o.elements[2]=c.x,o.elements[6]=c.y,o.elements[10]=c.z+1,o.elements[14]=c.w},[y,M]),[$,K,Q,k]=r.useMemo(()=>{const s={minFilter:I,magFilter:I,type:J},a=new L(t,t,s);a.depthBuffer=!0,a.depthTexture=new fe(t,t),a.depthTexture.format=me,a.depthTexture.type=ve;const o=new L(t,t,s),N=new _e({gl:n,resolution:t,width:i[0],height:i[1],minDepthThreshold:v,maxDepthThreshold:d,depthScale:p,depthToBlurRatioBias:x}),Y={mirror:S,textureMatrix:B,mixBlur:f,tDiffuse:a.texture,tDepth:a.depthTexture,tDiffuseBlur:o.texture,hasBlur:A,mixStrength:e,minDepthThreshold:v,maxDepthThreshold:d,depthScale:p,depthToBlurRatioBias:x,distortion:m,distortionMap:h,mixContrast:_,"defines-USE_BLUR":A?"":void 0,"defines-USE_DEPTH":p>0?"":void 0,"defines-USE_DISTORTION":h?"":void 0};return[a,o,N,Y]},[n,i,B,t,S,A,f,e,v,d,p,x,m,h,_]);return ce(()=>{var s;const a=R.current.parent||((s=R.current)==null?void 0:s.__r3f.parent);if(!a)return;a.visible=!1;const o=n.xr.enabled,N=n.shadowMap.autoUpdate;Z(),n.xr.enabled=!1,n.shadowMap.autoUpdate=!1,n.setRenderTarget($),n.state.buffers.depth.setMask(!0),n.autoClear||n.clear(),n.render(X,l),A&&Q.render(n,$,K),n.xr.enabled=o,n.shadowMap.autoUpdate=N,a.visible=!0,n.setRenderTarget(null)}),r.createElement("meshReflectorMaterialImpl",de({attach:"material",key:"key"+k["defines-USE_BLUR"]+k["defines-USE_DEPTH"]+k["defines-USE_DISTORTION"],ref:pe([R,P])},k,g))}),Me=({size:f=250,...e})=>O.jsxs("mesh",{...e,children:[O.jsx("planeGeometry",{args:[f,f]}),O.jsx(De,{mirror:1,blur:[500,100],resolution:1024,mixBlur:12,mixStrength:1.5,roughness:1,depthScale:1.2,minDepthThreshold:.4,maxDepthThreshold:1.4})]});export{Me as G};
