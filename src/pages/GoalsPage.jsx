import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatRoundedCurrency } from "../utils/currency";
import { Metric } from "../components/ui/FinanceComponents";
import { api } from "../services/api";

export default function PageGoals({T,goals,setGoals,setModal,toast}){
  const del=async id=>{try{await api.goals.remove(id);setGoals(gs=>gs.filter(g=>g.id!==id));toast("info","Objetivo eliminado.");}catch(error){toast("error",error.message);}};
  return(
    <div className="page">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
        <Metric T={T} label="Total em poupança" value={formatRoundedCurrency(goals.reduce((a,g)=>a+g.saved,0))} sub={`${goals.length} objetivos`} col={T.accent}/>
        <Metric T={T} label="Contribuição mensal" value={formatRoundedCurrency(goals.reduce((a,g)=>a+g.monthly,0))} sub="total comprometido" col={T.accent2}/>
        <Metric T={T} label="Poupança necessária" value={formatRoundedCurrency(goals.reduce((a,g)=>a+(g.target-g.saved),0))} sub="para atingir objetivos" col={T.warn}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {goals.map((g,i)=><GoalCard key={g.id} g={g} T={T} delay={i*.07} onDelete={()=>del(g.id)} onContribute={()=>setModal({type:"contributeGoal",data:g})}/>)}
        <div className="fp-card stagger" onClick={()=>setModal({type:"addGoal"})} style={{border:`1.5px dashed ${T.border}`,borderRadius:16,minHeight:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",color:T.sub,animationDelay:`${goals.length*.07}s`,background:"transparent"}}>
          <div style={{width:38,height:38,borderRadius:"50%",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Plus size={16}/></div>
          <div style={{fontSize:12.5,fontWeight:500}}>Criar objetivo</div>
        </div>
      </div>
    </div>
  );
}

function GoalCard({g,T,delay,onDelete,onContribute}){
  const [w,setW]=useState(0);
  const pct=Math.round(g.saved/g.target*100);
  const R=42;
  const circ=2*Math.PI*R;
  useEffect(()=>{const t=setTimeout(()=>setW(pct),130);return()=>clearTimeout(t);},[pct]);
  return(
    <div className="fp-card stagger" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:18,animationDelay:`${delay}s`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:34,height:34,borderRadius:10,background:`${g.color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}><g.icon size={16} color={g.color}/></div>
          <div><div style={{fontSize:13,fontWeight:600}}>{g.name}</div><div style={{fontSize:11,color:T.sub}}>Meta: {g.eta}</div></div>
        </div>
        <div className="fp-btn" onClick={onDelete}><Trash2 size={13} color={T.mut}/></div>
      </div>
      <div style={{position:"relative",width:96,height:96,margin:"0 auto 12px"}}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{transform:"rotate(-90deg)"}}>
          <circle cx="48" cy="48" r={R} fill="none" stroke={T.border} strokeWidth="8"/>
          <circle cx="48" cy="48" r={R} fill="none" stroke={g.color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ*(1-w/100)} style={{transition:"stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)"}}/>
        </svg>
        <div className="fp-num" style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:600}}>{pct}%</div>
      </div>
      <div className="fp-num" style={{textAlign:"center",fontSize:12.5,marginBottom:12}}>{formatRoundedCurrency(g.saved)} <span style={{color:T.sub}}>de {formatRoundedCurrency(g.target)}</span></div>
      <div style={{paddingTop:10,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",fontSize:11,color:T.sub,marginBottom:8}}>
        <span>Mensal</span><span className="fp-num" style={{color:T.text,fontWeight:500}}>{formatRoundedCurrency(g.monthly)}</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.sub,marginBottom:12}}>
        <span>Probabilidade</span><span className="fp-num" style={{color:T.accent,fontWeight:500}}>{g.prob}%</span>
      </div>
      <div className="fp-btn" onClick={onContribute} style={{textAlign:"center",padding:"8px",borderRadius:9,background:`${g.color}22`,color:g.color,fontSize:12.5,fontWeight:600}}>+ Contribuir</div>
    </div>
  );
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
