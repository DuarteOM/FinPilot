import { useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { formatRoundedCurrency } from "../../../shared/utils/currency";

export default function BudgetCard({ b, T, pct, over, barC, delay, onEdit, onDelete }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 120); return () => clearTimeout(t); }, [pct]);

  return (
    <div className="fp-card stagger" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: "15px 16px", animationDelay: `${delay}s` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `${b.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><b.icon size={14} color={b.color} /></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
            <div className="fp-num" style={{ fontSize: 11, color: T.sub }}>{formatRoundedCurrency(b.spent)} / {formatRoundedCurrency(b.limit)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {over && <span className="pop" style={{ fontSize: 10, fontWeight: 600, color: T.danger, background: `${T.danger}18`, padding: "2px 7px", borderRadius: 5 }}>Excedido</span>}
          <div className="fp-btn" onClick={onEdit}><Edit2 size={13} color={T.mut} /></div>
          <div className="fp-btn" onClick={onDelete}><Trash2 size={13} color={T.mut} /></div>
        </div>
      </div>
      <div style={{ height: 6, background: T.border, borderRadius: 5, overflow: "hidden" }}>
        <div className="fp-fill" style={{ width: `${w}%`, height: "100%", background: barC, borderRadius: 5 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.sub }}>
        <span>{pct}% usado</span>
        <span>{over ? `${formatRoundedCurrency(b.spent - b.limit)} acima` : `${formatRoundedCurrency(b.limit - b.spent)} restante`}</span>
      </div>
    </div>
  );
}
