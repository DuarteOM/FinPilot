import { useState } from "react";
import { Film, ShoppingBag, Target, Wallet, X } from "lucide-react";
import { CAT_NAMES, COLORS } from "../../data/mockData";
import { formatCurrency, formatRoundedCurrency } from "../../utils/currency";
import { api } from "../../services/api";

function Overlay({T,children}){
  return <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",zIndex:40,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}}>
    <div className="scale-in" style={{background:T.panel,borderRadius:16,border:`1px solid ${T.border}`,padding:24,width:360,maxWidth:"90%",boxShadow:"0 16px 40px rgba(0,0,0,.3)"}}>{children}</div>
  </div>;
}

function ModalHeader({T,title,onClose}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
    <div className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:600}}>{title}</div>
    <div className="fp-btn" onClick={onClose}><X size={16} color={T.sub}/></div>
  </div>;
}

function InputField({T,label,placeholder,type="text",value,onChange}){
  return <div style={{marginBottom:12}}>
    {label&&<label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>{label}</label>}
    <input value={value} onChange={onChange} placeholder={placeholder} type={type} style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,color:T.text,fontSize:12.5,outline:"none"}}/>
  </div>;
}

function Button({T,label,onClick,color}){
  return <div className="fp-btn" onClick={onClick} style={{padding:"11px",borderRadius:9,background:color||T.accent,color:color?"#fff":"#0A0D12",fontSize:13.5,fontWeight:600,textAlign:"center",marginTop:4}}>{label}</div>;
}

function ColorPicker({T,value,onChange}){
  return <div style={{marginBottom:16}}><label style={{fontSize:12,color:T.sub,display:"block",marginBottom:6}}>Cor</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{COLORS.map(color=><div key={color} className="fp-btn" onClick={()=>onChange(color)} style={{width:24,height:24,borderRadius:6,background:color,border:`2px solid ${value===color?T.text:"transparent"}`}}/>)}</div></div>;
}

function BudgetModal({T,modal,close,setBudgets,toast,add}){
  const isEdit=modal.type==="editBudget";
  const [name,setName]=useState(isEdit?modal.data.name:"");
  const [limit,setLimit]=useState(isEdit?modal.data.limit:"");
  const [color,setColor]=useState(isEdit?modal.data.color:COLORS[0]);
  const submit=async()=>{if(!name||!limit){toast("error","Preenche todos os campos.");return;}if(isEdit){try{await api.budgets.update(modal.data.id,{name,limit:Number(limit),color});setBudgets(items=>items.map(item=>item.id===modal.data.id?{...item,name,limit:Number(limit),color}:item));toast("success","Orçamento atualizado.");close();}catch(error){toast("error",error.message);}}else add("budget",{name,limit:Number(limit),spent:0,icon:Wallet,color},"Orçamento criado com sucesso.");};
  return <Overlay T={T}><ModalHeader T={T} title={isEdit?"Editar orçamento":"Novo orçamento"} onClose={close}/><InputField T={T} label="Nome da categoria" placeholder="Ex: Restauração" value={name} onChange={e=>setName(e.target.value)}/><InputField T={T} label="Limite mensal (€)" placeholder="Ex: 300" type="number" value={limit} onChange={e=>setLimit(e.target.value)}/><ColorPicker T={T} value={color} onChange={setColor}/><Button T={T} label={isEdit?"Guardar alterações":"Criar orçamento"} onClick={submit}/></Overlay>;
}

function GoalModal({T,close,toast,add}){
  const [name,setName]=useState("");const [target,setTarget]=useState("");const [monthly,setMonthly]=useState("");const [color,setColor]=useState(COLORS[0]);
  const submit=()=>{if(!name||!target){toast("error","Preenche os campos obrigatórios.");return;}add("goal",{name,target:Number(target),saved:0,monthly:Number(monthly)||0,eta:"A calcular",icon:Target,color,prob:80},"Objetivo criado com sucesso!");};
  return <Overlay T={T}><ModalHeader T={T} title="Novo objetivo" onClose={close}/><InputField T={T} label="Nome do objetivo" placeholder="Ex: Viagem ao Japão" value={name} onChange={e=>setName(e.target.value)}/><InputField T={T} label="Valor alvo (€)" placeholder="Ex: 3000" type="number" value={target} onChange={e=>setTarget(e.target.value)}/><InputField T={T} label="Contribuição mensal (€)" placeholder="Ex: 200" type="number" value={monthly} onChange={e=>setMonthly(e.target.value)}/><ColorPicker T={T} value={color} onChange={setColor}/><Button T={T} label="Criar objetivo" onClick={submit}/></Overlay>;
}

