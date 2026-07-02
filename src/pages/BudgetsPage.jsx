import { useEffect, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { formatRoundedCurrency } from "../utils/currency";
import { Metric } from "../components/ui/FinanceComponents";
import { api } from "../services/api";

export default function PageBudgets({T,budgets,setBudgets,setModal,toast}){
  const tl=budgets.reduce((s,b)=>s+b.limit,0);
  const ts=budgets.reduce((s,b)=>s+b.spent,0);
  const del=async id=>{try{await api.budgets.remove(id);setBudgets(bs=>bs.filter(b=>b.id!==id));toast("info","Orçamento eliminado.");}catch(error){toast("error",error.message);}};
  return(
    <div className="page">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
        <Metric T={T} label="Orçamentado" value={formatRoundedCurrency(tl)} sub={`${budgets.length} categorias`} col={T.accent2}/>
        <Metric T={T} label="Gasto" value={formatRoundedCurrency(ts)} sub={`${Math.round(ts/tl*100)}% utilizado`} col={T.warn}/>
        <Metric T={T} label="Restante" value={formatRoundedCurrency(Math.max(tl-ts,0))} sub="até 31 jul" col={T.accent}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:600}}>Categorias</div>
        <div className="fp-btn" onClick={()=>setModal({type:"addBudget"})} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,background:T.accent,color:"#0A0D12",fontSize:12.5,fontWeight:600}}><Plus size={13}/>Novo orçamento</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {budgets.map((b,i)=>{
          const pct=Math.min(Math.round(b.spent/b.limit*100),100);
          const over=b.spent>b.limit;
          const warn=pct>=85&&!over;
          const barC=over?T.danger:warn?T.warn:b.color;
          return(
            <BudgetCard key={b.id} b={b} T={T} pct={pct} over={over} barC={barC} delay={i*.06}
              onEdit={()=>setModal({type:"editBudget",data:b})}
              onDelete={()=>del(b.id)}/>
          );
        })}
      </div>
    </div>
  );
}

function BudgetCard({b,T,pct,over,barC,delay,onEdit,onDelete}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),120);return()=>clearTimeout(t);},[pct]);
  return(
    <div className="fp-card stagger" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:"15px 16px",animationDelay:`${delay}s`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:`${b.color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}><b.icon size={14} color={b.color}/></div>
          <div>
            <div style={{fontSize:13,fontWeight:600}}>{b.name}</div>
            <div className="fp-num" style={{fontSize:11,color:T.sub}}>{formatRoundedCurrency(b.spent)} / {formatRoundedCurrency(b.limit)}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {over&&<span className="pop" style={{fontSize:10,fontWeight:600,color:T.danger,background:`${T.danger}18`,padding:"2px 7px",borderRadius:5}}>Excedido</span>}
          <div className="fp-btn" onClick={onEdit}><Edit2 size={13} color={T.mut}/></div>
          <div className="fp-btn" onClick={onDelete}><Trash2 size={13} color={T.mut}/></div>
        </div>
      </div>
      <div style={{height:6,background:T.border,borderRadius:5,overflow:"hidden"}}>
        <div className="fp-fill" style={{width:`${w}%`,height:"100%",background:barC,borderRadius:5}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:T.sub}}>
        <span>{pct}% usado</span>
        <span>{over?`${formatRoundedCurrency(b.spent-b.limit)} acima`:`${formatRoundedCurrency(b.limit-b.spent)} restante`}</span>
      </div>
    </div>
  );
}

// ─── GOALS ────────────────────────────────────────────────────────────────────
