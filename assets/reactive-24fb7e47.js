import{r as h,M as P,u as S,C as A,a as T,c as B,j as o,B as C,b as I,a6 as V,G as Y,V as z}from"./index-3528fe2e.js";const O=({coordinateMapper:i,nGridRows:e=100,nGridCols:t=100,cubeSideLength:s=.025,cubeSpacingScalar:l=5})=>{const n=h.useRef(null),M=h.useMemo(()=>new P,[]),w=S(),g=A.getPalette(w).buildLut();return h.useEffect(()=>{if(!g)return;const f=Math.hypot(.5,.5);let u,m,x,c;for(let a=0;a<e;a++)for(let r=0;r<t;r++)u=a*t+r,m=a/(e-1),x=r/(t-1),c=Math.hypot(m-.5,x-.5)/f,n.current.setColorAt(u,g.getColor(c));n.current.instanceColor.needsUpdate=!0}),T(({clock:f})=>{const u=f.getElapsedTime(),m=e*l*s,x=t*l*s;let c,a,r,j,y,E;for(let p=0;p<e;p++)for(let d=0;d<t;d++)c=p*t+d,a=p/(e-1),r=d/(t-1),E=i.map(B.CARTESIAN_2D,a,r,0,u),j=m*(a-.5),y=x*(r-.5),M.setPosition(j,y,E),n.current.setMatrixAt(c,M);n.current.instanceMatrix.needsUpdate=!0}),o.jsxs("instancedMesh",{ref:n,castShadow:!0,receiveShadow:!0,args:[new C,new I,e*t],children:[o.jsx("boxGeometry",{attach:"geometry",args:[s,s,s,1]}),o.jsx("meshPhongMaterial",{attach:"material",color:"white",toneMapped:!1})]})},X=({coordinateMapper:i})=>{const{nRows:e,nCols:t,unitSideLength:s,unitSpacingScalar:l}=V();return o.jsxs(o.Fragment,{children:[o.jsx(O,{coordinateMapper:i,nGridRows:e,nGridCols:t,cubeSideLength:s,cubeSpacingScalar:l}),o.jsx(Y,{position:new z(0,0,-2.5*i.amplitude)})]})};export{X as default};
