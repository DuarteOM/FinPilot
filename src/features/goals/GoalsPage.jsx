import { Plus } from "lucide-react";
import { formatRoundedCurrency } from "../../shared/utils/currency";
import { Metric } from "../../shared/components/FinanceComponents";
import { api } from "../../api/api";
import GoalCard from "./components/GoalCard";

export default function GoalsPage({ T, goals, setGoals, setModal, toast }) {
  const del = async id => {
    try { await api.goals.remove(id); setGoals(gs => gs.filter(g => g.id !== id)); toast("info", "Objetivo eliminado."); }
    catch (error) { toast("error", error.message); }
  };

  return (
    <div className="page">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        <Metric T={T} label="Total em poupança" value={formatRoundedCurrency(goals.reduce((a, g) => a + g.saved, 0))} sub={`${goals.length} objetivos`} col={T.accent} />
        <Metric T={T} label="Contribuição mensal" value={formatRoundedCurrency(goals.reduce((a, g) => a + g.monthly, 0))} sub="total comprometido" col={T.accent2} />
        <Metric T={T} label="Poupança necessária" value={formatRoundedCurrency(goals.reduce((a, g) => a + (g.target - g.saved), 0))} sub="para atingir objetivos" col={T.warn} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {goals.map((g, i) => (
          <GoalCard key={g.id} g={g} T={T} delay={i * 0.07} onDelete={() => del(g.id)} onContribute={() => setModal({ type: "contributeGoal", data: g })} />
        ))}
        <div className="fp-card stagger" onClick={() => setModal({ type: "addGoal" })}
          style={{ border: `1.5px dashed ${T.border}`, borderRadius: 16, minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", color: T.sub, animationDelay: `${goals.length * 0.07}s`, background: "transparent" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={16} /></div>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>Criar objetivo</div>
        </div>
      </div>
    </div>
  );
}
