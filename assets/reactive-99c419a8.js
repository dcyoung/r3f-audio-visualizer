import{r as E,M as _,u as d,C as B,a as G,j as u,B as N,b as U,c as y,H as g,d as V,V as F}from"./index-8f6c4088.js";import{G as O}from"./ground-d293afaa.js";const z=({coordinateMapper:A,nPerSide:t=10,cubeSideLength:l=.5,cubeSpacingScalar:p=.1,volume:b=!0})=>{const m=E.useRef(null),i=E.useMemo(()=>new _,[]),R=b?y.CARTESIAN_3D:y.CARTESIAN_CUBE_FACES,{palette:T}=d(),I=B.getPalette(T).buildLut();return E.useEffect(()=>{let C,n,e,a,s;for(let o=0;o<t;o++)for(let r=0;r<t;r++)for(let c=0;c<t;c++)C=o*t**2+r*t+c,n=o/(t-1),e=r/(t-1),a=c/(t-1),n==0||n==1?s=Math.hypot(e-.5,a-.5)/g:e==0||e==1?s=Math.hypot(n-.5,a-.5)/g:a==0||a==1?s=Math.hypot(n-.5,e-.5)/g:s=0,m.current.setColorAt(C,I.getColor(s));m.current.instanceColor.needsUpdate=!0}),G(({clock:C})=>{const n=C.getElapsedTime(),e=t*(1+p)*l;let a,s,o,r,c,w,j,f;for(let x=0;x<t;x++)for(let h=0;h<t;h++)for(let M=0;M<t;M++)a=x*t**2+h*t+M,s=x/(t-1),o=h/(t-1),r=M/(t-1),c=e*(s-.5),w=e*(o-.5),j=e*(r-.5),i.setPosition(c,w,j),f=.1+.9*A.map(R,s,o,r,n),i.elements[0]=f,i.elements[5]=f,i.elements[10]=f,m.current.setMatrixAt(a,i);m.current.instanceMatrix.needsUpdate=!0}),u.jsxs("instancedMesh",{ref:m,castShadow:!0,receiveShadow:!0,args:[new N,new U,t**3],children:[u.jsx("boxGeometry",{attach:"geometry",args:[l,l,l,1]}),u.jsx("meshBasicMaterial",{attach:"material",color:"white",toneMapped:!1})]})},v=({coordinateMapper:A})=>{const{nPerSide:t,unitSideLength:l,unitSpacingScalar:p,volume:b}=V();return u.jsxs(u.Fragment,{children:[u.jsx(z,{coordinateMapper:A,nPerSide:t,cubeSideLength:l,cubeSpacingScalar:p,volume:b}),u.jsx(O,{position:new F(0,0,-.75*t*(1+p)*l)})]})};export{v as default};