function ContributionModal({T,goal,close,setGoals,toast}){
  const [amount,setAmount]=useState("");
  const submit=async()=>{if(!amount||Number(amount)<=0){toast("error","Insere um valor válido.");return;}try{const result=await api.goals.contribute(goal.id,Number(amount));setGoals(items=>items.map(item=>item.id===goal.id?{...item,saved:result.saved}:item));toast("success",`${formatCurrency(Number(amount))} adicionados ao objetivo "${goal.name}".`);close();}catch(error){toast("error",error.message);}};
  const progress=Math.round(goal.saved/goal.target*100);
  return <Overlay T={T}><ModalHeader T={T} title={`Contribuir — ${goal.name}`} onClose={close}/><div style={{textAlign:"center",marginBottom:18}}><div className="fp-num" style={{fontSize:22,fontWeight:600}}>{formatRoundedCurrency(goal.saved)} <span style={{color:T.sub,fontSize:14}}>de {formatRoundedCurrency(goal.target)}</span></div><div style={{height:6,background:T.border,borderRadius:5,overflow:"hidden",margin:"10px 0 4px"}}><div style={{width:`${progress}%`,height:"100%",background:goal.color,borderRadius:5}}/></div><div style={{fontSize:12,color:T.sub}}>{progress}% concluído</div></div><InputField T={T} label="Valor a adicionar (€)" placeholder="Ex: 100" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/><Button T={T} label="Adicionar contribuição" onClick={submit}/></Overlay>;
}

function TransactionModal({T,close,toast,add}){
  const [merchant,setMerchant]=useState("");const [amount,setAmount]=useState("");const [category,setCategory]=useState("Supermercado");const [type,setType]=useState("expense");
  const submit=()=>{if(!merchant||!amount){toast("error","Preenche todos os campos.");return;}const value=type==="expense"?-Math.abs(Number(amount)):Math.abs(Number(amount));add("tx",{merchant,cat:category,date:"2025-07-30",ds:"Hoje",amount:value,icon:ShoppingBag,color:"#5DCAA5"},"Transação adicionada.");};
  return <Overlay T={T}><ModalHeader T={T} title="Nova transação" onClose={close}/><div style={{display:"flex",gap:6,marginBottom:14}}>{[["expense","Despesa"],["income","Receita"]].map(([value,label])=><div key={value} className="fp-btn" onClick={()=>setType(value)} style={{flex:1,textAlign:"center",padding:"7px",borderRadius:8,fontSize:12.5,fontWeight:500,background:type===value?T.accent:T.panel2,color:type===value?"#0A0D12":T.sub,border:`1px solid ${type===value?T.accent:T.border}`}}>{label}</div>)}</div><InputField T={T} label="Comerciante / Descrição" placeholder="Ex: Continente" value={merchant} onChange={e=>setMerchant(e.target.value)}/><InputField T={T} label="Valor (€)" placeholder="Ex: 45.00" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/><div style={{marginBottom:14}}><label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>Categoria</label><select value={category} onChange={e=>setCategory(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,fontSize:12.5,outline:"none"}}>{CAT_NAMES.map(item=><option key={item}>{item}</option>)}</select></div><Button T={T} label="Adicionar transação" onClick={submit}/></Overlay>;
}

