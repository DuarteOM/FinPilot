import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { formatRoundedCurrency } from "../../../shared/utils/currency";

export default function GoalCard({ g, T, delay, onDelete, onContribute }) {
  const [w, setW] = useState(0);
  const pct  = Math.round(g.saved / g.target * 100);
  const R    = 42;
  const circ = 2 * Math.PI * R;
  useEffect(() => { const t = setTimeout(() => setW(pct), 130); return () => clearTimeout(t); }, [pct]);

  return (
    <div className="fp-card stagger" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, animationDelay: `${delay}s` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `${g.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><g.icon size={16} color={g.color} /></div>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</div><div style={{ fontSize: 11, color: T.sub }}>Meta: {g.eta}</div></div>
        </div>
        <div className="fp-btn" onClick={onDelete}><Trash2 size={13} color={T.mut} /></div>
      </div>
      <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 12px" }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="48" cy="48" r={R} fill="none" stroke={T.border} strokeWidth="8" />
          <circle cx="48" cy="48" r={R} fill="none" stroke={g.color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - w / 100)}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)" }} />
        </svg>
        <div className="fp-num" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600 }}>{pct}%</div>
      </div>
      <div className="fp-num" style={{ textAlign: "center", fontSize: 12.5, marginBottom: 12 }}>{formatRoundedCurrency(g.saved)} <span style={{ color: T.sub }}>de {formatRoundedCurrency(g.target)}</span></div>
      <div style={{ paddingTop: 10, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", fontSize: 11, color: T.sub, marginBottom: 8 }}>
        <span>Mensal</span><span className="fp-num" style={{ color: T.text, fontWeight: 500 }}>{formatRoundedCurrency(g.monthly)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.sub, marginBottom: 12 }}>
        <span>Probabilidade</span><span className="fp-num" style={{ color: T.accent, fontWeight: 500 }}>{g.prob}%</span>
      </div>
      <div className="fp-btn" onClick={onContribute} style={{ textAlign: "center", padding: "8px", borderRadius: 9, background: `${g.color}22`, color: g.color, fontSize: 12.5, fontWeight: 600 }}>+ Contribuir</div>
    </div>
  );
}
