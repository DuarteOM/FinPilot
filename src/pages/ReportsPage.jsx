import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { CATS, REPORT_DATA } from "../data/mockData";
import { formatCurrency, formatRoundedCurrency } from "../utils/currency";
import { Leg, Metric } from "../components/ui/FinanceComponents";
import { api } from "../services/api";

export default function PageReports({T,toast}){
  const [period,setPeriod]=useState("month");
  const [reportData,setReportData]=useState(REPORT_DATA);
  const [categories,setCategories]=useState(CATS);
  useEffect(()=>{const months={month:1,quarter:3,year:12}[period];api.reports.get(months).then(result=>{if(result.trend.length)setReportData(result.trend.map(item=>({...item,m:new Intl.DateTimeFormat("pt-PT",{month:"short"}).format(new Date(`${item.month}-01`)),expense:item.expenses})));if(result.categories.length)setCategories(result.categories.map((item,index)=>({...item,color:CATS[index%CATS.length].color})));}).catch(error=>toast("error",error.message));},[period,toast]);
  const totalIncome=reportData.reduce((a,d)=>a+d.income,0);
  const totalExp=reportData.reduce((a,d)=>a+d.expense,0);
  const totalSaved=reportData.reduce((a,d)=>a+d.saved,0);
  const best=reportData.reduce((a,b)=>b.saved>a.saved?b:a,reportData[0]||{m:"—",saved:0});

  return(
    <div className="page">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{display:"flex",gap:6}}>
          {[["month","Este mês"],["quarter","Últimos 3 meses"],["year","Este ano"]].map(([v,l])=>(
            <div key={v} className="fp-btn" onClick={()=>setPeriod(v)} style={{padding:"6px 14px",borderRadius:8,fontSize:12.5,fontWeight:500,background:period===v?T.accent:T.panel2,color:period===v?"#0A0D12":T.sub,border:`1px solid ${period===v?T.accent:T.border}`,transition:"all .18s"}}>{l}</div>
          ))}
        </div>
        <div className="fp-btn" onClick={()=>toast("info","Exportação em PDF em breve.")} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`1px solid ${T.border}`,color:T.sub,fontSize:12.5}}>
          <Download size={13}/>Exportar PDF
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
        <Metric T={T} label="Receitas totais" value={formatRoundedCurrency(totalIncome)} sub="Jan – Jul 2025" col={T.accent}/>
        <Metric T={T} label="Despesas totais" value={formatRoundedCurrency(totalExp)} sub="Jan – Jul 2025" col="#D4537E"/>
        <Metric T={T} label="Total poupado" value={formatRoundedCurrency(totalSaved)} sub={`Melhor mês: ${best.m} (${formatRoundedCurrency(best.saved)})`} col={T.accent2}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:20}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Receitas vs Despesas</div>
          <div style={{height:180}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} barGap={4}>
                <CartesianGrid stroke={T.border} vertical={false}/>
                <XAxis dataKey="m" tick={{fontSize:10,fill:T.mut}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:T.panel2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} formatter={v=>formatRoundedCurrency(v)}/>
                <Bar dataKey="income" fill={T.accent} radius={[4,4,0,0]} isAnimationActive animationDuration={800}/>
                <Bar dataKey="expense" fill={T.accent2} radius={[4,4,0,0]} isAnimationActive animationDuration={800}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{display:"flex",gap:14,marginTop:8,fontSize:11,color:T.sub}}><Leg dot={T.accent} label="Receitas"/><Leg dot={T.accent2} label="Despesas"/></div>
        </div>
        <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:20}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Poupança mensal</div>
          <div style={{height:180}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={.4}/><stop offset="100%" stopColor={T.accent} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid stroke={T.border} vertical={false}/>
                <XAxis dataKey="m" tick={{fontSize:10,fill:T.mut}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:T.panel2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} formatter={v=>formatRoundedCurrency(v)}/>
                <Area type="monotone" dataKey="saved" stroke={T.accent} strokeWidth={2} fill="url(#sg)" isAnimationActive animationDuration={900}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:20}}>
        <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Despesa por categoria</div>
        <div style={{height:170}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} layout="vertical" margin={{left:10}}>
              <XAxis type="number" hide/>
              <YAxis type="category" dataKey="name" tick={{fontSize:11.5,fill:T.sub}} axisLine={false} tickLine={false} width={90}/>
              <Tooltip contentStyle={{background:T.panel2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} formatter={v=>formatCurrency(v)}/>
              <Bar dataKey="value" radius={[0,4,4,0]} isAnimationActive animationDuration={800}>
                {categories.map((c,i)=><Cell key={i} fill={c.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
