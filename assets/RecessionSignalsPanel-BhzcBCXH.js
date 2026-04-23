import{h as q,i as z,r as N,k as A,l as O,j as t,m as E,n as l,o as D,s as C,q as j,t as B,v as w,w as m,x as U,y as Y,z as K,L as F,p as o,S as P,B as L,T as h,C as H}from"./index-spbRNrjn.js";import{P as p,E as G,S as J,K as V}from"./SectionHeader-BhdYDtMU.js";import{P as T}from"./PlotlyChart-jRXftHb3.js";function W(e){return q("MuiLinearProgress",e)}z("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","bar1","bar2","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);const R=4,$=w`
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
`,X=typeof $!="string"?B`
        animation: ${$} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      `:null,k=w`
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
`,_=typeof k!="string"?B`
        animation: ${k} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
      `:null,S=w`
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
`,Q=typeof S!="string"?B`
        animation: ${S} 3s infinite linear;
      `:null,Z=e=>{const{classes:r,variant:a,color:n}=e,d={root:["root",`color${l(n)}`,a],dashed:["dashed",`dashedColor${l(n)}`],bar1:["bar","bar1",`barColor${l(n)}`,(a==="indeterminate"||a==="query")&&"bar1Indeterminate",a==="determinate"&&"bar1Determinate",a==="buffer"&&"bar1Buffer"],bar2:["bar","bar2",a!=="buffer"&&`barColor${l(n)}`,a==="buffer"&&`color${l(n)}`,(a==="indeterminate"||a==="query")&&"bar2Indeterminate",a==="buffer"&&"bar2Buffer"]};return D(d,W,r)},I=(e,r)=>e.vars?e.vars.palette.LinearProgress[`${r}Bg`]:e.palette.mode==="light"?U(e.palette[r].main,.62):Y(e.palette[r].main,.5),rr=C("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.root,r[`color${l(a.color)}`],r[a.variant]]}})(j(({theme:e})=>({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},variants:[...Object.entries(e.palette).filter(m()).map(([r])=>({props:{color:r},style:{backgroundColor:I(e,r)}})),{props:({ownerState:r})=>r.color==="inherit"&&r.variant!=="buffer",style:{"&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}}},{props:{variant:"buffer"},style:{backgroundColor:"transparent"}},{props:{variant:"query"},style:{transform:"rotate(180deg)"}}]}))),er=C("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.dashed,r[`dashedColor${l(a.color)}`]]}})(j(({theme:e})=>({position:"absolute",marginTop:0,height:"100%",width:"100%",backgroundSize:"10px 10px",backgroundPosition:"0 -23px",variants:[{props:{color:"inherit"},style:{opacity:.3,backgroundImage:"radial-gradient(currentColor 0%, currentColor 16%, transparent 42%)"}},...Object.entries(e.palette).filter(m()).map(([r])=>{const a=I(e,r);return{props:{color:r},style:{backgroundImage:`radial-gradient(${a} 0%, ${a} 16%, transparent 42%)`}}})]})),Q||{animation:`${S} 3s infinite linear`}),ar=C("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.bar,r.bar1,r[`barColor${l(a.color)}`],(a.variant==="indeterminate"||a.variant==="query")&&r.bar1Indeterminate,a.variant==="determinate"&&r.bar1Determinate,a.variant==="buffer"&&r.bar1Buffer]}})(j(({theme:e})=>({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",variants:[{props:{color:"inherit"},style:{backgroundColor:"currentColor"}},...Object.entries(e.palette).filter(m()).map(([r])=>({props:{color:r},style:{backgroundColor:(e.vars||e).palette[r].main}})),{props:{variant:"determinate"},style:{transition:`transform .${R}s linear`}},{props:{variant:"buffer"},style:{zIndex:1,transition:`transform .${R}s linear`}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:{width:"auto"}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:X||{animation:`${$} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite`}}]}))),tr=C("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.bar,r.bar2,r[`barColor${l(a.color)}`],(a.variant==="indeterminate"||a.variant==="query")&&r.bar2Indeterminate,a.variant==="buffer"&&r.bar2Buffer]}})(j(({theme:e})=>({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",variants:[...Object.entries(e.palette).filter(m()).map(([r])=>({props:{color:r},style:{"--LinearProgressBar2-barColor":(e.vars||e).palette[r].main}})),{props:({ownerState:r})=>r.variant!=="buffer"&&r.color!=="inherit",style:{backgroundColor:"var(--LinearProgressBar2-barColor, currentColor)"}},{props:({ownerState:r})=>r.variant!=="buffer"&&r.color==="inherit",style:{backgroundColor:"currentColor"}},{props:{color:"inherit"},style:{opacity:.3}},...Object.entries(e.palette).filter(m()).map(([r])=>({props:{color:r,variant:"buffer"},style:{backgroundColor:I(e,r),transition:`transform .${R}s linear`}})),{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:{width:"auto"}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:_||{animation:`${k} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite`}}]}))),ir=N.forwardRef(function(r,a){const n=A({props:r,name:"MuiLinearProgress"}),{className:d,color:b="primary",value:u,valueBuffer:g,variant:s="indeterminate",...i}=n,f={...n,color:b,variant:s},y=Z(f),M=O(),v={},x={bar1:{},bar2:{}};if((s==="determinate"||s==="buffer")&&u!==void 0){v["aria-valuenow"]=Math.round(u),v["aria-valuemin"]=0,v["aria-valuemax"]=100;let c=u-100;M&&(c=-c),x.bar1.transform=`translateX(${c}%)`}if(s==="buffer"&&g!==void 0){let c=(g||0)-100;M&&(c=-c),x.bar2.transform=`translateX(${c}%)`}return t.jsxs(rr,{className:E(y.root,d),ownerState:f,role:"progressbar",...v,ref:a,...i,children:[s==="buffer"?t.jsx(er,{className:y.dashed,ownerState:f}):null,t.jsx(ar,{className:y.bar1,ownerState:f,style:x.bar1}),s==="determinate"?null:t.jsx(tr,{className:y.bar2,ownerState:f,style:x.bar2})]})});function nr(e){return e>=.66?o.negative:e>=.33?o.warning:o.positive}function or(e){return e>=.66?"Elevated":e>=.33?"Moderate":"Low"}function dr(){var s;const e=K();if(e.isLoading)return t.jsx(p,{title:"Recession Signals",subtitle:"Crunching leading indicators…",children:t.jsx(F,{})});if(e.isError)return t.jsx(p,{title:"Recession Signals",children:t.jsx(G,{message:(s=e.error)==null?void 0:s.message,onRetry:()=>e.refetch()})});const r=e.data,a=r.composite_score,n=nr(a),d=r.series.UNRATE??[],b=r.series.T10Y2Y??[],u=[{type:"scatter",mode:"lines",x:d.map(i=>i.date),y:d.map(i=>i.value),line:{color:o.series.blue,width:1.75,shape:"spline"},fill:"tozeroy",fillcolor:o.series.blue+"18",hovertemplate:"%{x}: %{y:.2f}%<extra></extra>"}],g=[{type:"scatter",mode:"lines",x:b.map(i=>i.date),y:b.map(i=>i.value),line:{color:o.series.green,width:1.75,shape:"spline"},hovertemplate:"%{x}: %{y:.2f}<extra></extra>"}];return t.jsxs(P,{spacing:2,children:[t.jsx(J,{eyebrow:"Analytics",title:"Recession Signals",subtitle:`Composite leading indicator${r.updated?` · updated ${r.updated}`:""}`}),t.jsx(p,{children:t.jsxs(P,{direction:{xs:"column",md:"row"},spacing:3,alignItems:"center",children:[t.jsxs(L,{sx:{flex:1,width:"100%"},children:[t.jsxs(P,{direction:"row",alignItems:"baseline",spacing:2,children:[t.jsxs(h,{variant:"h2",sx:{color:n,fontFamily:"JetBrains Mono, monospace",fontWeight:600},children:[Math.round(a*100),"%"]}),t.jsx(H,{label:or(a),sx:{bgcolor:n+"22",color:n,fontWeight:600}})]}),t.jsx(h,{variant:"body2",color:"text.secondary",sx:{mt:.5},children:"Share of leading recession signals currently triggered"}),t.jsx(ir,{variant:"determinate",value:a*100,sx:{mt:2,height:10,borderRadius:5,bgcolor:o.surfaceAlt,"& .MuiLinearProgress-bar":{bgcolor:n}}})]}),t.jsx(L,{sx:{flex:2,width:"100%",display:"grid",gridTemplateColumns:{xs:"1fr",sm:"repeat(3, 1fr)"},gap:1.5},children:r.signals.map(i=>t.jsxs(p,{dense:!0,padding:1.5,children:[t.jsx(V,{label:i.label,value:i.triggered?"TRIGGERED":"NORMAL",valueColor:i.triggered?o.negative:o.positive,size:"md",align:"left"}),t.jsx(h,{variant:"caption",color:"text.secondary",display:"block",sx:{mt:.5},children:i.description}),i.value!==null&&t.jsxs(h,{variant:"caption",sx:{fontFamily:"JetBrains Mono, monospace",color:"text.secondary"},children:["Value: ",i.value.toFixed(2)]})]},i.id))})]})}),t.jsxs(L,{sx:{display:"grid",gridTemplateColumns:{xs:"1fr",md:"repeat(2, 1fr)"},gap:2},children:[t.jsx(p,{dense:!0,title:"Unemployment Rate",subtitle:"Sahm Rule input (3M avg)",children:t.jsx(T,{traces:u,minHeight:220,ariaLabel:"Unemployment rate"})}),t.jsx(p,{dense:!0,title:"10Y – 2Y Spread",subtitle:"Negative = inverted curve",children:t.jsx(T,{traces:g,layout:{shapes:[{type:"line",xref:"paper",x0:0,x1:1,y0:0,y1:0,line:{color:o.border,width:1,dash:"dot"}}]},minHeight:220,ariaLabel:"10Y minus 2Y Treasury spread"})})]})]})}export{dr as RecessionSignalsPanel};
