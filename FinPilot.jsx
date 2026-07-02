import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Wallet, Target, Repeat, Bell, BellRing, Search, X,
  Send, Sparkles, ArrowUpRight, ArrowDownRight, Sun, Moon, Plane,
  ShoppingBag, Utensils, Fuel, Film, Home, Zap, Plus, AlertTriangle,
  TrendingUp, TrendingDown, Calendar, MoreHorizontal, Briefcase, Dumbbell,
  LogOut, ShieldCheck, Lock, PartyPopper, CheckCheck, CreditCard, BarChart2,
  Settings, Trash2, Edit2, ChevronRight, Download, Eye, EyeOff, Shield, User,
} from "lucide-react";

// ─── THEMES ──────────────────────────────────────────────────────────────────
const D={bg:"#0A0D12",panel:"#11151C",panel2:"#161B23",border:"#1F2530",text:"#F4F4F2",sub:"#9A9FA8",mut:"#5F6470",accent:"#5DCAA5",accent2:"#7F8FE4",danger:"#E0544F",warn:"#E8A33D"};
const L={bg:"#F6F5F1",panel:"#FFFFFF",panel2:"#FBFAF7",border:"#E7E4DB",text:"#15171B",sub:"#62655F",mut:"#9A988F",accent:"#0F6E56",accent2:"#534AB7",danger:"#A32D2D",warn:"#B36A00"};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = T=>`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500&display=swap');
  *{box-sizing:border-box}
  .fp-num{font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums}
  .fp-disp{font-family:'Space Grotesk',sans-serif}
  .fp-scroll::-webkit-scrollbar{width:5px}
  .fp-scroll::-webkit-scrollbar-thumb{background:rgba(120,120,120,.3);border-radius:8px}
  .fp-row{transition:background .17s ease}
  .fp-row:hover{background:${T.panel2}}
  .fp-btn{transition:transform .12s ease,opacity .12s ease;cursor:pointer}
  .fp-btn:hover{opacity:.88}
  .fp-btn:active{transform:scale(.96)}
  .fp-card{transition:transform .22s cubic-bezier(.2,.7,.3,1),box-shadow .22s ease,border-color .22s ease}
  .fp-card:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.16)}
  .fp-nav{transition:background .18s,color .18s,transform .15s,border-color .18s}
  .fp-nav:hover{transform:translateX(3px)}
  .fp-fill{transition:width 1s cubic-bezier(.2,.8,.2,1)}
  @keyframes fade-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scale-in{from{opacity:0;transform:scale(.96) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes slide-r{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes toast-in{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pop{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
  .page{animation:fade-up .35s cubic-bezier(.2,.7,.3,1) both}
  .stagger{animation:fade-up .38s cubic-bezier(.2,.7,.3,1) both}
  .scale-in{animation:scale-in .18s ease both}
  .slide-r{animation:slide-r .28s cubic-bezier(.2,.7,.3,1) both}
  .dot{animation:pulse 1.3s infinite ease-in-out}
  .spinner{animation:spin .75s linear infinite}
  .float1{animation:float 6s ease-in-out infinite}
  .float2{animation:float 7s ease-in-out infinite 1s}
  .toast-in{animation:toast-in .24s ease both}
  .pop{animation:pop .3s cubic-bezier(.34,1.56,.64,1) both}
  input,select,textarea{font-family:'Inter',sans-serif}
  input::placeholder,textarea::placeholder{color:${T.mut}}
  select{background:${T.panel2};color:${T.text}}
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TREND=[{m:"Jan",income:2400,expense:1680},{m:"Fev",income:2400,expense:1820},{m:"Mar",income:2550,expense:1900},{m:"Abr",income:2400,expense:1740},{m:"Mai",income:2700,expense:2010},{m:"Jun",income:2400,expense:1590},{m:"Jul",income:2650,expense:1860}];
const REPORT_DATA=[{m:"Jan",income:2400,expense:1680,saved:720},{m:"Fev",income:2400,expense:1820,saved:580},{m:"Mar",income:2550,expense:1900,saved:650},{m:"Abr",income:2400,expense:1740,saved:660},{m:"Mai",income:2700,expense:2010,saved:690},{m:"Jun",income:2400,expense:1590,saved:810},{m:"Jul",income:2650,expense:1860,saved:790}];
const CATS=[{name:"Restauração",value:412,color:"#E8A33D",icon:Utensils},{name:"Supermercado",value:358,color:"#5DCAA5",icon:ShoppingBag},{name:"Transportes",value:196,color:"#7F8FE4",icon:Fuel},{name:"Subscrições",value:64,color:"#D4537E",icon:Film},{name:"Casa",value:540,color:"#888780",icon:Home}];
const TX0=[
  {id:1,merchant:"Continente",cat:"Supermercado",date:"2025-07-30",ds:"Hoje, 09:42",amount:-64.2,icon:ShoppingBag,color:"#5DCAA5"},
  {id:2,merchant:"Netflix",cat:"Subscrições",date:"2025-07-30",ds:"Hoje, 06:00",amount:-12.99,icon:Film,color:"#D4537E"},
  {id:3,merchant:"Galp",cat:"Combustível",date:"2025-07-29",ds:"Ontem, 18:21",amount:-45.0,icon:Fuel,color:"#7F8FE4"},
  {id:4,merchant:"Salário — Acme Lda",cat:"Receita",date:"2025-07-29",ds:"Ontem, 09:00",amount:2400,icon:Zap,color:"#5DCAA5"},
  {id:5,merchant:"Cervejaria Ramiro",cat:"Restauração",date:"2025-07-28",ds:"28 jul",amount:-38.5,icon:Utensils,color:"#E8A33D"},
  {id:6,merchant:"Worten",cat:"Compras",date:"2025-07-27",ds:"27 jul",amount:-129.9,icon:ShoppingBag,color:"#7F8FE4"},
  {id:7,merchant:"Spotify",cat:"Subscrições",date:"2025-07-26",ds:"26 jul",amount:-9.99,icon:Film,color:"#D4537E"},
  {id:8,merchant:"Uber",cat:"Transportes",date:"2025-07-26",ds:"26 jul",amount:-8.4,icon:Fuel,color:"#7F8FE4"},
  {id:9,merchant:"Fitness Hut",cat:"Saúde",date:"2025-07-24",ds:"24 jul",amount:-34.9,icon:Dumbbell,color:"#5DCAA5"},
  {id:10,merchant:"Freelance — Projeto X",cat:"Receita",date:"2025-07-23",ds:"23 jul",amount:380,icon:Briefcase,color:"#5DCAA5"},
  {id:11,merchant:"McDonald's",cat:"Restauração",date:"2025-07-22",ds:"22 jul",amount:-11.4,icon:Utensils,color:"#E8A33D"},
  {id:12,merchant:"EDP",cat:"Casa",date:"2025-07-21",ds:"21 jul",amount:-78.3,icon:Home,color:"#888780"},
  {id:13,merchant:"Renda — Julho",cat:"Casa",date:"2025-07-01",ds:"1 jul",amount:-850,icon:Home,color:"#888780"},
  {id:14,merchant:"Auchan",cat:"Supermercado",date:"2025-07-18",ds:"18 jul",amount:-47.6,icon:ShoppingBag,color:"#5DCAA5"},
  {id:15,merchant:"Decathlon",cat:"Compras",date:"2025-07-15",ds:"15 jul",amount:-89.9,icon:Dumbbell,color:"#7F8FE4"},
];
const GOALS0=[
  {id:1,name:"Entrada para casa",saved:8400,target:20000,eta:"Out 2027",monthly:420,icon:Home,color:"#5DCAA5",prob:82},
  {id:2,name:"Viagem ao Japão",saved:1180,target:3200,eta:"Mar 2027",monthly:165,icon:Plane,color:"#7F8FE4",prob:91},
  {id:3,name:"Fundo de emergência",saved:2600,target:6000,eta:"Jan 2027",monthly:280,icon:Briefcase,color:"#E8A33D",prob:76},
];
const BDG0=[
  {id:1,name:"Alimentação",limit:300,spent:412,icon:Utensils,color:"#E8A33D"},
  {id:2,name:"Transportes",limit:150,spent:96,icon:Fuel,color:"#7F8FE4"},
  {id:3,name:"Lazer",limit:200,spent:140,icon:Film,color:"#D4537E"},
  {id:4,name:"Supermercado",limit:380,spent:358,icon:ShoppingBag,color:"#5DCAA5"},
  {id:5,name:"Casa",limit:600,spent:540,icon:Home,color:"#888780"},
];
const SUB0=[
  {id:1,name:"Netflix",monthly:12.99,next:"3 ago",icon:Film,color:"#D4537E",used:true,active:true},
  {id:2,name:"Spotify",monthly:9.99,next:"7 ago",icon:Film,color:"#5DCAA5",used:true,active:true},
  {id:3,name:"Adobe CC",monthly:24.59,next:"12 ago",icon:Briefcase,color:"#E8A33D",used:false,active:true},
  {id:4,name:"iCloud+",monthly:2.99,next:"15 ago",icon:Shield,color:"#7F8FE4",used:true,active:true},
  {id:5,name:"Disney+",monthly:8.99,next:"20 ago",icon:Film,color:"#D4537E",used:false,active:true},
];
const NTF0=[
  {id:1,icon:AlertTriangle,color:"#E8A33D",title:"Orçamento quase no limite",text:"Já usaste 137% do orçamento de Alimentação este mês.",time:"há 12 min",read:false},
  {id:2,icon:Zap,color:"#5DCAA5",title:"Salário recebido",text:"Entrada de 2.400€ — Acme Lda.",time:"há 3 h",read:false},
  {id:3,icon:TrendingUp,color:"#7F8FE4",title:"Gastaste 28% mais em restaurantes",text:"Comparado com a média dos últimos 3 meses.",time:"Ontem",read:false},
  {id:4,icon:PartyPopper,color:"#5DCAA5",title:"Quase lá!",text:"Faltam apenas 165€ para o objetivo \"Viagem ao Japão\".",time:"Ontem",read:true},
  {id:5,icon:TrendingDown,color:"#D4537E",title:"Despesa invulgar detetada",text:"Worten: 129,90€ — 3× acima do teu padrão habitual.",time:"há 3 dias",read:true},
];
const CHAT0=[{role:"assistant",text:"Olá! Sou o FinPilot. Este mês já gastaste 1.570€ — 6% abaixo da média. Como posso ajudar?"}];
const REPS={
  "onde estou a gastar mais dinheiro?":"A tua maior categoria é Casa (540€), seguida de Restauração (412€). Restauração subiu 18% face ao mês passado — sobretudo ao fim de semana.",
  "quanto posso gastar este fim de semana?":"Com base no orçamento de Lazer (200€, 140€ usados), tens cerca de 60€ confortáveis sem comprometer a poupança mensal.",
  "como posso poupar 200€ por mês?":"Cancelar Adobe CC (24,59€/mês, pouco usada) + reduzir Restauração para 300€ já te dá ~135€. O resto vem de comprar combustível com cartão desconto.",
};
const CAT_NAMES=["Restauração","Supermercado","Transportes","Subscrições","Casa","Saúde","Compras","Receita","Combustível","Outros"];
const COLORS=["#E8A33D","#5DCAA5","#7F8FE4","#D4537E","#888780","#4ECDC4","#A78BFA","#34D399"];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt=n=>Math.abs(n).toLocaleString("pt-PT",{style:"currency",currency:"EUR",minimumFractionDigits:2});
const fmtS=n=>n.toLocaleString("pt-PT",{style:"currency",currency:"EUR",maximumFractionDigits:0});
let _uid=200; const nid=()=>++_uid;

// ─── GOOGLE LOGO ─────────────────────────────────────────────────────────────
function GoogleG({size=18}){return(
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.5 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.2 4 9.5 8.4 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.5c-2 1.4-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.4 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.5 5.5C40.9 36.6 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/>
  </svg>
);}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function FinPilotApp(){
  const [dark,setDark]=useState(true);
  const [authed,setAuthed]=useState(false);
  const [authLoad,setAuthLoad]=useState(false);
  const [onboarding,setOnboarding]=useState(false);
  const [obStep,setObStep]=useState(1);
  const [view,setView]=useState("dashboard");

  const [budgets,setBudgets]=useState(BDG0);
  const [goals,setGoals]=useState(GOALS0);
  const [subs,setSubs]=useState(SUB0);
  const [txs,setTxs]=useState(TX0);
  const [notifs,setNotifs]=useState(NTF0);

  const [chatOpen,setChatOpen]=useState(false);
  const [notifOpen,setNotifOpen]=useState(false);
  const [toasts,setToasts]=useState([]);
  const [modal,setModal]=useState(null);
  const [searchQ,setSearchQ]=useState("");
  const [searchOpen,setSearchOpen]=useState(false);
  const searchRef=useRef(null);
  const notifRef=useRef(null);

  const [msgs,setMsgs]=useState(CHAT0);
  const [chatIn,setChatIn]=useState("");
  const [chatTyping,setChatTyping]=useState(false);

  const [profile,setProfile]=useState({name:"Mariana Rodrigues",email:"mariana@exemplo.pt"});
  const [notifPrefs,setNotifPrefs]=useState({budget:true,salary:true,insights:true,goals:true,unusual:true});
  const [twoFA,setTwoFA]=useState(false);

  const T=dark?D:L;
  const unread=notifs.filter(n=>!n.read).length;

  useEffect(()=>{
    const h=e=>{
      if(searchRef.current&&!searchRef.current.contains(e.target))setSearchOpen(false);
      if(notifRef.current&&!notifRef.current.contains(e.target))setNotifOpen(false);
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  const toast=(type,text)=>{
    const id=nid();
    setToasts(ts=>[...ts,{id,type,text}]);
    setTimeout(()=>setToasts(ts=>ts.filter(t=>t.id!==id)),3600);
  };

  const login=(isNew=false)=>{
    setAuthLoad(true);
    setTimeout(()=>{setAuthLoad(false);setAuthed(true);if(isNew){setOnboarding(true);setObStep(1);}else toast("success","Sessão iniciada com sucesso.");},1300);
  };
  const logout=()=>{setAuthed(false);setMsgs(CHAT0);toast("info","Sessão terminada.");};

  const sendMsg=text=>{
    const t=text.trim();if(!t)return;
    setMsgs(m=>[...m,{role:"user",text:t}]);setChatIn("");setChatTyping(true);
    setTimeout(()=>{
      const r=REPS[t.toLowerCase()]||"Com base nos teus dados, está tudo dentro do esperado. Queres que analise alguma categoria específica?";
      setMsgs(m=>[...m,{role:"assistant",text:r}]);setChatTyping(false);
    },950);
  };

  const searchResults=useMemo(()=>{
    if(!searchQ.trim())return[];
    const q=searchQ.toLowerCase();
    return txs.filter(t=>t.merchant.toLowerCase().includes(q)||t.cat.toLowerCase().includes(q)).slice(0,6);
  },[searchQ,txs]);

  if(!authed)return <LoginPage T={T} dark={dark} loading={authLoad} onLogin={()=>login(false)} onGoogle={()=>login(false)} onRegister={()=>login(true)}/>;
  if(onboarding)return <OnboardWizard T={T} step={obStep} setStep={setObStep} onDone={()=>{setOnboarding(false);toast("success","Bem-vindo ao FinPilot! 🎉 O teu espaço financeiro está pronto.");}} />;

  const NAV=[
    {id:"dashboard",label:"Dashboard",icon:LayoutDashboard},
    {id:"transactions",label:"Transações",icon:CreditCard},
    {id:"budgets",label:"Orçamentos",icon:Wallet},
    {id:"goals",label:"Objetivos",icon:Target},
    {id:"subscriptions",label:"Subscrições",icon:Repeat},
    {id:"reports",label:"Relatórios",icon:BarChart2},
    {id:"settings",label:"Definições",icon:Settings},
  ];

  const PAGE_TITLES={dashboard:"Boa tarde, Mariana",transactions:"Transações",budgets:"Orçamentos",goals:"Objetivos",subscriptions:"Subscrições",reports:"Relatórios",settings:"Definições"};

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",background:T.bg,color:T.text,minHeight:600,display:"flex",borderRadius:20,overflow:"hidden",border:`1px solid ${T.border}`,position:"relative"}}>
      <style>{CSS(T)}</style>

      {/* Sidebar */}
      <div style={{width:220,flexShrink:0,padding:"24px 14px",borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:24,background:T.panel}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 6px"}}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Sparkles size={16} color="#0A0D12"/>
          </div>
          <span className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16}}>FinPilot</span>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:1}}>
          {NAV.map(n=>{
            const active=view===n.id;
            return(
              <div key={n.id} className="fp-nav" onClick={()=>setView(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,color:active?T.text:T.sub,background:active?T.panel2:"transparent",borderLeft:`2px solid ${active?T.accent:"transparent"}`}}>
                <n.icon size={15} strokeWidth={2}/>{n.label}
                {n.id==="transactions"&&<span style={{marginLeft:"auto",fontSize:10,background:`${T.accent}22`,color:T.accent,padding:"1px 6px",borderRadius:5,fontWeight:600}}>{txs.length}</span>}
              </div>
            );
          })}
        </div>

        <div style={{marginTop:"auto",display:"flex",flexDirection:"column",gap:8}}>
          <div className="fp-btn" onClick={()=>setDark(d=>!d)} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.sub,padding:"7px 10px",borderRadius:9,border:`1px solid ${T.border}`}}>
            {dark?<Sun size={13}/>:<Moon size={13}/>}{dark?"Modo claro":"Modo escuro"}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 6px"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#0A0D12",flexShrink:0}}>MR</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile.name.split(" ")[0]}</div>
              <div style={{fontSize:10.5,color:T.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile.email}</div>
            </div>
            <div className="fp-btn" onClick={logout}><LogOut size={13} color={T.mut}/></div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="fp-scroll" style={{flex:1,overflowY:"auto",maxHeight:700,display:"flex",flexDirection:"column"}}>
        {/* TopBar */}
        <div style={{padding:"18px 28px 0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:19,fontWeight:600,letterSpacing:-.3}}>{PAGE_TITLES[view]}</div>
            <div style={{fontSize:12,color:T.sub,marginTop:2}}>Quarta-feira, 30 de julho de 2025</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* Search */}
            <div ref={searchRef} style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",width:200,borderRadius:9,border:`1px solid ${searchOpen?T.accent:T.border}`,color:T.mut,fontSize:12,cursor:"text",transition:"border-color .2s"}}>
                <Search size={13}/>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} onFocus={()=>setSearchOpen(true)} placeholder="Pesquisar transações…"
                  style={{border:"none",outline:"none",background:"transparent",color:T.text,fontSize:12,flex:1}}/>
                {searchQ&&<X size={11} className="fp-btn" onClick={()=>setSearchQ("")}/>}
              </div>
              {searchOpen&&searchQ&&(
                <div className="scale-in" style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:300,background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,boxShadow:"0 12px 28px rgba(0,0,0,.22)",padding:8,zIndex:30,transformOrigin:"top right"}}>
                  {searchResults.length===0
                    ?<div style={{padding:"12px 10px",fontSize:12,color:T.sub,textAlign:"center"}}>Sem resultados para "{searchQ}"</div>
                    :searchResults.map((t,i)=>(
                      <div key={t.id} className="fp-row" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 8px",borderRadius:8,cursor:"pointer"}}>
                        <div style={{display:"flex",alignItems:"center",gap:9}}>
                          <div style={{width:26,height:26,borderRadius:8,background:`${t.color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}><t.icon size={12} color={t.color}/></div>
                          <div><div style={{fontSize:12,fontWeight:500}}>{t.merchant}</div><div style={{fontSize:10.5,color:T.sub}}>{t.cat} · {t.ds}</div></div>
                        </div>
                        <span className="fp-num" style={{fontSize:12,fontWeight:600,color:t.amount>0?T.accent:T.text}}>{t.amount>0?"+":""}{fmt(t.amount)}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            {/* Notif bell */}
            <div ref={notifRef} style={{position:"relative"}}>
              <div className="fp-btn" onClick={()=>setNotifOpen(o=>!o)} style={{width:32,height:32,borderRadius:9,border:`1px solid ${notifOpen?T.accent:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transition:"border-color .2s"}}>
                <Bell size={14}/>
                {unread>0&&<span className="dot" style={{position:"absolute",top:6,right:6,width:6,height:6,borderRadius:"50%",background:T.danger}}/>}
              </div>
              {notifOpen&&(
                <div className="scale-in" style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:320,background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,boxShadow:"0 12px 28px rgba(0,0,0,.22)",zIndex:30,transformOrigin:"top right",overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderBottom:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:600}}><BellRing size={14}/>Notificações
                      {unread>0&&<span style={{fontSize:10,fontWeight:600,color:T.accent,background:`${T.accent}18`,padding:"1px 6px",borderRadius:5}}>{unread} novas</span>}
                    </div>
                    {unread>0&&<div className="fp-btn" onClick={()=>setNotifs(ns=>ns.map(n=>({...n,read:true})))} style={{display:"flex",alignItems:"center",gap:4,fontSize:10.5,color:T.sub}}><CheckCheck size={11}/>Marcar lidas</div>}
                  </div>
                  <div className="fp-scroll" style={{maxHeight:300,overflowY:"auto"}}>
                    {notifs.map((n,i)=>(
                      <div key={n.id} className="fp-row" onClick={()=>setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))} style={{display:"flex",gap:10,padding:"11px 14px",cursor:"pointer",borderBottom:i<notifs.length-1?`1px solid ${T.border}`:"none",background:n.read?"transparent":`${T.accent}08`}}>
                        <div style={{width:28,height:28,borderRadius:8,background:`${n.color}22`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}><n.icon size={13} color={n.color}/></div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600}}>{n.title}{!n.read&&<span style={{width:5,height:5,borderRadius:"50%",background:T.accent,flexShrink:0}}/>}</div>
                          <div style={{fontSize:11,color:T.sub,marginTop:2,lineHeight:1.4}}>{n.text}</div>
                          <div style={{fontSize:10,color:T.mut,marginTop:3}}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page */}
        <div style={{padding:"18px 28px 28px",flex:1}}>
          {view==="dashboard"&&<PageDashboard T={T} goals={goals} subs={subs} txs={txs} setView={setView}/>}
          {view==="transactions"&&<PageTransactions T={T} txs={txs} setTxs={setTxs} setModal={setModal} toast={toast}/>}
          {view==="budgets"&&<PageBudgets T={T} budgets={budgets} setBudgets={setBudgets} setModal={setModal} toast={toast}/>}
          {view==="goals"&&<PageGoals T={T} goals={goals} setGoals={setGoals} setModal={setModal} toast={toast}/>}
          {view==="subscriptions"&&<PageSubscriptions T={T} subs={subs} setSubs={setSubs} setModal={setModal} toast={toast}/>}
          {view==="reports"&&<PageReports T={T} toast={toast}/>}
          {view==="settings"&&<PageSettings T={T} profile={profile} setProfile={setProfile} notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} twoFA={twoFA} setTwoFA={setTwoFA} toast={toast} dark={dark} setDark={setDark} onLogout={logout}/>}
        </div>
      </div>

      {/* Chat panel */}
      {chatOpen&&(
        <div className="slide-r" style={{position:"absolute",top:0,right:0,bottom:0,width:330,background:T.panel,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",zIndex:10}}>
          <div style={{padding:"14px 16px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center"}}><Sparkles size={13} color="#0A0D12"/></div>
              <span className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:600}}>Assistente FinPilot</span>
            </div>
            <div className="fp-btn" onClick={()=>setChatOpen(false)}><X size={15} color={T.sub}/></div>
          </div>
          <div className="fp-scroll" style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"85%",padding:"9px 12px",borderRadius:12,fontSize:12.5,lineHeight:1.5,background:m.role==="user"?T.accent:T.panel2,color:m.role==="user"?"#0A0D12":T.text,border:m.role==="assistant"?`1px solid ${T.border}`:"none",animation:"fade-up .22s ease both"}}>
                {m.text}
              </div>
            ))}
            {chatTyping&&<div style={{display:"flex",gap:4,padding:"9px 12px"}}>{[0,1,2].map(d=><span key={d} className="dot" style={{width:5,height:5,borderRadius:"50%",background:T.mut,animationDelay:`${d*.15}s`}}/>)}</div>}
          </div>
          {msgs.length<3&&(
            <div style={{padding:"0 14px 10px",display:"flex",flexDirection:"column",gap:5}}>
              {["Onde estou a gastar mais dinheiro?","Quanto posso gastar este fim de semana?","Como posso poupar 200€ por mês?"].map(s=>(
                <div key={s} className="fp-btn fp-row" onClick={()=>sendMsg(s)} style={{fontSize:11.5,padding:"7px 10px",borderRadius:9,border:`1px solid ${T.border}`,color:T.sub}}>{s}</div>
              ))}
            </div>
          )}
          <div style={{padding:12,borderTop:`1px solid ${T.border}`,display:"flex",gap:8}}>
            <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg(chatIn)} placeholder="Pergunta algo sobre as tuas finanças…" style={{flex:1,background:T.panel2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 11px",fontSize:12,color:T.text,outline:"none"}}/>
            <div className="fp-btn" onClick={()=>sendMsg(chatIn)} style={{width:34,height:34,borderRadius:9,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Send size={14} color="#0A0D12"/></div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ModalRouter T={T} modal={modal} setModal={setModal} budgets={budgets} setBudgets={setBudgets} goals={goals} setGoals={setGoals} txs={txs} setTxs={setTxs} subs={subs} setSubs={setSubs} toast={toast}/>

      {/* Toasts */}
      <div style={{position:"absolute",bottom:22,left:22,display:"flex",flexDirection:"column",gap:8,zIndex:50}}>
        {toasts.map(t=>(
          <div key={t.id} className="toast-in" style={{display:"flex",alignItems:"center",gap:9,padding:"10px 14px",borderRadius:10,background:T.panel,border:`1px solid ${T.border}`,boxShadow:"0 8px 20px rgba(0,0,0,.2)",fontSize:12.5,maxWidth:280}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:t.type==="success"?T.accent:t.type==="error"?T.danger:T.warn,flexShrink:0}}/>
            {t.text}
          </div>
        ))}
      </div>

      {/* FAB */}
      <div className="fp-btn" onClick={()=>setChatOpen(o=>!o)} style={{position:"absolute",bottom:22,right:22,width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 18px rgba(0,0,0,.28)",zIndex:5}}>
        <Sparkles size={20} color="#0A0D12"/>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({T,dark,loading,onLogin,onGoogle,onRegister}){
  const [tab,setTab]=useState("login");
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [name,setName]=useState("");
  const [pw2,setPw2]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [err,setErr]=useState("");

  const submit=()=>{
    if(tab==="login"){if(!email||!pw){setErr("Preenche todos os campos.");return;}onLogin();}
    else{if(!name||!email||!pw||!pw2){setErr("Preenche todos os campos.");return;}if(pw!==pw2){setErr("As palavras-passe não coincidem.");return;}onRegister();}
  };

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",background:T.bg,color:T.text,minHeight:600,borderRadius:20,border:`1px solid ${T.border}`,overflow:"hidden",display:"flex",alignItems:"stretch"}}>
      <style>{CSS(T)}</style>
      <div style={{flex:1.1,background:`linear-gradient(155deg,${T.panel2},${T.bg})`,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:40,position:"relative",overflow:"hidden",borderRight:`1px solid ${T.border}`}}>
        <div className="float1" style={{position:"absolute",width:240,height:240,borderRadius:"50%",background:`${T.accent}12`,top:-70,left:-70}}/>
        <div className="float2" style={{position:"absolute",width:180,height:180,borderRadius:"50%",background:`${T.accent2}12`,bottom:-50,right:-40}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,position:"relative",zIndex:1}}>
          <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center"}}><Sparkles size={17} color="#0A0D12"/></div>
          <span className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:17}}>FinPilot</span>
        </div>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:30,fontWeight:600,letterSpacing:-.5,lineHeight:1.2,marginBottom:14}}>O teu dinheiro,<br/>finalmente claro.</div>
          <div style={{fontSize:13,color:T.sub,lineHeight:1.65,maxWidth:310,marginBottom:28}}>Liga as tuas contas, define objetivos e deixa a IA encontrar oportunidades de poupança todos os dias.</div>
          {[["Análise automática de transações","#5DCAA5"],["Orçamentos inteligentes com alertas","#7F8FE4"],["Assistente financeiro IA disponível 24/7","#E8A33D"],["Segurança de nível bancário e RGPD","#D4537E"]].map(([f,c])=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:9,fontSize:12.5,color:T.sub,marginBottom:9}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:`${c}22`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CheckCheck size={10} color={c}/></div>{f}
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,fontSize:11.5,color:T.sub,position:"relative",zIndex:1}}><ShieldCheck size={14} color={T.accent}/>Encriptação AES-256 · Conforme RGPD 2016/679</div>
      </div>

      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
        <div style={{width:300,animation:"fade-up .5s cubic-bezier(.2,.7,.3,1) both"}}>
          <div className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:600,marginBottom:4}}>{tab==="login"?"Bem-vindo de volta":"Criar conta grátis"}</div>
          <div style={{fontSize:12.5,color:T.sub,marginBottom:22}}>{tab==="login"?"Entra para aceder ao teu painel financeiro.":"Começa a controlar as tuas finanças hoje."}</div>

          <div style={{display:"flex",background:T.panel2,borderRadius:10,padding:3,marginBottom:20,border:`1px solid ${T.border}`}}>
            {["login","register"].map(t=>(
              <div key={t} className="fp-btn" onClick={()=>{setTab(t);setErr("");}} style={{flex:1,textAlign:"center",padding:"7px",borderRadius:7,fontSize:12.5,fontWeight:500,background:tab===t?T.panel:"transparent",color:tab===t?T.text:T.sub,boxShadow:tab===t?"0 1px 4px rgba(0,0,0,.1)":"none",transition:"all .18s"}}>
                {t==="login"?"Iniciar sessão":"Criar conta"}
              </div>
            ))}
          </div>

          <div className="fp-btn" onClick={!loading?onGoogle:undefined} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"11px",borderRadius:10,border:`1px solid ${T.border}`,background:dark?T.panel2:"#FFF",fontSize:13.5,fontWeight:500,color:T.text,marginBottom:14}}>
            {loading?<><div className="spinner" style={{width:16,height:16,borderRadius:"50%",border:`2.5px solid ${T.border}`,borderTopColor:T.accent}}/>A ligar à conta Google…</>:<><GoogleG size={17}/>Continuar com Google</>}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,margin:"12px 0",color:T.mut,fontSize:11}}>
            <div style={{flex:1,height:1,background:T.border}}/> ou <div style={{flex:1,height:1,background:T.border}}/>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {tab==="register"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo" style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,color:T.text,fontSize:12.5,outline:"none",width:"100%"}}/>}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,color:T.text,fontSize:12.5,outline:"none",width:"100%"}}/>
            <div style={{position:"relative"}}>
              <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Palavra-passe" type={showPw?"text":"password"} style={{padding:"10px 36px 10px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,color:T.text,fontSize:12.5,outline:"none",width:"100%"}}/>
              <div className="fp-btn" onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:11,top:11}}>{showPw?<EyeOff size={13} color={T.mut}/>:<Eye size={13} color={T.mut}/>}</div>
            </div>
            {tab==="register"&&<input value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Confirmar palavra-passe" type="password" style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,color:T.text,fontSize:12.5,outline:"none",width:"100%"}}/>}
          </div>

          {err&&<div style={{fontSize:11.5,color:T.danger,marginTop:8,padding:"6px 10px",background:`${T.danger}12`,borderRadius:7}}>{err}</div>}
          {tab==="login"&&<div className="fp-btn" style={{textAlign:"right",fontSize:11.5,color:T.accent,marginTop:6}}>Esqueci a palavra-passe</div>}

          <div className="fp-btn" onClick={submit} style={{marginTop:14,textAlign:"center",padding:"12px",borderRadius:10,background:T.accent,color:"#0A0D12",fontSize:13.5,fontWeight:600}}>
            {tab==="login"?"Entrar na minha conta":"Criar conta e começar"}
          </div>
          <div style={{textAlign:"center",fontSize:11.5,color:T.sub,marginTop:16}}>
            {tab==="login"?<>Ainda não tens conta? <span className="fp-btn" onClick={()=>setTab("register")} style={{color:T.accent,fontWeight:500}}>Criar conta grátis</span></>:<>Já tens conta? <span className="fp-btn" onClick={()=>setTab("login")} style={{color:T.accent,fontWeight:500}}>Iniciar sessão</span></>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function OnboardWizard({T,step,setStep,onDone}){
  const [income,setIncome]=useState("");
  const [bank,setBank]=useState(null);
  const [preset,setPreset]=useState(null);
  const BANKS=["Caixa Geral de Depósitos","Novo Banco","Santander","BPI","Millennium BCP"];
  const PRESETS=[{n:"Básico",d:"Alimentação 300€ · Casa 600€ · Transportes 150€"},{n:"Moderado",d:"Alimentação 400€ · Casa 800€ · Lazer 200€"},{n:"Personalizado",d:"Configurar manualmente mais tarde"}];
  const next=()=>{if(step<3)setStep(s=>s+1);else onDone();};

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",background:T.bg,color:T.text,minHeight:600,borderRadius:20,border:`1px solid ${T.border}`,overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:48}}>
      <style>{CSS(T)}</style>
      <div style={{width:320,marginBottom:36}}>
        <div style={{display:"flex",gap:8,marginBottom:6}}>{[1,2,3].map(s=><div key={s} style={{flex:1,height:3,borderRadius:3,background:s<=step?T.accent:T.border,transition:"background .4s"}}/>)}</div>
        <div style={{fontSize:11.5,color:T.sub}}>Passo {step} de 3</div>
      </div>

      {step===1&&(
        <div className="page" style={{width:340,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:14}}>👋</div>
          <div className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:600,marginBottom:8}}>Bem-vindo ao FinPilot!</div>
          <div style={{fontSize:13,color:T.sub,marginBottom:28,lineHeight:1.6}}>Vamos configurar o teu espaço financeiro em 3 passos rápidos.</div>
          <div style={{textAlign:"left",marginBottom:8}}>
            <label style={{fontSize:12.5,color:T.sub,display:"block",marginBottom:6}}>Qual é o teu rendimento mensal líquido?</label>
            <div style={{position:"relative"}}>
              <input value={income} onChange={e=>setIncome(e.target.value)} placeholder="Ex: 2400" type="number" style={{width:"100%",padding:"12px 40px 12px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.panel2,color:T.text,fontSize:14,outline:"none"}}/>
              <span style={{position:"absolute",right:14,top:14,fontSize:13,color:T.mut}}>€</span>
            </div>
          </div>
          <div style={{fontSize:11.5,color:T.mut,marginBottom:4}}>Esta informação é usada apenas para calcular orçamentos sugeridos.</div>
        </div>
      )}
      {step===2&&(
        <div className="page" style={{width:360,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:14}}>🏦</div>
          <div className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:600,marginBottom:8}}>Liga a tua conta bancária</div>
          <div style={{fontSize:13,color:T.sub,marginBottom:24,lineHeight:1.6}}>Utilizamos Open Banking (PSD2). Os teus dados são encriptados e nunca partilhados com terceiros.</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
            {BANKS.map(b=>(
              <div key={b} className="fp-btn" onClick={()=>setBank(b)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:10,border:`1px solid ${bank===b?T.accent:T.border}`,background:bank===b?`${T.accent}10`:T.panel2,cursor:"pointer",transition:"all .18s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:30,height:30,borderRadius:8,background:T.panel,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏦</div>
                  <span style={{fontSize:13,fontWeight:500}}>{b}</span>
                </div>
                {bank===b&&<CheckCheck size={15} color={T.accent}/>}
              </div>
            ))}
          </div>
          <div className="fp-btn" style={{fontSize:12,color:T.sub,cursor:"pointer"}}>Continuar sem ligar conta (importar CSV depois)</div>
        </div>
      )}
      {step===3&&(
        <div className="page" style={{width:360,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:14}}>💰</div>
          <div className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:600,marginBottom:8}}>Escolhe um ponto de partida</div>
          <div style={{fontSize:13,color:T.sub,marginBottom:24,lineHeight:1.6}}>Podes sempre ajustar os orçamentos mais tarde.</div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {PRESETS.map(p=>(
              <div key={p.n} className="fp-btn" onClick={()=>setPreset(p.n)} style={{textAlign:"left",padding:"14px 16px",borderRadius:10,border:`1px solid ${preset===p.n?T.accent:T.border}`,background:preset===p.n?`${T.accent}10`:T.panel2,transition:"all .18s"}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:3,display:"flex",alignItems:"center",justifyContent:"space-between"}}>{p.n}{preset===p.n&&<CheckCheck size={14} color={T.accent}/>}</div>
                <div style={{fontSize:11.5,color:T.sub}}>{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:10,marginTop:28}}>
        {step>1&&<div className="fp-btn" onClick={()=>setStep(s=>s-1)} style={{padding:"12px 24px",borderRadius:10,border:`1px solid ${T.border}`,fontSize:13.5,fontWeight:500,color:T.sub}}>← Voltar</div>}
        <div className="fp-btn" onClick={next} style={{padding:"12px 32px",borderRadius:10,background:T.accent,color:"#0A0D12",fontSize:13.5,fontWeight:600}}>
          {step===3?"Começar a usar →":"Próximo →"}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function PageDashboard({T,goals,subs,txs,setView}){
  const totalCat=CATS.reduce((s,c)=>s+c.value,0);
  const income=2650,expense=1860,balance=12480;
  const sr=Math.round(((income-expense)/income)*100);
  return(
    <div className="page">
      <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr 1fr",gap:14,marginBottom:14}}>
        <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:12.5,color:T.sub,marginBottom:6}}>Saldo total</div>
          <div className="fp-num" style={{fontSize:34,fontWeight:600,marginBottom:10}}>{fmtS(balance)}</div>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:T.accent}}><ArrowUpRight size={13}/>+6,4% face ao mês anterior</div>
          <div style={{height:52,marginTop:14,marginLeft:-6,marginRight:-6}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND}><defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={.35}/><stop offset="100%" stopColor={T.accent} stopOpacity={0}/></linearGradient></defs>
                <Area type="monotone" dataKey="income" stroke={T.accent} strokeWidth={2} fill="url(#hg)" isAnimationActive animationDuration={900}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="fp-card" onClick={()=>setView("transactions")} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px",cursor:"pointer"}}>
          <div style={{fontSize:12.5,color:T.sub,marginBottom:8,display:"flex",justifyContent:"space-between"}}>Receitas (Jul)<ArrowUpRight size={13} color={T.mut}/></div>
          <div className="fp-num" style={{fontSize:24,fontWeight:600,marginBottom:8}}>{fmtS(income)}</div>
          <div style={{fontSize:11.5,color:T.accent,display:"flex",alignItems:"center",gap:4}}><TrendingUp size={12}/>+10% vs mês anterior</div>
        </div>
        <div className="fp-card" onClick={()=>setView("transactions")} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px",cursor:"pointer"}}>
          <div style={{fontSize:12.5,color:T.sub,marginBottom:8,display:"flex",justifyContent:"space-between"}}>Despesas (Jul)<ArrowDownRight size={13} color={T.mut}/></div>
          <div className="fp-num" style={{fontSize:24,fontWeight:600,marginBottom:8}}>{fmtS(expense)}</div>
          <div style={{fontSize:11.5,color:"#D4537E",display:"flex",alignItems:"center",gap:4}}><TrendingDown size={12}/>-7% vs mês anterior</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:600}}>Fluxo de caixa</div>
            <div style={{fontSize:11.5,color:T.sub}}>Poupança {sr}%</div>
          </div>
          <div style={{height:155}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND}><CartesianGrid stroke={T.border} vertical={false}/>
                <XAxis dataKey="m" tick={{fontSize:10,fill:T.mut}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:T.panel2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} formatter={v=>fmtS(v)}/>
                <Line type="monotone" dataKey="income" stroke={T.accent} strokeWidth={2} dot={false} isAnimationActive animationDuration={900}/>
                <Line type="monotone" dataKey="expense" stroke={T.accent2} strokeWidth={2} dot={false} isAnimationActive animationDuration={900}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{display:"flex",gap:14,marginTop:8,fontSize:11,color:T.sub}}>
            <Leg dot={T.accent} label="Receitas"/><Leg dot={T.accent2} label="Despesas"/>
          </div>
        </div>
        <div className="fp-card" onClick={()=>setView("budgets")} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:20,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:600}}>Despesas por categoria</div>
            <ChevronRight size={14} color={T.mut}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:108,height:108,flexShrink:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={CATS} dataKey="value" innerRadius={32} outerRadius={50} paddingAngle={3} stroke="none" isAnimationActive animationDuration={800}>
                  {CATS.map((c,i)=><Cell key={i} fill={c.color}/>)}
                </Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
              {CATS.map(c=>(
                <div key={c.name} style={{display:"flex",justifyContent:"space-between",fontSize:11.5}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,color:T.sub}}><span style={{width:7,height:7,borderRadius:2,background:c.color}}/>{c.name}</div>
                  <span className="fp-num" style={{fontWeight:500}}>{Math.round(c.value/totalCat*100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14}}>
        <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:600}}>Transações recentes</div>
            <div className="fp-btn" onClick={()=>setView("transactions")} style={{fontSize:11.5,color:T.accent,display:"flex",alignItems:"center",gap:3}}>Ver todas<ChevronRight size={12}/></div>
          </div>
          {txs.slice(0,5).map((t,i)=>(
            <div key={t.id} className="fp-row stagger" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 6px",borderRadius:9,borderBottom:i<4?`1px solid ${T.border}`:"none",animationDelay:`${i*.05}s`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:28,height:28,borderRadius:9,background:`${t.color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}><t.icon size={13} color={t.color}/></div>
                <div><div style={{fontSize:12.5,fontWeight:500}}>{t.merchant}</div><div style={{fontSize:10.5,color:T.sub}}>{t.cat} · {t.ds}</div></div>
              </div>
              <span className="fp-num" style={{fontSize:12.5,fontWeight:600,color:t.amount>0?T.accent:T.text}}>{t.amount>0?"+":"-"}{fmt(t.amount)}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:600}}>Objetivos</div>
              <div className="fp-btn" onClick={()=>setView("goals")} style={{fontSize:11.5,color:T.accent,display:"flex",alignItems:"center",gap:3}}>Ver<ChevronRight size={12}/></div>
            </div>
            {goals.slice(0,2).map(g=><MiniGoal key={g.id} g={g} T={T}/>)}
          </div>
          <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:600}}>Subscrições</div>
              <div className="fp-btn" onClick={()=>setView("subscriptions")} style={{fontSize:11.5,color:T.accent,display:"flex",alignItems:"center",gap:3}}>{fmtS(subs.filter(s=>s.active).reduce((a,s)=>a+s.monthly,0))}/mês<ChevronRight size={12}/></div>
            </div>
            {subs.filter(s=>s.active).slice(0,4).map(s=>(
              <div key={s.id} style={{display:"flex",justifyContent:"space-between",fontSize:11.5,padding:"4px 0",color:T.sub}}>
                <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:6,height:6,borderRadius:"50%",background:s.color}}/>{s.name}</span>
                <span className="fp-num">{fmt(s.monthly)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
function PageTransactions({T,txs,setTxs,setModal,toast}){
  const [filter,setFilter]=useState("all");
  const [catFilter,setCatFilter]=useState("Todos");
  const [expanded,setExpanded]=useState(null);

  const filtered=useMemo(()=>txs.filter(t=>{
    if(filter==="income"&&t.amount<=0)return false;
    if(filter==="expense"&&t.amount>=0)return false;
    if(catFilter!=="Todos"&&t.cat!==catFilter)return false;
    return true;
  }),[txs,filter,catFilter]);

  const delTx=(id)=>{setTxs(ts=>ts.filter(t=>t.id!==id));toast("info","Transação eliminada.");};
  const allCats=["Todos",...Array.from(new Set(txs.map(t=>t.cat)))];

  return(
    <div className="page">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
        <Metric T={T} label="Receitas este mês" value={fmtS(txs.filter(t=>t.amount>0).reduce((a,t)=>a+t.amount,0))} sub={`${txs.filter(t=>t.amount>0).length} entradas`} col={T.accent}/>
        <Metric T={T} label="Despesas este mês" value={fmtS(Math.abs(txs.filter(t=>t.amount<0).reduce((a,t)=>a+t.amount,0)))} sub={`${txs.filter(t=>t.amount<0).length} saídas`} col="#D4537E"/>
        <Metric T={T} label="Saldo líquido" value={fmtS(txs.reduce((a,t)=>a+t.amount,0))} sub="todas as transações" col={T.accent2}/>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:6}}>
          {[["all","Todos"],["income","Receitas"],["expense","Despesas"]].map(([v,l])=>(
            <div key={v} className="fp-btn" onClick={()=>setFilter(v)} style={{padding:"6px 14px",borderRadius:8,fontSize:12.5,fontWeight:500,background:filter===v?T.accent:T.panel2,color:filter===v?"#0A0D12":T.sub,border:`1px solid ${filter===v?T.accent:T.border}`,transition:"all .18s"}}>{l}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${T.border}`,fontSize:12,outline:"none"}}>
            {allCats.map(c=><option key={c}>{c}</option>)}
          </select>
          <div className="fp-btn" onClick={()=>setModal({type:"addTransaction"})} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,background:T.accent,color:"#0A0D12",fontSize:12.5,fontWeight:600}}>
            <Plus size={13}/>Nova transação
          </div>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.length===0&&<div style={{padding:32,textAlign:"center",color:T.sub,fontSize:13}}>Sem transações para os filtros selecionados.</div>}
        {filtered.map((t,i)=>(
          <div key={t.id} className="fp-card stagger" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",animationDelay:`${i*.04}s`}}>
            <div className="fp-row" onClick={()=>setExpanded(expanded===t.id?null:t.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:34,height:34,borderRadius:10,background:`${t.color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}><t.icon size={15} color={t.color}/></div>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{t.merchant}</div>
                  <div style={{fontSize:11,color:T.sub}}>{t.cat} · {t.ds}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <span className="fp-num" style={{fontSize:13.5,fontWeight:600,color:t.amount>0?T.accent:T.text}}>{t.amount>0?"+":"-"}{fmt(t.amount)}</span>
                <ChevronRight size={14} color={T.mut} style={{transform:expanded===t.id?"rotate(90deg)":"rotate(0)",transition:"transform .2s"}}/>
              </div>
            </div>
            {expanded===t.id&&(
              <div style={{padding:"0 16px 14px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4,paddingTop:12}}>
                <div style={{display:"flex",gap:16}}>
                  <div><div style={{fontSize:10.5,color:T.sub,marginBottom:2}}>Data</div><div style={{fontSize:12,fontWeight:500}}>{t.ds}</div></div>
                  <div><div style={{fontSize:10.5,color:T.sub,marginBottom:2}}>Categoria</div><div style={{fontSize:12,fontWeight:500}}>{t.cat}</div></div>
                  <div><div style={{fontSize:10.5,color:T.sub,marginBottom:2}}>ID</div><div className="fp-num" style={{fontSize:12}}>#TX{t.id.toString().padStart(4,"0")}</div></div>
                </div>
                <div className="fp-btn" onClick={()=>delTx(t.id)} style={{display:"flex",alignItems:"center",gap:5,fontSize:11.5,color:T.danger,padding:"5px 10px",borderRadius:7,border:`1px solid ${T.danger}44`}}>
                  <Trash2 size={12}/>Eliminar
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BUDGETS ──────────────────────────────────────────────────────────────────
function PageBudgets({T,budgets,setBudgets,setModal,toast}){
  const tl=budgets.reduce((s,b)=>s+b.limit,0);
  const ts=budgets.reduce((s,b)=>s+b.spent,0);
  const del=(id)=>{setBudgets(bs=>bs.filter(b=>b.id!==id));toast("info","Orçamento eliminado.");};
  return(
    <div className="page">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
        <Metric T={T} label="Orçamentado" value={fmtS(tl)} sub={`${budgets.length} categorias`} col={T.accent2}/>
        <Metric T={T} label="Gasto" value={fmtS(ts)} sub={`${Math.round(ts/tl*100)}% utilizado`} col={T.warn}/>
        <Metric T={T} label="Restante" value={fmtS(Math.max(tl-ts,0))} sub="até 31 jul" col={T.accent}/>
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
            <BudgetCard key={b.id} b={b} T={T} pct={pct} over={over} warn={warn} barC={barC} delay={i*.06}
              onEdit={()=>setModal({type:"editBudget",data:b})}
              onDelete={()=>del(b.id)}/>
          );
        })}
      </div>
    </div>
  );
}

function BudgetCard({b,T,pct,over,warn,barC,delay,onEdit,onDelete}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),120);return()=>clearTimeout(t);},[pct]);
  return(
    <div className="fp-card stagger" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:"15px 16px",animationDelay:`${delay}s`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:`${b.color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}><b.icon size={14} color={b.color}/></div>
          <div>
            <div style={{fontSize:13,fontWeight:600}}>{b.name}</div>
            <div className="fp-num" style={{fontSize:11,color:T.sub}}>{fmtS(b.spent)} / {fmtS(b.limit)}</div>
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
        <span>{over?`${fmtS(b.spent-b.limit)} acima`:`${fmtS(b.limit-b.spent)} restante`}</span>
      </div>
    </div>
  );
}

// ─── GOALS ────────────────────────────────────────────────────────────────────
function PageGoals({T,goals,setGoals,setModal,toast}){
  const del=(id)=>{setGoals(gs=>gs.filter(g=>g.id!==id));toast("info","Objetivo eliminado.");};
  return(
    <div className="page">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
        <Metric T={T} label="Total em poupança" value={fmtS(goals.reduce((a,g)=>a+g.saved,0))} sub={`${goals.length} objetivos`} col={T.accent}/>
        <Metric T={T} label="Contribuição mensal" value={fmtS(goals.reduce((a,g)=>a+g.monthly,0))} sub="total comprometido" col={T.accent2}/>
        <Metric T={T} label="Poupança necessária" value={fmtS(goals.reduce((a,g)=>a+(g.target-g.saved),0))} sub="para atingir objetivos" col={T.warn}/>
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
      <div className="fp-num" style={{textAlign:"center",fontSize:12.5,marginBottom:12}}>{fmtS(g.saved)} <span style={{color:T.sub}}>de {fmtS(g.target)}</span></div>
      <div style={{paddingTop:10,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",fontSize:11,color:T.sub,marginBottom:8}}>
        <span>Mensal</span><span className="fp-num" style={{color:T.text,fontWeight:500}}>{fmtS(g.monthly)}</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.sub,marginBottom:12}}>
        <span>Probabilidade</span><span className="fp-num" style={{color:T.accent,fontWeight:500}}>{g.prob}%</span>
      </div>
      <div className="fp-btn" onClick={onContribute} style={{textAlign:"center",padding:"8px",borderRadius:9,background:`${g.color}22`,color:g.color,fontSize:12.5,fontWeight:600}}>+ Contribuir</div>
    </div>
  );
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
function PageSubscriptions({T,subs,setSubs,setModal,toast}){
  const [tab,setTab]=useState("active");
  const active=subs.filter(s=>s.active);
  const inactive=subs.filter(s=>!s.active);
  const shown=tab==="active"?active:inactive;
  const total=active.reduce((a,s)=>a+s.monthly,0);
  const unused=active.filter(s=>!s.used);

  const cancel=(id)=>{setSubs(ss=>ss.map(s=>s.id===id?{...s,active:false}:s));toast("info","Subscrição cancelada. Poupanças calculadas.");};
  const restore=(id)=>{setSubs(ss=>ss.map(s=>s.id===id?{...s,active:true}:s));toast("success","Subscrição reativada.");};

  return(
    <div className="page">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
        <Metric T={T} label="Total mensal" value={fmtS(total)} sub={`${active.length} subscrições ativas`} col={T.accent}/>
        <Metric T={T} label="Total anual" value={fmtS(total*12)} sub="estimado" col={T.accent2}/>
        <Metric T={T} label="Poupança potencial" value={fmtS(unused.reduce((a,s)=>a+s.monthly,0))} sub={`${unused.length} pouco usadas`} col={T.warn}/>
      </div>
      {unused.length>0&&(
        <div style={{padding:"12px 16px",borderRadius:12,background:`${T.warn}12`,border:`1px solid ${T.warn}44`,marginBottom:14,display:"flex",alignItems:"center",gap:10,fontSize:12.5}}>
          <AlertTriangle size={15} color={T.warn}/>
          <span>Tens <strong>{unused.length} subscrições pouco usadas</strong> — cancelá-las pouparia {fmtS(unused.reduce((a,s)=>a+s.monthly*12,0))}/ano.</span>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",gap:6}}>
          {[["active","Ativas"],["inactive","Canceladas"]].map(([v,l])=>(
            <div key={v} className="fp-btn" onClick={()=>setTab(v)} style={{padding:"6px 14px",borderRadius:8,fontSize:12.5,fontWeight:500,background:tab===v?T.accent:T.panel2,color:tab===v?"#0A0D12":T.sub,border:`1px solid ${tab===v?T.accent:T.border}`,transition:"all .18s"}}>{l}</div>
          ))}
        </div>
        <div className="fp-btn" onClick={()=>setModal({type:"addSub"})} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,background:T.accent,color:"#0A0D12",fontSize:12.5,fontWeight:600}}><Plus size={13}/>Adicionar</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {shown.length===0&&<div style={{padding:32,textAlign:"center",color:T.sub,fontSize:13}}>{tab==="active"?"Sem subscrições ativas.":"Sem subscrições canceladas."}</div>}
        {shown.map((s,i)=>(
          <div key={s.id} className="fp-card stagger" style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:"13px 16px",animationDelay:`${i*.05}s`}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${s.color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}><s.icon size={16} color={s.color}/></div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13.5,fontWeight:600}}>{s.name}</span>
                  {!s.used&&s.active&&<span style={{fontSize:10,fontWeight:600,color:T.warn,background:`${T.warn}18`,padding:"2px 7px",borderRadius:5}}>Pouco usada</span>}
                  {!s.active&&<span style={{fontSize:10,fontWeight:600,color:T.sub,background:`${T.border}`,padding:"2px 7px",borderRadius:5}}>Cancelada</span>}
                </div>
                <div style={{fontSize:11,color:T.sub}}>Próxima cobrança: {s.next}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{textAlign:"right"}}>
                <div className="fp-num" style={{fontSize:13.5,fontWeight:600}}>{fmt(s.monthly)}<span style={{color:T.sub,fontWeight:400,fontSize:11}}>/mês</span></div>
                <div style={{fontSize:10.5,color:T.sub}}>{fmtS(s.monthly*12)}/ano</div>
              </div>
              {s.active
                ?<div className="fp-btn" onClick={()=>setModal({type:"cancelSub",data:s})} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${T.danger}55`,color:T.danger,fontSize:12,fontWeight:500}}>Cancelar</div>
                :<div className="fp-btn" onClick={()=>restore(s.id)} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${T.accent}55`,color:T.accent,fontSize:12,fontWeight:500}}>Reativar</div>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function PageReports({T,toast}){
  const [period,setPeriod]=useState("month");
  const totalIncome=REPORT_DATA.reduce((a,d)=>a+d.income,0);
  const totalExp=REPORT_DATA.reduce((a,d)=>a+d.expense,0);
  const totalSaved=REPORT_DATA.reduce((a,d)=>a+d.saved,0);
  const best=REPORT_DATA.reduce((a,b)=>b.saved>a.saved?b:a);

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
        <Metric T={T} label="Receitas totais" value={fmtS(totalIncome)} sub="Jan – Jul 2025" col={T.accent}/>
        <Metric T={T} label="Despesas totais" value={fmtS(totalExp)} sub="Jan – Jul 2025" col="#D4537E"/>
        <Metric T={T} label="Total poupado" value={fmtS(totalSaved)} sub={`Melhor mês: ${best.m} (${fmtS(best.saved)})`} col={T.accent2}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:20}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Receitas vs Despesas</div>
          <div style={{height:180}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REPORT_DATA} barGap={4}>
                <CartesianGrid stroke={T.border} vertical={false}/>
                <XAxis dataKey="m" tick={{fontSize:10,fill:T.mut}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:T.panel2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} formatter={v=>fmtS(v)}/>
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
              <AreaChart data={REPORT_DATA}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={.4}/><stop offset="100%" stopColor={T.accent} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid stroke={T.border} vertical={false}/>
                <XAxis dataKey="m" tick={{fontSize:10,fill:T.mut}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:T.panel2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} formatter={v=>fmtS(v)}/>
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
            <BarChart data={CATS} layout="vertical" margin={{left:10}}>
              <XAxis type="number" hide/>
              <YAxis type="category" dataKey="name" tick={{fontSize:11.5,fill:T.sub}} axisLine={false} tickLine={false} width={90}/>
              <Tooltip contentStyle={{background:T.panel2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} formatter={v=>fmt(v)}/>
              <Bar dataKey="value" radius={[0,4,4,0]} isAnimationActive animationDuration={800}>
                {CATS.map((c,i)=><Cell key={i} fill={c.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function PageSettings({T,profile,setProfile,notifPrefs,setNotifPrefs,twoFA,setTwoFA,toast,dark,setDark,onLogout}){
  const [name,setName]=useState(profile.name);
  const [email,setEmail]=useState(profile.email);
  const [editing,setEditing]=useState(false);
  const saveProfile=()=>{setProfile({name,email});setEditing(false);toast("success","Perfil atualizado com sucesso.");};
  const Toggle=({val,onToggle,label,sub})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
      <div><div style={{fontSize:13,fontWeight:500}}>{label}</div>{sub&&<div style={{fontSize:11.5,color:T.sub,marginTop:2}}>{sub}</div>}</div>
      <div className="fp-btn" onClick={onToggle} style={{width:40,height:22,borderRadius:11,background:val?T.accent:T.border,position:"relative",transition:"background .25s"}}>
        <div style={{position:"absolute",top:2,left:val?18:2,width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)",transition:"left .25s"}}/>
      </div>
    </div>
  );
  return(
    <div className="page" style={{maxWidth:600}}>
      {/* Profile */}
      <Section T={T} title="Perfil" style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#0A0D12"}}>MR</div>
          <div><div style={{fontSize:14,fontWeight:600}}>{profile.name}</div><div style={{fontSize:12.5,color:T.sub}}>{profile.email}</div></div>
          <div className="fp-btn" onClick={()=>setEditing(!editing)} style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:`1px solid ${T.border}`,fontSize:12.5,color:T.sub}}><Edit2 size={13}/>{editing?"Cancelar":"Editar"}</div>
        </div>
        {editing&&(
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <div><label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>Nome</label><input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,color:T.text,fontSize:12.5,outline:"none"}}/></div>
            <div><label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,color:T.text,fontSize:12.5,outline:"none"}}/></div>
            <div className="fp-btn" onClick={saveProfile} style={{padding:"9px",borderRadius:9,background:T.accent,color:"#0A0D12",fontSize:13,fontWeight:600,textAlign:"center"}}>Guardar alterações</div>
          </div>
        )}
      </Section>

      {/* Security */}
      <Section T={T} title="Segurança" style={{marginBottom:18}}>
        <Toggle val={twoFA} onToggle={()=>{setTwoFA(v=>!v);toast("success",twoFA?"Autenticação de dois fatores desativada.":"Autenticação de dois fatores ativada. Mais segurança para a tua conta.");}} label="Autenticação de dois fatores" sub="Requer código SMS em cada início de sessão"/>
        <div className="fp-btn" onClick={()=>toast("info","Link de alteração de palavra-passe enviado para o teu email.")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
          <div><div style={{fontSize:13,fontWeight:500}}>Palavra-passe</div><div style={{fontSize:11.5,color:T.sub,marginTop:2}}>Atualizada há 3 meses</div></div>
          <span style={{fontSize:12,color:T.accent}}>Alterar →</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0"}}>
          <div><div style={{fontSize:13,fontWeight:500}}>Sessões ativas</div><div style={{fontSize:11.5,color:T.sub,marginTop:2}}>Chrome · Lisboa, PT · Agora</div></div>
          <div className="fp-btn" onClick={()=>toast("info","Todas as outras sessões foram terminadas.")} style={{fontSize:12,color:T.danger}}>Terminar outras</div>
        </div>
      </Section>

      {/* Notifications */}
      <Section T={T} title="Notificações" style={{marginBottom:18}}>
        {[["budget","Alertas de orçamento","Quando estás perto ou excedes um limite"],["salary","Salário recebido","Quando receberes uma transferência grande"],["insights","Insights financeiros","Análises semanais de consumo"],["goals","Objetivos","Quando estás perto de atingir uma meta"],["unusual","Despesas invulgares","Quando detetamos uma despesa fora do padrão"]].map(([k,l,s])=>(
          <Toggle key={k} val={notifPrefs[k]} onToggle={()=>{setNotifPrefs(p=>({...p,[k]:!p[k]}));toast("info",`Notificação "${l}" ${notifPrefs[k]?"desativada":"ativada"}.`);}} label={l} sub={s}/>
        ))}
      </Section>

      {/* Appearance */}
      <Section T={T} title="Aparência" style={{marginBottom:18}}>
        <Toggle val={dark} onToggle={()=>setDark(d=>!d)} label="Modo escuro" sub="Interface com fundo escuro"/>
      </Section>

      {/* Danger zone */}
      <Section T={T} title="Gestão de dados">
        <div className="fp-btn" onClick={()=>toast("info","Os teus dados foram exportados. Verifica o teu email.")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
          <div><div style={{fontSize:13,fontWeight:500}}>Exportar dados</div><div style={{fontSize:11.5,color:T.sub,marginTop:2}}>Download completo em formato JSON</div></div>
          <Download size={14} color={T.sub}/>
        </div>
        <div className="fp-btn" onClick={onLogout} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:13,fontWeight:500}}>Terminar sessão</div>
          <LogOut size={14} color={T.sub}/>
        </div>
        <div className="fp-btn" onClick={()=>toast("error","Funcionalidade disponível na versão Enterprise.")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0"}}>
          <div><div style={{fontSize:13,fontWeight:500,color:T.danger}}>Eliminar conta</div><div style={{fontSize:11.5,color:T.sub,marginTop:2}}>Ação irreversível — todos os dados serão apagados</div></div>
          <Trash2 size={14} color={T.danger}/>
        </div>
      </Section>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function ModalRouter({T,modal,setModal,budgets,setBudgets,goals,setGoals,txs,setTxs,subs,setSubs,toast}){
  if(!modal)return null;
  const close=()=>setModal(null);
  const add=(type,data,msg)=>{if(type==="budget")setBudgets(bs=>[...bs,{id:nid(),...data}]);else if(type==="goal")setGoals(gs=>[...gs,{id:nid(),...data}]);else if(type==="tx")setTxs(ts=>[{id:nid(),...data},...ts]);else if(type==="sub")setSubs(ss=>[...ss,{id:nid(),...data}]);toast("success",msg);close();};

  const Overlay=({children})=>(
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",zIndex:40,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}}>
      <div className="scale-in" style={{background:T.panel,borderRadius:16,border:`1px solid ${T.border}`,padding:24,width:360,maxWidth:"90%",boxShadow:"0 16px 40px rgba(0,0,0,.3)"}}>
        {children}
      </div>
    </div>
  );

  const ModalHeader=({title,onClose})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div className="fp-disp" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:600}}>{title}</div>
      <div className="fp-btn" onClick={onClose}><X size={16} color={T.sub}/></div>
    </div>
  );

  const Inp=({label,placeholder,type="text",value,onChange})=>(
    <div style={{marginBottom:12}}>
      {label&&<label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>{label}</label>}
      <input value={value} onChange={onChange} placeholder={placeholder} type={type} style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,color:T.text,fontSize:12.5,outline:"none"}}/>
    </div>
  );

  const Btn=({label,onClick,color})=>(
    <div className="fp-btn" onClick={onClick} style={{padding:"11px",borderRadius:9,background:color||T.accent,color:color?"#fff":"#0A0D12",fontSize:13.5,fontWeight:600,textAlign:"center",marginTop:4}}>{label}</div>
  );

  if(modal.type==="addBudget"||modal.type==="editBudget"){
    const isEdit=modal.type==="editBudget";
    const [nm,setNm]=useState(isEdit?modal.data.name:"");
    const [lim,setLim]=useState(isEdit?modal.data.limit:"");
    const [col,setCol]=useState(isEdit?modal.data.color:COLORS[0]);
    const submit=()=>{
      if(!nm||!lim){toast("error","Preenche todos os campos.");return;}
      if(isEdit){setBudgets(bs=>bs.map(b=>b.id===modal.data.id?{...b,name:nm,limit:Number(lim),color:col}:b));toast("success","Orçamento atualizado.");close();}
      else add("budget",{name:nm,limit:Number(lim),spent:0,icon:Wallet,color:col},"Orçamento criado com sucesso.");
    };
    return(<Overlay><ModalHeader title={isEdit?"Editar orçamento":"Novo orçamento"} onClose={close}/>
      <Inp label="Nome da categoria" placeholder="Ex: Restauração" value={nm} onChange={e=>setNm(e.target.value)}/>
      <Inp label="Limite mensal (€)" placeholder="Ex: 300" type="number" value={lim} onChange={e=>setLim(e.target.value)}/>
      <div style={{marginBottom:16}}><label style={{fontSize:12,color:T.sub,display:"block",marginBottom:6}}>Cor</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} className="fp-btn" onClick={()=>setCol(c)} style={{width:24,height:24,borderRadius:6,background:c,border:`2px solid ${col===c?T.text:"transparent"}`,transition:"border-color .15s"}}/>)}</div></div>
      <Btn label={isEdit?"Guardar alterações":"Criar orçamento"} onClick={submit}/></Overlay>);
  }

  if(modal.type==="addGoal"){
    const [nm,setNm]=useState("");const [tgt,setTgt]=useState("");const [mon,setMon]=useState("");const [col,setCol]=useState(COLORS[0]);
    const submit=()=>{if(!nm||!tgt){toast("error","Preenche os campos obrigatórios.");return;}add("goal",{name:nm,target:Number(tgt),saved:0,monthly:Number(mon)||0,eta:"A calcular",icon:Target,color:col,prob:80},"Objetivo criado com sucesso!");};
    return(<Overlay><ModalHeader title="Novo objetivo" onClose={close}/>
      <Inp label="Nome do objetivo" placeholder="Ex: Viagem ao Japão" value={nm} onChange={e=>setNm(e.target.value)}/>
      <Inp label="Valor alvo (€)" placeholder="Ex: 3000" type="number" value={tgt} onChange={e=>setTgt(e.target.value)}/>
      <Inp label="Contribuição mensal (€)" placeholder="Ex: 200" type="number" value={mon} onChange={e=>setMon(e.target.value)}/>
      <div style={{marginBottom:16}}><label style={{fontSize:12,color:T.sub,display:"block",marginBottom:6}}>Cor</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} className="fp-btn" onClick={()=>setCol(c)} style={{width:24,height:24,borderRadius:6,background:c,border:`2px solid ${col===c?T.text:"transparent"}`}}/>)}</div></div>
      <Btn label="Criar objetivo" onClick={submit}/></Overlay>);
  }

  if(modal.type==="contributeGoal"){
    const g=modal.data;const [amt,setAmt]=useState("");
    const submit=()=>{if(!amt||Number(amt)<=0){toast("error","Insere um valor válido.");return;}setGoals(gs=>gs.map(x=>x.id===g.id?{...x,saved:Math.min(x.saved+Number(amt),x.target)}:x));toast("success",`${fmt(Number(amt))} adicionados ao objetivo "${g.name}".`);close();};
    return(<Overlay><ModalHeader title={`Contribuir — ${g.name}`} onClose={close}/>
      <div style={{textAlign:"center",marginBottom:18}}>
        <div className="fp-num" style={{fontSize:22,fontWeight:600}}>{fmtS(g.saved)} <span style={{color:T.sub,fontSize:14}}>de {fmtS(g.target)}</span></div>
        <div style={{height:6,background:T.border,borderRadius:5,overflow:"hidden",margin:"10px 0 4px"}}><div style={{width:`${Math.round(g.saved/g.target*100)}%`,height:"100%",background:g.color,borderRadius:5}}/></div>
        <div style={{fontSize:12,color:T.sub}}>{Math.round(g.saved/g.target*100)}% concluído</div>
      </div>
      <Inp label="Valor a adicionar (€)" placeholder="Ex: 100" type="number" value={amt} onChange={e=>setAmt(e.target.value)}/>
      <Btn label="Adicionar contribuição" onClick={submit}/></Overlay>);
  }

  if(modal.type==="addTransaction"){
    const [merchant,setMerchant]=useState("");const [amt,setAmt]=useState("");const [cat,setCat]=useState("Supermercado");const [type,setType]=useState("expense");
    const submit=()=>{if(!merchant||!amt){toast("error","Preenche todos os campos.");return;}const a=type==="expense"?-Math.abs(Number(amt)):Math.abs(Number(amt));add("tx",{merchant,cat,date:"2025-07-30",ds:"Hoje",amount:a,icon:ShoppingBag,color:"#5DCAA5"},"Transação adicionada.");};
    return(<Overlay><ModalHeader title="Nova transação" onClose={close}/>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["expense","Despesa"],["income","Receita"]].map(([v,l])=><div key={v} className="fp-btn" onClick={()=>setType(v)} style={{flex:1,textAlign:"center",padding:"7px",borderRadius:8,fontSize:12.5,fontWeight:500,background:type===v?T.accent:T.panel2,color:type===v?"#0A0D12":T.sub,border:`1px solid ${type===v?T.accent:T.border}`}}>{l}</div>)}
      </div>
      <Inp label="Comerciante / Descrição" placeholder="Ex: Continente" value={merchant} onChange={e=>setMerchant(e.target.value)}/>
      <Inp label="Valor (€)" placeholder="Ex: 45.00" type="number" value={amt} onChange={e=>setAmt(e.target.value)}/>
      <div style={{marginBottom:14}}><label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>Categoria</label>
        <select value={cat} onChange={e=>setCat(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.panel2,fontSize:12.5,outline:"none"}}>
          {CAT_NAMES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <Btn label="Adicionar transação" onClick={submit}/></Overlay>);
  }

  if(modal.type==="cancelSub"){
    const s=modal.data;
    const doCancel=()=>{setSubs(ss=>ss.map(x=>x.id===s.id?{...x,active:false}:x));toast("info",`"${s.name}" cancelada. Poupas ${fmtS(s.monthly*12)}/ano.`);close();};
    return(<Overlay><ModalHeader title="Cancelar subscrição" onClose={close}/>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{width:48,height:48,borderRadius:12,background:`${s.color}22`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><s.icon size={22} color={s.color}/></div>
        <div style={{fontSize:16,fontWeight:600,marginBottom:6}}>{s.name}</div>
        <div style={{fontSize:12.5,color:T.sub,lineHeight:1.5}}>Ao cancelar, poupas <strong className="fp-num">{fmt(s.monthly)}/mês</strong> ({fmtS(s.monthly*12)}/ano).<br/>Podes reativar a qualquer momento.</div>
      </div>
      <Btn label="Confirmar cancelamento" onClick={doCancel} color={T.danger}/>
      <div className="fp-btn" onClick={close} style={{textAlign:"center",padding:"10px",borderRadius:9,fontSize:13,color:T.sub,marginTop:8}}>Manter subscrição</div></Overlay>);
  }

  if(modal.type==="addSub"){
    const [nm,setNm]=useState("");const [monthly,setMonthly]=useState("");const [col,setCol]=useState(COLORS[0]);
    const submit=()=>{if(!nm||!monthly){toast("error","Preenche todos os campos.");return;}add("sub",{name:nm,monthly:Number(monthly),next:"1 ago",icon:Film,color:col,used:true,active:true},"Subscrição adicionada.");};
    return(<Overlay><ModalHeader title="Adicionar subscrição" onClose={close}/>
      <Inp label="Nome do serviço" placeholder="Ex: HBO Max" value={nm} onChange={e=>setNm(e.target.value)}/>
      <Inp label="Custo mensal (€)" placeholder="Ex: 9.99" type="number" value={monthly} onChange={e=>setMonthly(e.target.value)}/>
      <div style={{marginBottom:16}}><label style={{fontSize:12,color:T.sub,display:"block",marginBottom:6}}>Cor</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} className="fp-btn" onClick={()=>setCol(c)} style={{width:24,height:24,borderRadius:6,background:c,border:`2px solid ${col===c?T.text:"transparent"}`}}/>)}</div></div>
      <Btn label="Adicionar subscrição" onClick={submit}/></Overlay>);
  }

  return null;
}

// ─── SHARED ───────────────────────────────────────────────────────────────────
function Metric({T,label,value,sub,col}){
  return(
    <div className="fp-card" style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 18px"}}>
      <div style={{fontSize:12,color:T.sub,marginBottom:6}}>{label}</div>
      <div className="fp-num" style={{fontSize:22,fontWeight:600,marginBottom:6}}>{value}</div>
      <div style={{fontSize:11.5,color:col||T.sub}}>{sub}</div>
    </div>
  );
}

function Section({T,title,children,style}){
  return(
    <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",marginBottom:14,...style}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>{title}</div>
      {children}
    </div>
  );
}

function MiniGoal({g,T}){
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
      <div className="fp-num" style={{fontSize:10.5,color:T.sub,marginTop:3}}>{fmtS(g.saved)} de {fmtS(g.target)}</div>
    </div>
  );
}

function Leg({dot,label}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:5}}>
      <span style={{width:7,height:7,borderRadius:2,background:dot}}/>{label}
    </div>
  );
}