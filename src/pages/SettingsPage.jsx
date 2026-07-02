import { useState } from "react";
import { Download, Edit2, LogOut, Trash2 } from "lucide-react";
import { Section } from "../components/ui/FinanceComponents";
import { api } from "../services/api";

function Toggle({T,val,onToggle,label,sub}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
      <div><div style={{fontSize:13,fontWeight:500}}>{label}</div>{sub&&<div style={{fontSize:11.5,color:T.sub,marginTop:2}}>{sub}</div>}</div>
      <div className="fp-btn" onClick={onToggle} style={{width:40,height:22,borderRadius:11,background:val?T.accent:T.border,position:"relative",transition:"background .25s"}}>
        <div style={{position:"absolute",top:2,left:val?18:2,width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)",transition:"left .25s"}}/>
      </div>
    </div>
  );
}

export default function PageSettings({T,profile,setProfile,notifPrefs,setNotifPrefs,twoFA,toast,dark,setDark,onLogout}){
  const [name,setName]=useState(profile.name);
  const [email,setEmail]=useState(profile.email);
  const [editing,setEditing]=useState(false);
  const saveProfile=async()=>{try{const result=await api.user.profile({name,email});setProfile(result.user);setEditing(false);toast("success","Perfil atualizado com sucesso.");}catch(error){toast("error",error.message);}};
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
        <Toggle T={T} val={twoFA} onToggle={()=>toast("info","A autenticação de dois fatores será disponibilizada numa fase seguinte.")} label="Autenticação de dois fatores (em preparação)" sub="Será necessário validar o segundo fator antes de ativar esta opção"/>
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
          <Toggle key={k} T={T} val={notifPrefs[k]} onToggle={()=>{const prefs={...notifPrefs,[k]:!notifPrefs[k]};api.user.settings({notificationPrefs:prefs}).then(()=>{setNotifPrefs(prefs);toast("info",`Notificação "${l}" ${prefs[k]?"ativada":"desativada"}.`);}).catch(error=>toast("error",error.message));}} label={l} sub={s}/>
        ))}
      </Section>

      {/* Appearance */}
      <Section T={T} title="Aparência" style={{marginBottom:18}}>
        <Toggle T={T} val={dark} onToggle={()=>{const value=!dark;api.user.settings({darkMode:value}).then(()=>setDark(value)).catch(error=>toast("error",error.message));}} label="Modo escuro" sub="Interface com fundo escuro"/>
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