function CancelSubscriptionModal({T,subscription,close,setSubs,toast}){
  const cancel=async()=>{try{await api.subscriptions.setActive(subscription.id,false);setSubs(items=>items.map(item=>item.id===subscription.id?{...item,active:false}:item));toast("info",`"${subscription.name}" cancelada. Poupas ${formatRoundedCurrency(subscription.monthly*12)}/ano.`);close();}catch(error){toast("error",error.message);}};
  return <Overlay T={T}><ModalHeader T={T} title="Cancelar subscrição" onClose={close}/><div style={{textAlign:"center",marginBottom:20}}><div style={{width:48,height:48,borderRadius:12,background:`${subscription.color}22`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><subscription.icon size={22} color={subscription.color}/></div><div style={{fontSize:16,fontWeight:600,marginBottom:6}}>{subscription.name}</div><div style={{fontSize:12.5,color:T.sub,lineHeight:1.5}}>Ao cancelar, poupas <strong className="fp-num">{formatCurrency(subscription.monthly)}/mês</strong> ({formatRoundedCurrency(subscription.monthly*12)}/ano).<br/>Podes reativar a qualquer momento.</div></div><Button T={T} label="Confirmar cancelamento" onClick={cancel} color={T.danger}/><div className="fp-btn" onClick={close} style={{textAlign:"center",padding:"10px",borderRadius:9,fontSize:13,color:T.sub,marginTop:8}}>Manter subscrição</div></Overlay>;
}

function SubscriptionModal({T,close,toast,add}){
  const [name,setName]=useState("");const [monthly,setMonthly]=useState("");const [color,setColor]=useState(COLORS[0]);
  const submit=()=>{if(!name||!monthly){toast("error","Preenche todos os campos.");return;}add("sub",{name,monthly:Number(monthly),next:"1 ago",icon:Film,color,used:true,active:true},"Subscrição adicionada.");};
  return <Overlay T={T}><ModalHeader T={T} title="Adicionar subscrição" onClose={close}/><InputField T={T} label="Nome do serviço" placeholder="Ex: HBO Max" value={name} onChange={e=>setName(e.target.value)}/><InputField T={T} label="Custo mensal (€)" placeholder="Ex: 9.99" type="number" value={monthly} onChange={e=>setMonthly(e.target.value)}/><ColorPicker T={T} value={color} onChange={setColor}/><Button T={T} label="Adicionar subscrição" onClick={submit}/></Overlay>;
}

export default function ModalRouter({T,modal,setModal,setBudgets,setGoals,setTxs,setSubs,toast}){
  if(!modal)return null;
  const close=()=>setModal(null);
  const add=async(type,data,message)=>{try{if(type==="budget"){const result=await api.budgets.create({name:data.name,limit:data.limit,color:data.color});setBudgets(items=>[...items,{...data,...result.budget}]);}else if(type==="goal"){const result=await api.goals.create({name:data.name,target:data.target,saved:data.saved,monthly:data.monthly,eta:data.eta,color:data.color,probability:data.prob});setGoals(items=>[...items,{...data,...result.goal,prob:result.goal.probability}]);}else if(type==="tx"){const result=await api.transactions.create({merchant:data.merchant,category:data.cat,date:data.date,amount:data.amount,color:data.color});setTxs(items=>[{...data,...result.transaction,cat:result.transaction.category},...items]);}else if(type==="sub"){const result=await api.subscriptions.create({name:data.name,monthly:data.monthly,next:data.next,used:data.used,active:data.active,color:data.color});setSubs(items=>[...items,{...data,...result.subscription}]);}toast("success",message);close();}catch(error){toast("error",error.message);}};
  const common={T,close,toast,add};
  if(modal.type==="addBudget"||modal.type==="editBudget")return <BudgetModal key={`${modal.type}-${modal.data?.id||"new"}`} {...common} modal={modal} setBudgets={setBudgets}/>;
  if(modal.type==="addGoal")return <GoalModal {...common}/>;
  if(modal.type==="contributeGoal")return <ContributionModal {...common} goal={modal.data} setGoals={setGoals}/>;
  if(modal.type==="addTransaction")return <TransactionModal {...common}/>;
  if(modal.type==="cancelSub")return <CancelSubscriptionModal {...common} subscription={modal.data} setSubs={setSubs}/>;
  if(modal.type==="addSub")return <SubscriptionModal {...common}/>;
  return null;
}

// ─── SHARED ───────────────────────────────────────────────────────────────────
