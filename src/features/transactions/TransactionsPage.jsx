import { useMemo, useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { formatCurrency, formatRoundedCurrency } from "../../shared/utils/currency";
import { Metric } from "../../shared/components/FinanceComponents";
import { api } from "../../api/api";

export default function TransactionsPage({ T, txs, setTxs, setModal, toast }) {
  const [filter,    setFilter]    = useState("all");
  const [catFilter, setCatFilter] = useState("Todos");
  const [expanded,  setExpanded]  = useState(null);

  const filtered = useMemo(() => txs.filter(t => {
    if (filter === "income"  && t.amount <= 0) return false;
    if (filter === "expense" && t.amount >= 0) return false;
    if (catFilter !== "Todos" && t.cat !== catFilter) return false;
    return true;
  }), [txs, filter, catFilter]);

  const allCats = ["Todos", ...Array.from(new Set(txs.map(t => t.cat)))];

  const delTx = async id => {
    try { await api.transactions.remove(id); setTxs(ts => ts.filter(t => t.id !== id)); toast("info", "Transação eliminada."); }
    catch (error) { toast("error", error.message); }
  };

  return (
    <div className="page">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        <Metric T={T} label="Receitas este mês" value={formatRoundedCurrency(txs.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0))} sub={`${txs.filter(t => t.amount > 0).length} entradas`} col={T.accent} />
        <Metric T={T} label="Despesas este mês" value={formatRoundedCurrency(Math.abs(txs.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0)))} sub={`${txs.filter(t => t.amount < 0).length} saídas`} col="#D4537E" />
        <Metric T={T} label="Saldo líquido" value={formatRoundedCurrency(txs.reduce((a, t) => a + t.amount, 0))} sub="todas as transações" col={T.accent2} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[["all", "Todos"], ["income", "Receitas"], ["expense", "Despesas"]].map(([v, l]) => (
            <div key={v} className="fp-btn" onClick={() => setFilter(v)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, background: filter === v ? T.accent : T.panel2, color: filter === v ? "#0A0D12" : T.sub, border: `1px solid ${filter === v ? T.accent : T.border}`, transition: "all .18s" }}>{l}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, outline: "none" }}>
            {allCats.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="fp-btn" onClick={() => setModal({ type: "addTransaction" })} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: T.accent, color: "#0A0D12", fontSize: 12.5, fontWeight: 600 }}>
            <Plus size={13} />Nova transação
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: T.sub, fontSize: 13 }}>Sem transações para os filtros selecionados.</div>}
        {filtered.map((t, i) => (
          <div key={t.id} className="fp-card stagger" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", animationDelay: `${i * 0.04}s` }}>
            <div className="fp-row" onClick={() => setExpanded(expanded === t.id ? null : t.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${t.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><t.icon size={15} color={t.color} /></div>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{t.merchant}</div><div style={{ fontSize: 11, color: T.sub }}>{t.cat} · {t.ds}</div></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="fp-num" style={{ fontSize: 13.5, fontWeight: 600, color: t.amount > 0 ? T.accent : T.text }}>{t.amount > 0 ? "+" : "-"}{formatCurrency(t.amount)}</span>
                <ChevronRight size={14} color={T.mut} style={{ transform: expanded === t.id ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s" }} />
              </div>
            </div>
            {expanded === t.id && (
              <div style={{ padding: "12px 16px 14px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div><div style={{ fontSize: 10.5, color: T.sub, marginBottom: 2 }}>Data</div><div style={{ fontSize: 12, fontWeight: 500 }}>{t.ds}</div></div>
                  <div><div style={{ fontSize: 10.5, color: T.sub, marginBottom: 2 }}>Categoria</div><div style={{ fontSize: 12, fontWeight: 500 }}>{t.cat}</div></div>
                  <div><div style={{ fontSize: 10.5, color: T.sub, marginBottom: 2 }}>ID</div><div className="fp-num" style={{ fontSize: 12 }}>#{String(t.id).padStart(6, "0")}</div></div>
                </div>
                <div className="fp-btn" onClick={() => delTx(t.id)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.danger, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.danger}44` }}>
                  <Trash2 size={12} />Eliminar
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
