import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { CATS, TREND } from "../../shared/utils/mockData";
import { formatCurrency, formatRoundedCurrency } from "../../shared/utils/currency";
import { Leg, MiniGoal } from "../../shared/components/FinanceComponents";

export default function DashboardPage({ T, goals, subs, txs, setView }) {
  const totalCat = CATS.reduce((s, c) => s + c.value, 0);
  const income = 2650, expense = 1860, balance = 12480;
  const sr = Math.round(((income - expense) / income) * 100);

  return (
    <div className="page">
      {/* ── Top stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="fp-card" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 6 }}>Saldo total</div>
          <div className="fp-num" style={{ fontSize: 34, fontWeight: 600, marginBottom: 10 }}>{formatRoundedCurrency(balance)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.accent }}><ArrowUpRight size={13} />+6,4% face ao mês anterior</div>
          <div style={{ height: 52, marginTop: 14, marginLeft: -6, marginRight: -6 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND}>
                <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={0.35} /><stop offset="100%" stopColor={T.accent} stopOpacity={0} /></linearGradient></defs>
                <Area type="monotone" dataKey="income" stroke={T.accent} strokeWidth={2} fill="url(#hg)" isAnimationActive animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="fp-card" onClick={() => setView("transactions")} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px", cursor: "pointer" }}>
          <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>Receitas (Jul)<ArrowUpRight size={13} color={T.mut} /></div>
          <div className="fp-num" style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{formatRoundedCurrency(income)}</div>
          <div style={{ fontSize: 11.5, color: T.accent, display: "flex", alignItems: "center", gap: 4 }}><TrendingUp size={12} />+10% vs mês anterior</div>
        </div>
        <div className="fp-card" onClick={() => setView("transactions")} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px", cursor: "pointer" }}>
          <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>Despesas (Jul)<ArrowDownRight size={13} color={T.mut} /></div>
          <div className="fp-num" style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{formatRoundedCurrency(expense)}</div>
          <div style={{ fontSize: 11.5, color: "#D4537E", display: "flex", alignItems: "center", gap: 4 }}><TrendingDown size={12} />-7% vs mês anterior</div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="fp-card" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Fluxo de caixa</div>
            <div style={{ fontSize: 11.5, color: T.sub }}>Poupança {sr}%</div>
          </div>
          <div style={{ height: 155 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: T.mut }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: T.border, strokeDasharray: "4 4", strokeWidth: 1 }}
                  contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text, boxShadow: "0 8px 18px rgba(0,0,0,.12)" }}
                  wrapperStyle={{ outline: "none" }}
                  formatter={v => formatRoundedCurrency(v)}
                />
                <Line type="monotone" dataKey="income" stroke={T.accent} strokeWidth={2} dot={false} isAnimationActive animationDuration={900} />
                <Line type="monotone" dataKey="expense" stroke={T.accent2} strokeWidth={2} dot={false} isAnimationActive animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: T.sub }}>
            <Leg dot={T.accent} label="Receitas" /><Leg dot={T.accent2} label="Despesas" />
          </div>
        </div>
        <div className="fp-card" onClick={() => setView("budgets")} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Despesas por categoria</div>
            <ChevronRight size={14} color={T.mut} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 108, height: 108, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={CATS} dataKey="value" innerRadius={32} outerRadius={50} paddingAngle={3} stroke="none" isAnimationActive animationDuration={800}>
                  {CATS.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              {CATS.map(c => (
                <div key={c.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.sub }}><span style={{ width: 7, height: 7, borderRadius: 2, background: c.color }} />{c.name}</div>
                  <span className="fp-num" style={{ fontWeight: 500 }}>{Math.round(c.value / totalCat * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <div className="fp-card" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Transações recentes</div>
            <div className="fp-btn" onClick={() => setView("transactions")} style={{ fontSize: 11.5, color: T.accent, display: "flex", alignItems: "center", gap: 3 }}>Ver todas<ChevronRight size={12} /></div>
          </div>
          {txs.slice(0, 5).map((t, i) => (
            <div key={t.id} className="fp-row stagger" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 6px", borderRadius: 9, borderBottom: i < 4 ? `1px solid ${T.border}` : "none", animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, background: `${t.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><t.icon size={13} color={t.color} /></div>
                <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{t.merchant}</div><div style={{ fontSize: 10.5, color: T.sub }}>{t.cat} · {t.ds}</div></div>
              </div>
              <span className="fp-num" style={{ fontSize: 12.5, fontWeight: 600, color: t.amount > 0 ? T.accent : T.text }}>{t.amount > 0 ? "+" : "-"}{formatCurrency(t.amount)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="fp-card" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Objetivos</div>
              <div className="fp-btn" onClick={() => setView("goals")} style={{ fontSize: 11.5, color: T.accent, display: "flex", alignItems: "center", gap: 3 }}>Ver<ChevronRight size={12} /></div>
            </div>
            {goals.slice(0, 2).map(g => <MiniGoal key={g.id} g={g} T={T} />)}
          </div>
          <div className="fp-card" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Subscrições</div>
              <div className="fp-btn" onClick={() => setView("subscriptions")} style={{ fontSize: 11.5, color: T.accent, display: "flex", alignItems: "center", gap: 3 }}>{formatRoundedCurrency(subs.filter(s => s.active).reduce((a, s) => a + s.monthly, 0))}/mês<ChevronRight size={12} /></div>
            </div>
            {subs.filter(s => s.active).slice(0, 4).map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "4px 0", color: T.sub }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />{s.name}</span>
                <span className="fp-num">{formatCurrency(s.monthly)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
