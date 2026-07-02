import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart2, Bell, BellRing, CheckCheck, CreditCard, LayoutDashboard, LogOut,
  Moon, Repeat, Search, Send, Settings, Sparkles, Sun, Target, Wallet, X,
} from "lucide-react";
import { createGlobalStyles, darkTheme, lightTheme } from "./config/theme";
import { BDG0, CHAT0, GOALS0, NTF0, SUB0, TX0 } from "./data/mockData";
import { formatCurrency, nextId } from "./utils/currency";
import { hydrateBudget, hydrateGoal, hydrateSubscription, hydrateTransaction } from "./utils/entities";
import { api } from "./services/api";
import LoginPage from "./components/auth/LoginPage";
import OnboardingWizard from "./components/auth/OnboardingWizard";
import ModalRouter from "./components/modals/ModalRouter";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";
import GoalsPage from "./pages/GoalsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

async function loadFinancialData(){
  const [transactions,budgets,goals,subscriptions]=await Promise.all([api.transactions.list(),api.budgets.list(),api.goals.list(),api.subscriptions.list()]);
  return {transactions:transactions.transactions.map(hydrateTransaction),budgets:budgets.budgets.map(hydrateBudget),goals:goals.goals.map(hydrateGoal),subscriptions:subscriptions.subscriptions.map(hydrateSubscription)};
}

