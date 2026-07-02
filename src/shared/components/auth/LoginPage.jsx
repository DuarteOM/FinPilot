import { useState } from "react";
import { CheckCheck, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { createGlobalStyles } from "../../utils/theme";
import GoogleLogo from "../brand/GoogleLogo";

export default function LoginPage({ T, dark, loading, onLogin, onGoogle, onRegister }) {
  const [tab,       setTab]       = useState("login");
  const [email,     setEmail]     = useState("");
  const [pw,        setPw]        = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [pw2,       setPw2]       = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [err,       setErr]       = useState("");
  const [knownEmail, setKnownEmail] = useState("");

  const submit = async () => {
    setErr("");
    try {
      if (tab === "login") {
        if (!email || !pw) { setErr("Preenche todos os campos."); return; }
        await onLogin({ email: email.trim(), password: pw });
      } else {
        if (!firstName || !lastName || !email || !pw || !pw2) { setErr("Preenche todos os campos."); return; }
        if (pw !== pw2) { setErr("As palavras-passe não coincidem."); return; }
        await onRegister({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password: pw,
        });
      }
    } catch (error) {
      if (tab === "register" && error.status === 409) {
        const normalizedEmail = email.trim();
        setKnownEmail(normalizedEmail);
        setTab("login");
        setEmail(normalizedEmail);
        setPw("");
        setPw2("");
        setErr("Já existe uma conta com este email. Inicia sessão para continuar.");
        return;
      }
      setErr(error.message);
    }
  };

  const google = async () => { setErr(""); try { await onGoogle(); } catch (error) { setErr(error.message); } };

  const inputStyle = { padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none", width: "100%" };

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: T.bg, color: T.text, minHeight: 600, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden", display: "flex", alignItems: "stretch" }}>
      <style>{createGlobalStyles(T)}</style>

      {/* ── Left panel ── */}
      <div style={{ flex: 1.1, background: `linear-gradient(155deg,${T.panel2},${T.bg})`, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 40, position: "relative", overflow: "hidden", borderRight: `1px solid ${T.border}` }}>
        <div className="float1" style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: `${T.accent}12`, top: -70, left: -70 }} />
        <div className="float2" style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: `${T.accent2}12`, bottom: -50, right: -40 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={17} color="#0A0D12" />
          </div>
          <span className="fp-disp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17 }}>FinPilot</span>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 30, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 14 }}>O teu dinheiro,<br />finalmente claro.</div>
          <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.65, maxWidth: 310, marginBottom: 28 }}>Liga as tuas contas, define objetivos e deixa a IA encontrar oportunidades de poupança todos os dias.</div>
          {[
            ["Análise automática de transações",         "#5DCAA5"],
            ["Orçamentos inteligentes com alertas",       "#7F8FE4"],
            ["Assistente financeiro IA disponível 24/7",  "#E8A33D"],
            ["Segurança de nível bancário e RGPD",        "#D4537E"],
          ].map(([f, c]) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: T.sub, marginBottom: 9 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${c}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CheckCheck size={10} color={c} />
              </div>
              {f}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: T.sub, position: "relative", zIndex: 1 }}>
          <ShieldCheck size={14} color={T.accent} />Palavras-passe protegidas com scrypt · Privacidade desde a conceção
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: 300, animation: "fade-up .5s cubic-bezier(.2,.7,.3,1) both" }}>
          <div className="fp-disp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
            {tab === "login" ? "Bem-vindo de volta" : "Criar conta grátis"}
          </div>
          <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 22 }}>
            {tab === "login" ? "Entra para aceder ao teu painel financeiro." : "Começa a controlar as tuas finanças hoje."}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", background: T.panel2, borderRadius: 10, padding: 3, marginBottom: 20, border: `1px solid ${T.border}` }}>
            {["login", "register"].map(t => (
              <div key={t} className="fp-btn" onClick={() => { setTab(t); setErr(""); if (t === "register") setKnownEmail(""); }}
                style={{ flex: 1, textAlign: "center", padding: "7px", borderRadius: 7, fontSize: 12.5, fontWeight: 500, background: tab === t ? T.panel : "transparent", color: tab === t ? T.text : T.sub, transition: "all .18s" }}>
                {t === "login" ? "Iniciar sessão" : "Criar conta"}
              </div>
            ))}
          </div>

          {/* Google */}
          <div className="fp-btn" onClick={!loading ? google : undefined}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px", borderRadius: 10, border: `1px solid ${T.border}`, background: dark ? T.panel2 : "#FFF", fontSize: 13.5, fontWeight: 500, color: T.text, marginBottom: 14 }}>
            {loading
              ? <><div className="spinner" style={{ width: 16, height: 16, borderRadius: "50%", border: `2.5px solid ${T.border}`, borderTopColor: T.accent }} />A ligar à conta Google…</>
              : <><GoogleLogo size={17} />Continuar com Google</>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0", color: T.mut, fontSize: 11 }}>
            <div style={{ flex: 1, height: 1, background: T.border }} /> ou <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {tab === "register" && (
              <div style={{ display: "flex", gap: 8 }}>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Primeiro nome" style={inputStyle} />
                <input value={lastName}  onChange={e => setLastName(e.target.value)}  placeholder="Apelido"        style={inputStyle} />
              </div>
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle} />
            <div style={{ position: "relative" }}>
              <input value={pw} onChange={e => setPw(e.target.value)} placeholder="Palavra-passe" type={showPw ? "text" : "password"}
                style={{ ...inputStyle, padding: "10px 36px 10px 12px" }} />
              <div className="fp-btn" onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 11, top: 11 }}>
                {showPw ? <EyeOff size={13} color={T.mut} /> : <Eye size={13} color={T.mut} />}
              </div>
            </div>
            {tab === "register" && (
              <input value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Confirmar palavra-passe" type="password" style={inputStyle} />
            )}
          </div>

          {err && <div style={{ fontSize: 11.5, color: T.danger, marginTop: 8, padding: "6px 10px", background: `${T.danger}12`, borderRadius: 7 }}>{err}</div>}
          {knownEmail && tab === "login" && (
            <div style={{ fontSize: 11.5, color: T.sub, marginTop: 7 }}>
              Email pronto para iniciar sessão: <span style={{ color: T.text }}>{knownEmail}</span>
            </div>
          )}
          {tab === "login" && <div className="fp-btn" style={{ textAlign: "right", fontSize: 11.5, color: T.accent, marginTop: 6 }}>Esqueci a palavra-passe</div>}

          <div className="fp-btn" onClick={!loading ? submit : undefined}
            style={{ marginTop: 14, textAlign: "center", padding: "12px", borderRadius: 10, background: T.accent, color: "#0A0D12", fontSize: 13.5, fontWeight: 600 }}>
            {loading ? "A ligar…" : tab === "login" ? "Entrar na minha conta" : "Criar conta e começar"}
          </div>

          <div style={{ textAlign: "center", fontSize: 11.5, color: T.sub, marginTop: 16 }}>
            {tab === "login"
              ? <>Ainda não tens conta? <span className="fp-btn" onClick={() => setTab("register")} style={{ color: T.accent, fontWeight: 500 }}>Criar conta grátis</span></>
              : <>Já tens conta? <span className="fp-btn" onClick={() => setTab("login")} style={{ color: T.accent, fontWeight: 500 }}>Iniciar sessão</span></>}
          </div>
        </div>
      </div>
    </div>
  );
}
