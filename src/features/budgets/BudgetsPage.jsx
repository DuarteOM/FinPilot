import { Plus } from "lucide-react";
import { formatRoundedCurrency } from "../../shared/utils/currency";
import { Metric } from "../../shared/components/FinanceComponents";
import { api } from "../../api/api";
import BudgetCard from "./components/BudgetCard";

export default function BudgetsPage({ T, budgets, setBudgets, setModal, toast }) {
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  const del = async id => {
    try { await api.budgets.remove(id); setBudgets(bs => bs.filter(b => b.id !== id)); toast("info", "Orçamento eliminado."); }
    catch (error) { toast("error", error.message); }
  };

  return (
    <div className="page">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        <Metric T={T} label="Orçamentado" value={formatRoundedCurrency(totalLimit)} sub={`${budgets.length} categorias`} col={T.accent2} />
        <Metric T={T} label="Gasto" value={formatRoundedCurrency(totalSpent)} sub={`${Math.round(totalSpent / totalLimit * 100)}% utilizado`} col={T.warn} />
        <Metric T={T} label="Restante" value={formatRoundedCurrency(Math.max(totalLimit - totalSpent, 0))} sub="até fim do mês" col={T.accent} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Categorias</div>
        <div className="fp-btn" onClick={() => setModal({ type: "addBudget" })} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: T.accent, color: "#0A0D12", fontSize: 12.5, fontWeight: 600 }}>
          <Plus size={13} />Novo orçamento
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {budgets.map((b, i) => {
          const pct  = Math.min(Math.round(b.spent / b.limit * 100), 100);
          const over = b.spent > b.limit;
          const warn = pct >= 85 && !over;
          const barC = over ? T.danger : warn ? T.warn : b.color;
          return <BudgetCard key={b.id} b={b} T={T} pct={pct} over={over} barC={barC} delay={i * 0.06} onEdit={() => setModal({ type: "editBudget", data: b })} onDelete={() => del(b.id)} />;
        })}
      </div>
    </div>
  );
}
