import { useEffect, useState } from "react";
import { formatRoundedCurrency } from "../../utils/currency";

export function Metric({T,label,value,sub,col}){
  return(
    <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 18px"}}>
      <div style={{fontSize:12,color:T.sub,marginBottom:6}}>{label}</div>
      <div className="fp-num" style={{fontSize:22,fontWeight:600,marginBottom:6}}>{value}</div>
      <div style={{fontSize:11.5,color:col||T.sub}}>{sub}</div>
    </div>
  );
}

export function Section({T,title,children,style}){
  return(
    <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",marginBottom:14,...style}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>{title}</div>
      {children}
    </div>
  );
}

export function MiniGoal({g,T}){
  const [w,setW]=useState(0);
  const pct=Math.round(g.saved/g.target*100);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),80);return()=>clearTimeout(t);},[pct]);
  return(
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:5}}>
        <span style={{display:"flex",alignItems:"center",gap:6}}><g.icon size={12} color={g.color}/>{g.name}</span>
        <span style={{color:T.sub}}>{g.eta}</span>
      </div>
      <div style={{height:5,background:T.border,borderRadius:4,overflow:"hidden"}}>
        <div className="fp-fill" style={{width:`${w}%`,height:"100%",background:g.color,borderRadius:4}}/>
      </div>
      <div className="fp-num" style={{fontSize:10.5,color:T.sub,marginTop:3}}>{formatRoundedCurrency(g.saved)} de {formatRoundedCurrency(g.target)}</div>
    </div>
  );
}

export function Leg({dot,label}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:5}}>
      <span style={{width:7,height:7,borderRadius:2,background:dot}}/>{label}
    </div>
  );
}
