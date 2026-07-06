import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { formatCurrency, formatRoundedCurrency } from "../../shared/utils/currency";
import { Metric } from "../../shared/components/FinanceComponents";
import { api } from "../../api/api";

export default function SubscriptionsPage({ T, subs, setSubs, setModal, toast }) {
  const [tab, setTab] = useState("active");
  const active   = subs.filter(s => s.active);
  const inactive = subs.filter(s => !s.active);
  const shown    = tab === "active" ? active : inactive;
  const total    = active.reduce((a, s) => a + s.monthly, 0);
  const unused   = active.filter(s => !s.used);

  const restore = async id => {
    try {
      await api.subscriptions.setStatus(id, "active");
      setSubs(ss => ss.map(s => s.id === id ? { ...s, active: true, status: "active", used: true } : s));
      toast("success", "Subscrição reativada.");
    }
    catch (error) { toast("error", error.message); }
  };

  return (
    <div className="page">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        <Metric T={T} label="Total mensal" value={formatRoundedCurrency(total)} sub={`${active.length} subscrições ativas`} col={T.accent} />
        <Metric T={T} label="Total anual" value={formatRoundedCurrency(total * 12)} sub="estimado" col={T.accent2} />
        <Metric T={T} label="Poupança potencial" value={formatRoundedCurrency(unused.reduce((a, s) => a + s.monthly, 0))} sub={`${unused.length} pouco usadas`} col={T.warn} />
      </div>
      {unused.length > 0 && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: `${T.warn}12`, border: `1px solid ${T.warn}44`, marginBottom: 14, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
          <AlertTriangle size={15} color={T.warn} />
          <span>Tens <strong>{unused.length} subscrições pouco usadas</strong> — cancelá-las pouparia {formatRoundedCurrency(unused.reduce((a, s) => a + s.monthly * 12, 0))}/ano.</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[["active", "Ativas"], ["inactive", "Canceladas"]].map(([v, l]) => (
            <div key={v} className="fp-btn" onClick={() => setTab(v)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, background: tab === v ? T.accent : T.panel2, color: tab === v ? "#0A0D12" : T.sub, border: `1px solid ${tab === v ? T.accent : T.border}`, transition: "all .18s" }}>{l}</div>
          ))}
        </div>
        <div className="fp-btn" onClick={() => setModal({ type: "addSub" })} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: T.accent, color: "#0A0D12", fontSize: 12.5, fontWeight: 600 }}><Plus size={13} />Adicionar</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {shown.length === 0 && <div style={{ padding: 32, textAlign: "center", color: T.sub, fontSize: 13 }}>{tab === "active" ? "Sem subscrições ativas." : "Sem subscrições canceladas."}</div>}
        {shown.map((s, i) => (
          <div key={s.id} className="fp-card stagger" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: "13px 16px", animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={16} color={s.color} /></div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</span>
                  {!s.used && s.active && <span style={{ fontSize: 10, fontWeight: 600, color: T.warn, background: `${T.warn}18`, padding: "2px 7px", borderRadius: 5 }}>Pouco usada</span>}
                  {!s.active && <span style={{ fontSize: 10, fontWeight: 600, color: T.sub, background: T.border, padding: "2px 7px", borderRadius: 5 }}>Cancelada</span>}
                </div>
                <div style={{ fontSize: 11, color: T.sub }}>Próxima cobrança: {s.next}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ textAlign: "right" }}>
                <div className="fp-num" style={{ fontSize: 13.5, fontWeight: 600 }}>{formatCurrency(s.monthly)}<span style={{ color: T.sub, fontWeight: 400, fontSize: 11 }}>/mês</span></div>
                <div style={{ fontSize: 10.5, color: T.sub }}>{formatRoundedCurrency(s.monthly * 12)}/ano</div>
              </div>
              {s.active
                ? <div className="fp-btn" onClick={() => setModal({ type: "cancelSub", data: s })} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.danger}55`, color: T.danger, fontSize: 12, fontWeight: 500 }}>Cancelar</div>
                : <div className="fp-btn" onClick={() => restore(s.id)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.accent}55`, color: T.accent, fontSize: 12, fontWeight: 500 }}>Reativar</div>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
