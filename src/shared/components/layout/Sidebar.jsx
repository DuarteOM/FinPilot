import { BarChart2, CreditCard, LayoutDashboard, LogOut, Moon, Repeat, Settings, Sparkles, Sun, Target, Wallet } from "lucide-react";

const NAV = [
  { id: "dashboard",     label: "Dashboard",   icon: LayoutDashboard },
  { id: "transactions",  label: "Transações",  icon: CreditCard },
  { id: "budgets",       label: "Orçamentos",  icon: Wallet },
  { id: "goals",         label: "Objetivos",   icon: Target },
  { id: "subscriptions", label: "Subscrições", icon: Repeat },
  { id: "reports",       label: "Relatórios",  icon: BarChart2 },
  { id: "settings",      label: "Definições",  icon: Settings },
];

export default function Sidebar({ T, view, setView, dark, setDark, profile, txCount, onLogout }) {
  const initials = profile.name
    .split(" ").filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join("");

  return (
    <div style={{ width: 220, flexShrink: 0, padding: "24px 14px", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 24, background: T.panel }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={16} color="#0A0D12" />
        </div>
        <span className="fp-disp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 }}>FinPilot</span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {NAV.map(n => {
          const active = view === n.id;
          return (
            <div key={n.id} className="fp-nav" onClick={() => setView(n.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 500, color: active ? T.text : T.sub, background: active ? T.panel2 : "transparent", borderLeft: `2px solid ${active ? T.accent : "transparent"}` }}>
              <n.icon size={15} strokeWidth={2} />
              {n.label}
              {n.id === "transactions" && (
                <span style={{ marginLeft: "auto", fontSize: 10, background: `${T.accent}22`, color: T.accent, padding: "1px 6px", borderRadius: 5, fontWeight: 600 }}>
                  {txCount}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="fp-btn" onClick={() => setDark(d => !d)}
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.sub, padding: "7px 10px", borderRadius: 9, border: `1px solid ${T.border}` }}>
          {dark ? <Sun size={13} /> : <Moon size={13} />}
          {dark ? "Modo claro" : "Modo escuro"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#0A0D12", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.name.split(" ")[0]}</div>
            <div style={{ fontSize: 10.5, color: T.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.email}</div>
          </div>
          <div className="fp-btn" onClick={onLogout}><LogOut size={13} color={T.mut} /></div>
        </div>
      </div>
    </div>
  );
}
