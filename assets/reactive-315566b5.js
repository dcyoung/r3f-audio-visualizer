import{r as u,S as G,M as B,u as U,C as q,a as F,j as n,B as J,b as L,G as N,V as S}from"./index-bce4be0d.js";import{e as X,c as Y,l as O}from"./easing-a3fe9c65.js";const _=({scalarTracker:i,nBoxes:e=5,gridSize:x=10,cellSize:o=.25})=>{const M=x,m=x,g=u.useMemo(()=>new G(.65,150,2*250),[250]),c=u.useRef(null),h=u.useMemo(()=>new B,[]),E=U(),C=q.getPalette(E).buildLut(),a=u.useMemo(()=>Array.from({length:e},s=>{const r=Math.floor(M*Math.random()),l=Math.floor(m*Math.random());return{fromRow:r,fromCol:l,toRow:r,toCol:l}}),[e,M,m]);return u.useEffect(()=>{for(let s=0;s<e;s++)c.current.setColorAt(s,C.getColor(s/(e-1)));c.current.instanceColor.needsUpdate=!0},[C,e]),F(()=>{if(g.step((i==null?void 0:i.getNormalizedValue())??0)){const[w,p]=Math.random()>.5?[!0,!1]:[!1,!0];for(let t=0;t<e;t++)a[t].fromRow=a[t].toRow,a[t].fromCol=a[t].toCol,w&&(a[t].toRow+=Math.random()>.5?1:-1),p&&(a[t].toCol+=Math.random()>.5?1:-1)}const s=X(Y(g.timeSinceLastEventMs/250)),r=O(Math.PI/4,3*Math.PI/4,s),l=-.5*o*Math.cos(r)/Math.sqrt(2),I=.5*o*Math.sin(r)/Math.sqrt(2);let R,j,P,b,D,d,f;a.forEach(({fromRow:w,fromCol:p,toRow:t,toCol:V},v)=>{d=t-w,f=V-p;const y=w+d*(l+.5),A=p+f*(l+.5);d!==0&&h.makeRotationY((r-Math.PI/4)*d),f!==0&&h.makeRotationX(-(r-Math.PI/4)*f),R=y/(M-1),j=A/(m-1),P=M*o*(R-.5),b=m*o*(j-.5),D=I-o/4,h.setPosition(P,b,D),c.current.setMatrixAt(v,h)}),c.current.instanceMatrix.needsUpdate=!0}),n.jsxs("instancedMesh",{ref:c,castShadow:!0,receiveShadow:!0,args:[new J,new L,e],children:[n.jsx("boxGeometry",{attach:"geometry",args:[o,o,o,1]}),n.jsx("meshBasicMaterial",{attach:"material",color:"white",toneMapped:!1})]})},Q=({scalarTracker:i})=>n.jsxs(n.Fragment,{children:[n.jsx(_,{scalarTracker:i??{getNormalizedValue:()=>Math.sin(.0025*Date.now())+1},nBoxes:200,gridSize:100,cellSize:1}),n.jsx(N,{position:new S(0,0,-1/2)})]});export{Q as default};
