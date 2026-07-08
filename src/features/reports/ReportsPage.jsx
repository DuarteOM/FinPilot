import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { CATS, REPORT_DATA } from "../../shared/utils/mockData";
import { formatCurrency, formatRoundedCurrency } from "../../shared/utils/currency";
import { Leg, Metric } from "../../shared/components/FinanceComponents";
import { api } from "../../api/api";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function ReportsPage({ T, toast }) {
  const [period,     setPeriod]     = useState("month");
  const [reportData, setReportData] = useState(REPORT_DATA);
  const [categories, setCategories] = useState(CATS);

  useEffect(() => {
    const months = { month: 1, quarter: 3, year: 12 }[period];
    api.reports.get(months)
      .then(result => {
        if (result.trend.length) setReportData(result.trend.map(item => ({ ...item, m: new Intl.DateTimeFormat("pt-PT", { month: "short" }).format(new Date(`${item.month}-01`)), expense: item.expenses })));
        if (result.categories.length) setCategories(result.categories.map((item, index) => ({ ...item, color: CATS[index % CATS.length].color })));
      })
      .catch(error => toast("error", error.message));
  }, [period, toast]);

  const totalIncome = reportData.reduce((a, d) => a + d.income, 0);
  const totalExp    = reportData.reduce((a, d) => a + d.expense, 0);
  const totalSaved  = reportData.reduce((a, d) => a + d.saved, 0);
  const best        = reportData.reduce((a, b) => b.saved > a.saved ? b : a, reportData[0] || { m: "—", saved: 0 });

  const periodLabel = { month: "Este mes", quarter: "Ultimos 3 meses", year: "Este ano" }[period];

  const exportPdf = () => {
    const reportWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!reportWindow) {
      toast("error", "Permite pop-ups para exportar o PDF.");
      return;
    }

    const trendRows = reportData.map(item => `
      <tr>
        <td>${escapeHtml(item.m)}</td>
        <td>${escapeHtml(formatCurrency(item.income))}</td>
        <td>${escapeHtml(formatCurrency(item.expense))}</td>
        <td>${escapeHtml(formatCurrency(item.saved))}</td>
      </tr>
    `).join("");
    const categoryRows = categories.map(item => `
      <tr>
        <td><span class="dot" style="background:${escapeHtml(item.color)}"></span>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(formatCurrency(item.value))}</td>
      </tr>
    `).join("");

    reportWindow.document.write(`
      <!doctype html>
      <html lang="pt">
        <head>
          <meta charset="utf-8" />
          <title>FinPilot - Relatorio financeiro</title>
          <style>
            @page { margin: 18mm; }
            * { box-sizing: border-box; }
            body { margin: 0; color: #111827; font-family: Inter, Arial, sans-serif; font-size: 12px; }
            header { border-bottom: 1px solid #d7dde8; padding-bottom: 14px; margin-bottom: 18px; }
            h1 { margin: 0 0 4px; font-size: 24px; }
            h2 { margin: 24px 0 10px; font-size: 15px; }
            .muted { color: #667085; }
            .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
            .metric { border: 1px solid #d7dde8; padding: 12px; border-radius: 8px; }
            .metric span { display: block; color: #667085; margin-bottom: 6px; }
            .metric strong { display: block; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px solid #e6eaf0; padding: 9px 8px; text-align: left; }
            th { background: #f5f7fa; color: #344054; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
            .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
            .footer { margin-top: 24px; color: #667085; font-size: 10px; }
          </style>
        </head>
        <body>
          <header>
            <h1>Relatorio financeiro FinPilot</h1>
            <div class="muted">${escapeHtml(periodLabel)} - ${escapeHtml(new Date().toLocaleDateString("pt-PT"))}</div>
          </header>
          <section class="metrics">
            <div class="metric"><span>Receitas totais</span><strong>${escapeHtml(formatCurrency(totalIncome))}</strong></div>
            <div class="metric"><span>Despesas totais</span><strong>${escapeHtml(formatCurrency(totalExp))}</strong></div>
            <div class="metric"><span>Total poupado</span><strong>${escapeHtml(formatCurrency(totalSaved))}</strong></div>
          </section>
          <h2>Receitas, despesas e poupanca</h2>
          <table>
            <thead><tr><th>Periodo</th><th>Receitas</th><th>Despesas</th><th>Poupanca</th></tr></thead>
            <tbody>${trendRows}</tbody>
          </table>
          <h2>Despesa por categoria</h2>
          <table>
            <thead><tr><th>Categoria</th><th>Valor</th></tr></thead>
            <tbody>${categoryRows}</tbody>
          </table>
          <div class="footer">Exportado pelo FinPilot.</div>
          <script>window.addEventListener("load", () => window.print());</script>
        </body>
      </html>
    `);
    reportWindow.document.close();
    toast("success", "Relatorio pronto para guardar como PDF.");
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[["month", "Este mês"], ["quarter", "Últimos 3 meses"], ["year", "Este ano"]].map(([v, l]) => (
            <div key={v} className="fp-btn" onClick={() => setPeriod(v)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, background: period === v ? T.accent : T.panel2, color: period === v ? "#0A0D12" : T.sub, border: `1px solid ${period === v ? T.accent : T.border}`, transition: "all .18s" }}>{l}</div>
          ))}
        </div>
        <div className="fp-btn" onClick={exportPdf} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.border}`, color: T.sub, fontSize: 12.5 }}>
          <Download size={13} />Exportar PDF
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        <Metric T={T} label="Receitas totais" value={formatRoundedCurrency(totalIncome)} sub="período selecionado" col={T.accent} />
        <Metric T={T} label="Despesas totais" value={formatRoundedCurrency(totalExp)} sub="período selecionado" col="#D4537E" />
        <Metric T={T} label="Total poupado" value={formatRoundedCurrency(totalSaved)} sub={`Melhor mês: ${best.m} (${formatRoundedCurrency(best.saved)})`} col={T.accent2} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="fp-card" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Receitas vs Despesas</div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} barGap={4}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: T.mut }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: `${T.border}20` }}
                  contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text, boxShadow: "0 8px 18px rgba(0,0,0,.12)" }}
                  wrapperStyle={{ outline: "none" }}
                  formatter={v => formatRoundedCurrency(v)}
                />
                <Bar dataKey="income"  fill={T.accent}  radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
                <Bar dataKey="expense" fill={T.accent2} radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: T.sub }}><Leg dot={T.accent} label="Receitas" /><Leg dot={T.accent2} label="Despesas" /></div>
        </div>
        <div className="fp-card" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Poupança mensal</div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData}>
                <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={0.4} /><stop offset="100%" stopColor={T.accent} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: T.mut }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: T.border, strokeDasharray: "4 4", strokeWidth: 1 }}
                  contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text, boxShadow: "0 8px 18px rgba(0,0,0,.12)" }}
                  wrapperStyle={{ outline: "none" }}
                  formatter={v => formatRoundedCurrency(v)}
                />
                <Area type="monotone" dataKey="saved" stroke={T.accent} strokeWidth={2} fill="url(#sg)" isAnimationActive animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="fp-card" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Despesa por categoria</div>
        <div style={{ height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11.5, fill: T.sub }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                cursor={{ fill: `${T.border}20` }}
                contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text, boxShadow: "0 8px 18px rgba(0,0,0,.12)" }}
                itemStyle={{ color: T.text }}
                labelStyle={{ color: T.sub }}
                formatter={v => formatCurrency(v)}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={800}>
                {categories.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
