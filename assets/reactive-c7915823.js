import{u as w,r as M,M as E,C as P,a as R,c as S,T as f,j as t,B as T,b as B,a7 as I,G as y,V as A}from"./index-3528fe2e.js";const G=({coordinateMapper:n,radius:r=2,nPoints:e=800,cubeSideLength:o=.05})=>{const g=w(),a=M.useRef(null),j=M.useMemo(()=>new E,[]),x=P.getPalette(g).buildLut();return M.useEffect(()=>{for(let s=0;s<e;s++)a.current.setColorAt(s,x.getColor(s/e));a.current.instanceColor.needsUpdate=!0},[x,a,e]),R(({clock:s})=>{const C=s.getElapsedTime();let h,i,c,m,p,d,l;for(let u=0;u<e;u++)h=u+.5,i=Math.acos(1-2*h/e)%Math.PI,c=Math.PI*(1+Math.sqrt(5))*h%f,m=Math.cos(c)*Math.sin(i),p=Math.sin(c)*Math.sin(i),d=Math.cos(i),l=r+.25*r*n.map(S.POLAR,c/f,i/Math.PI,0,C),a.current.setMatrixAt(u,j.setPosition(m*l,p*l,d*l));a.current.instanceMatrix.needsUpdate=!0}),t.jsxs("instancedMesh",{ref:a,castShadow:!0,receiveShadow:!0,args:[new T,new B,e],children:[t.jsx("boxGeometry",{attach:"geometry",args:[o,o,o,1]}),t.jsx("meshBasicMaterial",{attach:"material",color:"white",toneMapped:!1})]})},V=({coordinateMapper:n})=>{const{radius:r,nPoints:e,unitSideLength:o}=I();return t.jsxs(t.Fragment,{children:[t.jsx(G,{coordinateMapper:n,radius:r,nPoints:e,cubeSideLength:o}),t.jsx(y,{position:new A(0,0,-r*(1+.25*n.amplitude))})]})};export{V as default};
