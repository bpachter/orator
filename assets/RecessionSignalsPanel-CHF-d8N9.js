import{h as z,i as N,r as R,k as A,l as O,j as t,m as E,n as s,o as D,s as h,q as C,t as w,v as M,w as g,x as U,y as Y,z as K,L as F,p as o,S as P,B as L,T as x,C as H}from"./index-7sSs-F95.js";import{P as f,E as G,S as J,K as V}from"./SectionHeader-Wv4Y3xUr.js";import{P as q}from"./PlotlyChart-C6YWFWW3.js";function W(e){return z("MuiLinearProgress",e)}N("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","bar1","bar2","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);const $=4,k=M`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`,X=typeof k!="string"?w`
        animation: ${k} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      `:null,S=M`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`,_=typeof S!="string"?w`
        animation: ${S} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
      `:null,B=M`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`,Q=typeof B!="string"?w`
        animation: ${B} 3s infinite linear;
      `:null,Z=e=>{const{classes:r,variant:a,color:n}=e,d={root:["root",`color${s(n)}`,a],dashed:["dashed",`dashedColor${s(n)}`],bar1:["bar","bar1",`barColor${s(n)}`,(a==="indeterminate"||a==="query")&&"bar1Indeterminate",a==="determinate"&&"bar1Determinate",a==="buffer"&&"bar1Buffer"],bar2:["bar","bar2",a!=="buffer"&&`barColor${s(n)}`,a==="buffer"&&`color${s(n)}`,(a==="indeterminate"||a==="query")&&"bar2Indeterminate",a==="buffer"&&"bar2Buffer"]};return D(d,W,r)},I=(e,r)=>e.vars?e.vars.palette.LinearProgress[`${r}Bg`]:e.palette.mode==="light"?U(e.palette[r].main,.62):Y(e.palette[r].main,.5),rr=h("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.root,r[`color${s(a.color)}`],r[a.variant]]}})(C(({theme:e})=>({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},variants:[...Object.entries(e.palette).filter(g()).map(([r])=>({props:{color:r},style:{backgroundColor:I(e,r)}})),{props:({ownerState:r})=>r.color==="inherit"&&r.variant!=="buffer",style:{"&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}}},{props:{variant:"buffer"},style:{backgroundColor:"transparent"}},{props:{variant:"query"},style:{transform:"rotate(180deg)"}}]}))),er=h("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.dashed,r[`dashedColor${s(a.color)}`]]}})(C(({theme:e})=>({position:"absolute",marginTop:0,height:"100%",width:"100%",backgroundSize:"10px 10px",backgroundPosition:"0 -23px",variants:[{props:{color:"inherit"},style:{opacity:.3,backgroundImage:"radial-gradient(currentColor 0%, currentColor 16%, transparent 42%)"}},...Object.entries(e.palette).filter(g()).map(([r])=>{const a=I(e,r);return{props:{color:r},style:{backgroundImage:`radial-gradient(${a} 0%, ${a} 16%, transparent 42%)`}}})]})),Q||{animation:`${B} 3s infinite linear`}),ar=h("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.bar,r.bar1,r[`barColor${s(a.color)}`],(a.variant==="indeterminate"||a.variant==="query")&&r.bar1Indeterminate,a.variant==="determinate"&&r.bar1Determinate,a.variant==="buffer"&&r.bar1Buffer]}})(C(({theme:e})=>({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",variants:[{props:{color:"inherit"},style:{backgroundColor:"currentColor"}},...Object.entries(e.palette).filter(g()).map(([r])=>({props:{color:r},style:{backgroundColor:(e.vars||e).palette[r].main}})),{props:{variant:"determinate"},style:{transition:`transform .${$}s linear`}},{props:{variant:"buffer"},style:{zIndex:1,transition:`transform .${$}s linear`}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:{width:"auto"}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:X||{animation:`${k} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite`}}]}))),tr=h("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.bar,r.bar2,r[`barColor${s(a.color)}`],(a.variant==="indeterminate"||a.variant==="query")&&r.bar2Indeterminate,a.variant==="buffer"&&r.bar2Buffer]}})(C(({theme:e})=>({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",variants:[...Object.entries(e.palette).filter(g()).map(([r])=>({props:{color:r},style:{"--LinearProgressBar2-barColor":(e.vars||e).palette[r].main}})),{props:({ownerState:r})=>r.variant!=="buffer"&&r.color!=="inherit",style:{backgroundColor:"var(--LinearProgressBar2-barColor, currentColor)"}},{props:({ownerState:r})=>r.variant!=="buffer"&&r.color==="inherit",style:{backgroundColor:"currentColor"}},{props:{color:"inherit"},style:{opacity:.3}},...Object.entries(e.palette).filter(g()).map(([r])=>({props:{color:r,variant:"buffer"},style:{backgroundColor:I(e,r),transition:`transform .${$}s linear`}})),{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:{width:"auto"}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:_||{animation:`${S} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite`}}]}))),ir=R.forwardRef(function(r,a){const n=A({props:r,name:"MuiLinearProgress"}),{className:d,color:m="primary",value:p,valueBuffer:b,variant:l="indeterminate",...j}=n,c={...n,color:m,variant:l},i=Z(c),T=O(),y={},v={bar1:{},bar2:{}};if((l==="determinate"||l==="buffer")&&p!==void 0){y["aria-valuenow"]=Math.round(p),y["aria-valuemin"]=0,y["aria-valuemax"]=100;let u=p-100;T&&(u=-u),v.bar1.transform=`translateX(${u}%)`}if(l==="buffer"&&b!==void 0){let u=(b||0)-100;T&&(u=-u),v.bar2.transform=`translateX(${u}%)`}return t.jsxs(rr,{className:E(i.root,d),ownerState:c,role:"progressbar",...y,ref:a,...j,children:[l==="buffer"?t.jsx(er,{className:i.dashed,ownerState:c}):null,t.jsx(ar,{className:i.bar1,ownerState:c,style:v.bar1}),l==="determinate"?null:t.jsx(tr,{className:i.bar2,ownerState:c,style:v.bar2})]})});function nr(e){return e>=.66?o.negative:e>=.33?o.warning:o.positive}function or(e){return e>=.66?"Elevated":e>=.33?"Moderate":"Low"}function dr(){var c;const e=K();if(e.isLoading)return t.jsx(f,{title:"Recession Signals",subtitle:"Crunching leading indicators…",children:t.jsx(F,{})});if(e.isError)return t.jsx(f,{title:"Recession Signals",children:t.jsx(G,{message:(c=e.error)==null?void 0:c.message,onRetry:()=>e.refetch()})});const r=e.data,a=r.composite_score,n=nr(a),d=r.series.UNRATE??[],m=r.series.T10Y2Y??[],p=o.series.blue,b=o.series.green,l=R.useMemo(()=>[{type:"scatter",mode:"lines",x:d.map(i=>i.date),y:d.map(i=>i.value),line:{color:p,width:1.75,shape:"spline"},fill:"tozeroy",fillcolor:p+"18",hovertemplate:"%{x}: %{y:.2f}%<extra></extra>"}],[d,p]),j=R.useMemo(()=>[{type:"scatter",mode:"lines",x:m.map(i=>i.date),y:m.map(i=>i.value),line:{color:b,width:1.75,shape:"spline"},hovertemplate:"%{x}: %{y:.2f}<extra></extra>"}],[m,b]);return t.jsxs(P,{spacing:2,children:[t.jsx(J,{eyebrow:"Analytics",title:"Recession Signals",subtitle:`Composite leading indicator${r.updated?` · updated ${r.updated}`:""}`}),t.jsx(f,{children:t.jsxs(P,{direction:{xs:"column",md:"row"},spacing:3,alignItems:"center",children:[t.jsxs(L,{sx:{flex:1,width:"100%"},children:[t.jsxs(P,{direction:"row",alignItems:"baseline",spacing:2,children:[t.jsxs(x,{variant:"h2",sx:{color:n,fontFamily:"JetBrains Mono, monospace",fontWeight:600},children:[Math.round(a*100),"%"]}),t.jsx(H,{label:or(a),sx:{bgcolor:n+"22",color:n,fontWeight:600}})]}),t.jsx(x,{variant:"body2",color:"text.secondary",sx:{mt:.5},children:"Share of leading recession signals currently triggered"}),t.jsx(ir,{variant:"determinate",value:a*100,sx:{mt:2,height:10,borderRadius:5,bgcolor:o.surfaceAlt,"& .MuiLinearProgress-bar":{bgcolor:n}}})]}),t.jsx(L,{sx:{flex:2,width:"100%",display:"grid",gridTemplateColumns:{xs:"1fr",sm:"repeat(3, 1fr)"},gap:1.5},children:r.signals.map(i=>t.jsxs(f,{dense:!0,padding:1.5,children:[t.jsx(V,{label:i.label,value:i.triggered?"TRIGGERED":"NORMAL",valueColor:i.triggered?o.negative:o.positive,size:"md",align:"left"}),t.jsx(x,{variant:"caption",color:"text.secondary",display:"block",sx:{mt:.5},children:i.description}),i.value!==null&&t.jsxs(x,{variant:"caption",sx:{fontFamily:"JetBrains Mono, monospace",color:"text.secondary"},children:["Value: ",i.value.toFixed(2)]})]},i.id))})]})}),t.jsxs(L,{sx:{display:"grid",gridTemplateColumns:{xs:"1fr",md:"repeat(2, 1fr)"},gap:2},children:[t.jsx(f,{dense:!0,title:"Unemployment Rate",subtitle:"Sahm Rule input (3M avg)",children:t.jsx(q,{traces:l,minHeight:220,ariaLabel:"Unemployment rate"})}),t.jsx(f,{dense:!0,title:"10Y – 2Y Spread",subtitle:"Negative = inverted curve",children:t.jsx(q,{traces:j,layout:{shapes:[{type:"line",xref:"paper",x0:0,x1:1,y0:0,y1:0,line:{color:o.border,width:1,dash:"dot"}}]},minHeight:220,ariaLabel:"10Y minus 2Y Treasury spread"})})]})]})}export{dr as RecessionSignalsPanel};