export default function FinPilotApp(){
  const [dark,setDark]=useState(true);
  const [authed,setAuthed]=useState(false);
  const [authLoad,setAuthLoad]=useState(false);
  const [authChecking,setAuthChecking]=useState(api.hasSession());
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

  const T=dark?darkTheme:lightTheme;
  const unread=notifs.filter(n=>!n.read).length;

  const applyFinancialData=data=>{setTxs(data.transactions);setBudgets(data.budgets);setGoals(data.goals);setSubs(data.subscriptions);};

  useEffect(()=>{
    if(!api.hasSession())return;
    Promise.all([api.auth.me(),loadFinancialData(),api.ai.history()])
      .then(([account,data,history])=>{setProfile(account.user);setDark(account.settings.darkMode);setTwoFA(account.settings.twoFactor);setNotifPrefs(account.settings.notificationPrefs);applyFinancialData(data);if(history.messages.length)setMsgs(history.messages.map(message=>({role:message.role,text:message.content})));setAuthed(true);})
      .catch(()=>api.setToken(null))
      .finally(()=>setAuthChecking(false));
  },[]);

  useEffect(()=>{
    const h=e=>{
      if(searchRef.current&&!searchRef.current.contains(e.target))setSearchOpen(false);
      if(notifRef.current&&!notifRef.current.contains(e.target))setNotifOpen(false);
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  const toast=(type,text)=>{
    const id=nextId();
    setToasts(ts=>[...ts,{id,type,text}]);
    setTimeout(()=>setToasts(ts=>ts.filter(t=>t.id!==id)),3600);
  };

  const login=async(credentials,isNew=false)=>{
    setAuthLoad(true);
    try{const result=isNew?await api.auth.register(credentials):await api.auth.login(credentials);api.setToken(result.token);setProfile(result.user);applyFinancialData(await loadFinancialData());setAuthed(true);if(isNew){setOnboarding(true);setObStep(1);}else toast("success","Sessão iniciada com sucesso.");}
    catch(error){api.setToken(null);throw error;}
    finally{setAuthLoad(false);}
  };
  const logout=()=>{api.setToken(null);setAuthed(false);setMsgs(CHAT0);};

  const sendMsg=async text=>{
    const t=text.trim();if(!t)return;
    setMsgs(m=>[...m,{role:"user",text:t}]);setChatIn("");setChatTyping(true);
    try{const result=await api.ai.chat(t);setMsgs(m=>[...m,{role:"assistant",text:result.answer}]);}
    catch(error){setMsgs(m=>[...m,{role:"assistant",text:error.message}]);}
    finally{setChatTyping(false);}
  };

  const searchResults=useMemo(()=>{
    if(!searchQ.trim())return[];
    const q=searchQ.toLowerCase();
    return txs.filter(t=>t.merchant.toLowerCase().includes(q)||t.cat.toLowerCase().includes(q)).slice(0,6);
  },[searchQ,txs]);

  if(authChecking)return <div style={{minHeight:600,display:"grid",placeItems:"center",background:T.bg,color:T.text}}>A carregar o FinPilot…</div>;
  if(!authed)return <LoginPage T={T} dark={dark} loading={authLoad} onLogin={credentials=>login(credentials,false)} onGoogle={()=>Promise.reject(new Error("A autenticação Google será configurada numa fase seguinte."))} onRegister={credentials=>login(credentials,true)}/>;
  if(onboarding)return <OnboardingWizard T={T} step={obStep} setStep={setObStep} onDone={()=>{setOnboarding(false);toast("success","Bem-vindo ao FinPilot! 🎉 O teu espaço financeiro está pronto.");}} />;

  const NAV=[
    {id:"dashboard",label:"Dashboard",icon:LayoutDashboard},
    {id:"transactions",label:"Transações",icon:CreditCard},
    {id:"budgets",label:"Orçamentos",icon:Wallet},
    {id:"goals",label:"Objetivos",icon:Target},
    {id:"subscriptions",label:"Subscrições",icon:Repeat},
    {id:"reports",label:"Relatórios",icon:BarChart2},
    {id:"settings",label:"Definições",icon:Settings},
  ];

  const PAGE_TITLES={dashboard:`Olá, ${profile.name.split(" ")[0]}`,transactions:"Transações",budgets:"Orçamentos",goals:"Objetivos",subscriptions:"Subscrições",reports:"Relatórios",settings:"Definições"};

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",background:T.bg,color:T.text,minHeight:600,display:"flex",borderRadius:20,overflow:"hidden",border:`1px solid ${T.border}`,position:"relative"}}>
      <style>{createGlobalStyles(T)}</style>

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
            <div style={{fontSize:12,color:T.sub,marginTop:2}}>{new Intl.DateTimeFormat("pt-PT",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date())}</div>
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
                    :searchResults.map(t=>(
                      <div key={t.id} className="fp-row" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 8px",borderRadius:8,cursor:"pointer"}}>
                        <div style={{display:"flex",alignItems:"center",gap:9}}>
                          <div style={{width:26,height:26,borderRadius:8,background:`${t.color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}><t.icon size={12} color={t.color}/></div>
                          <div><div style={{fontSize:12,fontWeight:500}}>{t.merchant}</div><div style={{fontSize:10.5,color:T.sub}}>{t.cat} · {t.ds}</div></div>
                        </div>
                        <span className="fp-num" style={{fontSize:12,fontWeight:600,color:t.amount>0?T.accent:T.text}}>{t.amount>0?"+":""}{formatCurrency(t.amount)}</span>
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
          {view==="dashboard"&&<DashboardPage T={T} goals={goals} subs={subs} txs={txs} setView={setView}/>}
          {view==="transactions"&&<TransactionsPage T={T} txs={txs} setTxs={setTxs} setModal={setModal} toast={toast}/>}
          {view==="budgets"&&<BudgetsPage T={T} budgets={budgets} setBudgets={setBudgets} setModal={setModal} toast={toast}/>}
          {view==="goals"&&<GoalsPage T={T} goals={goals} setGoals={setGoals} setModal={setModal} toast={toast}/>}
          {view==="subscriptions"&&<SubscriptionsPage T={T} subs={subs} setSubs={setSubs} setModal={setModal} toast={toast}/>}
          {view==="reports"&&<ReportsPage T={T} toast={toast}/>}
          {view==="settings"&&<SettingsPage T={T} profile={profile} setProfile={setProfile} notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} twoFA={twoFA} setTwoFA={setTwoFA} toast={toast} dark={dark} setDark={setDark} onLogout={logout}/>}
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
