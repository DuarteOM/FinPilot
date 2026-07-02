import { useState } from "react";
import { Download, Edit2, LogOut, Trash2 } from "lucide-react";
import { Section } from "../../shared/components/FinanceComponents";
import { api } from "../../api/api";
import Toggle from "./components/Toggle";

export default function SettingsPage({ T, profile, setProfile, settings, setSettings, toast, dark, setDark, onLogout }) {
  const [firstName, setFirstName] = useState(profile.firstName ?? profile.name?.split(" ")[0] ?? "");
  const [lastName,  setLastName]  = useState(profile.lastName  ?? profile.name?.split(" ").slice(1).join(" ") ?? "");
  const [email,     setEmail]     = useState(profile.email ?? "");
  const [editing,   setEditing]   = useState(false);

  const saveProfile = async () => {
    try {
      const result = await api.user.profile({ firstName, lastName, email });
      setProfile({ ...result.user, name: [firstName, lastName].filter(Boolean).join(" ") });
      setEditing(false);
      toast("success", "Perfil atualizado com sucesso.");
    } catch (error) { toast("error", error.message); }
  };

  const saveSetting = async (patch) => {
    try {
      const result = await api.user.settings(patch);
      setSettings(s => ({ ...s, ...result.settings }));
    } catch (error) { toast("error", error.message); }
  };

  const initials = [profile.firstName ?? "", profile.lastName ?? ""]
    .map(w => w[0] ?? "").join("").toUpperCase() || (profile.name ?? "?")[0].toUpperCase();

  return (
    <div className="page" style={{ maxWidth: 600 }}>

      {/* ── Profile ── */}
      <Section T={T} title="Perfil" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#0A0D12" }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{profile.name}</div>
            <div style={{ fontSize: 12.5, color: T.sub }}>{profile.email}</div>
          </div>
          <div className="fp-btn" onClick={() => setEditing(!editing)}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12.5, color: T.sub }}>
            <Edit2 size={13} />{editing ? "Cancelar" : "Editar"}
          </div>
        </div>
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Primeiro nome</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Apelido</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }} />
            </div>
            <div className="fp-btn" onClick={saveProfile}
              style={{ padding: "9px", borderRadius: 9, background: T.accent, color: "#0A0D12", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
              Guardar alterações
            </div>
          </div>
        )}
      </Section>

      {/* ── Security ── */}
      <Section T={T} title="Segurança" style={{ marginBottom: 18 }}>
        <div className="fp-btn" onClick={() => toast("info", "Link de alteração de palavra-passe enviado para o teu email.")}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Palavra-passe</div>
            <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>Clica para enviar link de alteração</div>
          </div>
          <span style={{ fontSize: 12, color: T.accent }}>Alterar →</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Sessões ativas</div>
            <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>Chrome · Lisboa, PT · Agora</div>
          </div>
          <div className="fp-btn" onClick={() => toast("info", "Todas as outras sessões foram terminadas.")}
            style={{ fontSize: 12, color: T.danger }}>
            Terminar outras
          </div>
        </div>
      </Section>

      {/* ── Notifications ── */}
      <Section T={T} title="Notificações" style={{ marginBottom: 18 }}>
        <Toggle T={T} val={Boolean(settings.notificationsEnabled)}
          onToggle={() => saveSetting({ notificationsEnabled: !settings.notificationsEnabled })}
          label="Notificações na app" sub="Alertas de orçamento, objetivos e despesas invulgares" />
        <Toggle T={T} val={Boolean(settings.emailNotifications)}
          onToggle={() => saveSetting({ emailNotifications: !settings.emailNotifications })}
          label="Notificações por email" sub="Resumos semanais e alertas importantes" />
      </Section>

      {/* ── Appearance ── */}
      <Section T={T} title="Aparência" style={{ marginBottom: 18 }}>
        <Toggle T={T} val={dark}
          onToggle={() => {
            const value = !dark;
            saveSetting({ darkMode: value }).then(() => setDark(value));
          }}
          label="Modo escuro" sub="Interface com fundo escuro" />
      </Section>

      {/* ── Data management ── */}
      <Section T={T} title="Gestão de dados">
        <div className="fp-btn" onClick={() => toast("info", "Os teus dados foram exportados. Verifica o teu email.")}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Exportar dados</div>
            <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>Download completo em formato JSON</div>
          </div>
          <Download size={14} color={T.sub} />
        </div>
        <div className="fp-btn" onClick={onLogout}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Terminar sessão</div>
          <LogOut size={14} color={T.sub} />
        </div>
        <div className="fp-btn" onClick={() => toast("error", "Funcionalidade disponível na versão Enterprise.")}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.danger }}>Eliminar conta</div>
            <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>Ação irreversível — todos os dados serão apagados</div>
          </div>
          <Trash2 size={14} color={T.danger} />
        </div>
      </Section>
    </div>
  );
}
