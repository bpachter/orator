import{g as A,b as N,r as q,c as z,A as D,j as t,f as E,C as o,h as O,s as C,E as j,F as B,G as w,H as f,I as U,J as F,u as K,t as Y,L as H,p as s,S as P,B as L,T as h,K as G}from"./index-BuxqhA_e.js";import{P as u,S as J}from"./SectionHeader-DB5b3GPW.js";import{K as V}from"./KpiChip-CQTLWk9A.js";import{E as W}from"./ErrorState-DETxpmvz.js";import{D as X}from"./DownloadButton-BdQ5omXv.js";import{P as T}from"./PlotlyChart-CH3gM5x9.js";import"./Close-BQ8sRbur.js";function _(e){return A("MuiLinearProgress",e)}N("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","bar1","bar2","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);const R=4,k=w`
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
`,Q=typeof k!="string"?B`
        animation: ${k} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      `:null,$=w`
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
`,Z=typeof $!="string"?B`
        animation: ${$} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
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
`,rr=typeof S!="string"?B`
        animation: ${S} 3s infinite linear;
      `:null,er=e=>{const{classes:r,variant:a,color:n}=e,l={root:["root",`color${o(n)}`,a],dashed:["dashed",`dashedColor${o(n)}`],bar1:["bar","bar1",`barColor${o(n)}`,(a==="indeterminate"||a==="query")&&"bar1Indeterminate",a==="determinate"&&"bar1Determinate",a==="buffer"&&"bar1Buffer"],bar2:["bar","bar2",a!=="buffer"&&`barColor${o(n)}`,a==="buffer"&&`color${o(n)}`,(a==="indeterminate"||a==="query")&&"bar2Indeterminate",a==="buffer"&&"bar2Buffer"]};return O(l,_,r)},I=(e,r)=>e.vars?e.vars.palette.LinearProgress[`${r}Bg`]:e.palette.mode==="light"?U(e.palette[r].main,.62):F(e.palette[r].main,.5),ar=C("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.root,r[`color${o(a.color)}`],r[a.variant]]}})(j(({theme:e})=>({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},variants:[...Object.entries(e.palette).filter(f()).map(([r])=>({props:{color:r},style:{backgroundColor:I(e,r)}})),{props:({ownerState:r})=>r.color==="inherit"&&r.variant!=="buffer",style:{"&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}}},{props:{variant:"buffer"},style:{backgroundColor:"transparent"}},{props:{variant:"query"},style:{transform:"rotate(180deg)"}}]}))),tr=C("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.dashed,r[`dashedColor${o(a.color)}`]]}})(j(({theme:e})=>({position:"absolute",marginTop:0,height:"100%",width:"100%",backgroundSize:"10px 10px",backgroundPosition:"0 -23px",variants:[{props:{color:"inherit"},style:{opacity:.3,backgroundImage:"radial-gradient(currentColor 0%, currentColor 16%, transparent 42%)"}},...Object.entries(e.palette).filter(f()).map(([r])=>{const a=I(e,r);return{props:{color:r},style:{backgroundImage:`radial-gradient(${a} 0%, ${a} 16%, transparent 42%)`}}})]})),rr||{animation:`${S} 3s infinite linear`}),ir=C("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.bar,r.bar1,r[`barColor${o(a.color)}`],(a.variant==="indeterminate"||a.variant==="query")&&r.bar1Indeterminate,a.variant==="determinate"&&r.bar1Determinate,a.variant==="buffer"&&r.bar1Buffer]}})(j(({theme:e})=>({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",variants:[{props:{color:"inherit"},style:{backgroundColor:"currentColor"}},...Object.entries(e.palette).filter(f()).map(([r])=>({props:{color:r},style:{backgroundColor:(e.vars||e).palette[r].main}})),{props:{variant:"determinate"},style:{transition:`transform .${R}s linear`}},{props:{variant:"buffer"},style:{zIndex:1,transition:`transform .${R}s linear`}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:{width:"auto"}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:Q||{animation:`${k} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite`}}]}))),nr=C("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.bar,r.bar2,r[`barColor${o(a.color)}`],(a.variant==="indeterminate"||a.variant==="query")&&r.bar2Indeterminate,a.variant==="buffer"&&r.bar2Buffer]}})(j(({theme:e})=>({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",variants:[...Object.entries(e.palette).filter(f()).map(([r])=>({props:{color:r},style:{"--LinearProgressBar2-barColor":(e.vars||e).palette[r].main}})),{props:({ownerState:r})=>r.variant!=="buffer"&&r.color!=="inherit",style:{backgroundColor:"var(--LinearProgressBar2-barColor, currentColor)"}},{props:({ownerState:r})=>r.variant!=="buffer"&&r.color==="inherit",style:{backgroundColor:"currentColor"}},{props:{color:"inherit"},style:{opacity:.3}},...Object.entries(e.palette).filter(f()).map(([r])=>({props:{color:r,variant:"buffer"},style:{backgroundColor:I(e,r),transition:`transform .${R}s linear`}})),{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:{width:"auto"}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:Z||{animation:`${$} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite`}}]}))),sr=q.forwardRef(function(r,a){const n=z({props:r,name:"MuiLinearProgress"}),{className:l,color:m="primary",value:p,valueBuffer:b,variant:c="indeterminate",...g}=n,i={...n,color:m,variant:c},y=er(i),M=D(),v={},x={bar1:{},bar2:{}};if((c==="determinate"||c==="buffer")&&p!==void 0){v["aria-valuenow"]=Math.round(p),v["aria-valuemin"]=0,v["aria-valuemax"]=100;let d=p-100;M&&(d=-d),x.bar1.transform=`translateX(${d}%)`}if(c==="buffer"&&b!==void 0){let d=(b||0)-100;M&&(d=-d),x.bar2.transform=`translateX(${d}%)`}return t.jsxs(ar,{className:E(y.root,l),ownerState:i,role:"progressbar",...v,ref:a,...g,children:[c==="buffer"?t.jsx(tr,{className:y.dashed,ownerState:i}):null,t.jsx(ir,{className:y.bar1,ownerState:i,style:x.bar1}),c==="determinate"?null:t.jsx(nr,{className:y.bar2,ownerState:i,style:x.bar2})]})});function or(e){return e>=.66?s.negative:e>=.33?s.warning:s.positive}function lr(e){return e>=.66?"Elevated":e>=.33?"Moderate":"Low"}function gr(){var g;const{filters:e}=K(),r=Y(e.range);if(r.isLoading)return t.jsx(u,{title:"Recession Signals",subtitle:"Crunching leading indicators…",children:t.jsx(H,{})});if(r.isError)return t.jsx(u,{title:"Recession Signals",children:t.jsx(W,{message:(g=r.error)==null?void 0:g.message,onRetry:()=>r.refetch()})});const a=r.data,n=a.composite_score,l=or(n),m=a.series.UNRATE??[],p=a.series.T10Y2Y??[],b=[{type:"scatter",mode:"lines",x:m.map(i=>i.date),y:m.map(i=>i.value),line:{color:s.series.blue,width:1.75,shape:"spline"},fill:"tozeroy",fillcolor:s.series.blue+"18",hovertemplate:"%{x}: %{y:.2f}%<extra></extra>"}],c=[{type:"scatter",mode:"lines",x:p.map(i=>i.date),y:p.map(i=>i.value),line:{color:s.series.green,width:1.75,shape:"spline"},hovertemplate:"%{x}: %{y:.2f}<extra></extra>"}];return t.jsxs(P,{spacing:2,children:[t.jsx(J,{eyebrow:"Analytics",title:"Recession Signals",subtitle:"Composite leading indicator",updated:a.updated,action:t.jsx(X,{series:a.series,filename:"recession-signals"})}),t.jsx(u,{children:t.jsxs(P,{direction:{xs:"column",md:"row"},spacing:3,alignItems:"center",children:[t.jsxs(L,{sx:{flex:1,width:"100%"},children:[t.jsxs(P,{direction:"row",alignItems:"baseline",spacing:2,children:[t.jsxs(h,{variant:"h2",sx:{color:l,fontFamily:"JetBrains Mono, monospace",fontWeight:600},children:[Math.round(n*100),"%"]}),t.jsx(G,{label:lr(n),sx:{bgcolor:l+"22",color:l,fontWeight:600}})]}),t.jsx(h,{variant:"body2",color:"text.secondary",sx:{mt:.5},children:"Share of leading recession signals currently triggered"}),t.jsx(sr,{variant:"determinate",value:n*100,sx:{mt:2,height:10,borderRadius:5,bgcolor:s.surfaceAlt,"& .MuiLinearProgress-bar":{bgcolor:l}}})]}),t.jsx(L,{sx:{flex:2,width:"100%",display:"grid",gridTemplateColumns:{xs:"1fr",sm:"repeat(3, 1fr)"},gap:1.5},children:a.signals.map(i=>t.jsxs(u,{dense:!0,padding:1.5,children:[t.jsx(V,{label:i.label,value:i.triggered?"TRIGGERED":"NORMAL",valueColor:i.triggered?s.negative:s.positive,size:"md",align:"left"}),t.jsx(h,{variant:"caption",color:"text.secondary",display:"block",sx:{mt:.5},children:i.description}),i.value!==null&&t.jsxs(h,{variant:"caption",sx:{fontFamily:"JetBrains Mono, monospace",color:"text.secondary"},children:["Value: ",i.value.toFixed(2)]})]},i.id))})]})}),t.jsxs(L,{sx:{display:"grid",gridTemplateColumns:{xs:"1fr",md:"repeat(2, 1fr)"},gap:2},children:[t.jsx(u,{dense:!0,title:"Unemployment Rate",subtitle:"Sahm Rule input (3M avg)",children:t.jsx(T,{traces:b,minHeight:220,ariaLabel:"Unemployment rate"})}),t.jsx(u,{dense:!0,title:"10Y – 2Y Spread",subtitle:"Negative = inverted curve",children:t.jsx(T,{traces:c,layout:{shapes:[{type:"line",xref:"paper",x0:0,x1:1,y0:0,y1:0,line:{color:s.border,width:1,dash:"dot"}}]},minHeight:220,ariaLabel:"10Y minus 2Y Treasury spread"})})]})]})}export{gr as RecessionSignalsPanel};
