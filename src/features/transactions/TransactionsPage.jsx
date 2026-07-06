import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Filter, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { formatCurrency, formatRoundedCurrency } from "../../shared/utils/currency";
import { hydrateTransaction } from "../../shared/utils/entities";
import { Metric } from "../../shared/components/FinanceComponents";
import { api } from "../../api/api";

const DEFAULT_FILTERS = {
  search: "",
  type: "all",
  category: "all",
  account: "all",
  period: "all",
  dateFrom: "",
  dateTo: "",
  status: "all",
  paymentMethod: "all",
  sort: "newest",
};

const TYPE_OPTIONS = [
  ["all", "Todas"],
  ["income", "Receitas"],
  ["expense", "Despesas"],
  ["transfer", "Transferências"],
];

const PERIOD_OPTIONS = [
  ["all", "Todo o período"],
  ["today", "Hoje"],
  ["yesterday", "Ontem"],
  ["last7", "Últimos 7 dias"],
  ["last30", "Últimos 30 dias"],
  ["thisMonth", "Este mês"],
  ["lastMonth", "Mês passado"],
  ["thisYear", "Este ano"],
  ["custom", "Personalizado"],
];

const STATUS_OPTIONS = [
  ["all", "Todos"],
  ["pending", "Pendente"],
  ["completed", "Concluída"],
  ["cancelled", "Cancelada"],
];

const SORT_OPTIONS = [
  ["newest", "Mais recentes"],
  ["oldest", "Mais antigas"],
  ["amountAsc", "Valor ↑"],
  ["amountDesc", "Valor ↓"],
  ["az", "A-Z"],
];

const todayISO = date => date.toISOString().slice(0, 10);

function periodRange(period) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (period === "today") return { dateFrom: todayISO(now), dateTo: todayISO(now) };
  if (period === "yesterday") {
    start.setDate(now.getDate() - 1);
    return { dateFrom: todayISO(start), dateTo: todayISO(start) };
  }
  if (period === "last7") {
    start.setDate(now.getDate() - 6);
    return { dateFrom: todayISO(start), dateTo: todayISO(end) };
  }
  if (period === "last30") {
    start.setDate(now.getDate() - 29);
    return { dateFrom: todayISO(start), dateTo: todayISO(end) };
  }
  if (period === "thisMonth") {
    return {
      dateFrom: todayISO(new Date(now.getFullYear(), now.getMonth(), 1)),
      dateTo: todayISO(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (period === "lastMonth") {
    return {
      dateFrom: todayISO(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      dateTo: todayISO(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  if (period === "thisYear") {
    return {
      dateFrom: todayISO(new Date(now.getFullYear(), 0, 1)),
      dateTo: todayISO(new Date(now.getFullYear(), 11, 31)),
    };
  }
  return {};
}

function initialFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    Object.entries(DEFAULT_FILTERS).map(([key, value]) => [key, params.get(key) ?? value])
  );
}

function SelectFilter({ T, label, value, options, onChange }) {
  return (
    <label className="tx-filter-control">
      <span>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ background: T.panel2, color: T.text, borderColor: T.border }}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

export default function TransactionsPage({ T, txs, setTxs, setModal, toast }) {
  const [filters, setFilters] = useState(initialFiltersFromUrl);
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [expanded, setExpanded] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(current => ({ ...current, search: searchDraft.trim() }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  useEffect(() => {
    Promise.all([
      api.categories.list(),
      api.accounts.list(),
      api.transactions.paymentMethods(),
    ])
      .then(([catRes, accountRes, methodRes]) => {
        setCategories(catRes.categories ?? []);
        setAccounts(accountRes.accounts ?? []);
        setMethods(methodRes.methods ?? []);
      })
      .catch(error => toast("error", error.message));
  }, [toast]);

  useEffect(() => {
    const range = filters.period === "custom"
      ? { dateFrom: filters.dateFrom, dateTo: filters.dateTo }
      : periodRange(filters.period);

    const query = {
      search: filters.search,
      type: filters.type !== "all" ? filters.type : "",
      category: filters.category !== "all" ? filters.category : "",
      account: filters.account !== "all" ? filters.account : "",
      paymentMethod: filters.paymentMethod !== "all" ? filters.paymentMethod : "",
      status: filters.status !== "all" ? filters.status : "",
      sort: filters.sort,
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      limit: 100,
      offset: 0,
    };

    const urlParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key]) urlParams.set(key, value);
    });
    const nextUrl = `${window.location.pathname}${urlParams.size ? `?${urlParams}` : ""}`;
    window.history.replaceState(null, "", nextUrl);

    api.transactions.list(query)
      .then(result => setTxs((result.transactions ?? []).map(hydrateTransaction)))
      .catch(error => toast("error", error.message));
  }, [filters, setTxs, toast]);

  const setFilter = (key, value) => {
    setFilters(current => {
      const next = { ...current, [key]: value };
      if (key === "period" && value !== "custom") {
        next.dateFrom = "";
        next.dateTo = "";
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSearchDraft("");
    setFilters(DEFAULT_FILTERS);
  };

  const categoryOptions = useMemo(() => [
    ["all", "Todas as categorias"],
    ...categories.map(c => [String(c.id), c.name]),
  ], [categories]);

  const accountOptions = useMemo(() => [
    ["all", "Todas as contas"],
    ...accounts.map(a => [String(a.id), a.name]),
  ], [accounts]);

  const methodOptions = useMemo(() => [
    ["all", "Todos os métodos"],
    ["none", "Sem método"],
    ...methods.map(m => [String(m.id), m.name]),
  ], [methods]);

  const activeChips = useMemo(() => {
    const findLabel = (options, value) => options.find(([v]) => v === value)?.[1] ?? value;
    const chips = [];
    if (filters.search) chips.push(["search", `Pesquisa: ${filters.search}`]);
    if (filters.type !== "all") chips.push(["type", findLabel(TYPE_OPTIONS, filters.type)]);
    if (filters.category !== "all") chips.push(["category", findLabel(categoryOptions, filters.category)]);
    if (filters.account !== "all") chips.push(["account", findLabel(accountOptions, filters.account)]);
    if (filters.period !== "all") chips.push(["period", findLabel(PERIOD_OPTIONS, filters.period)]);
    if (filters.status !== "all") chips.push(["status", findLabel(STATUS_OPTIONS, filters.status)]);
    if (filters.paymentMethod !== "all") chips.push(["paymentMethod", findLabel(methodOptions, filters.paymentMethod)]);
    if (filters.sort !== "newest") chips.push(["sort", `Ordenar: ${findLabel(SORT_OPTIONS, filters.sort)}`]);
    return chips;
  }, [accountOptions, categoryOptions, filters, methodOptions]);

  const clearChip = key => {
    if (key === "search") setSearchDraft("");
    setFilters(current => ({ ...current, [key]: DEFAULT_FILTERS[key] }));
  };

  const renderFilterControls = () => (
    <>
      <SelectFilter T={T} label="Tipo" value={filters.type} options={TYPE_OPTIONS} onChange={v => setFilter("type", v)} />
      <SelectFilter T={T} label="Categoria" value={filters.category} options={categoryOptions} onChange={v => setFilter("category", v)} />
      <SelectFilter T={T} label="Conta" value={filters.account} options={accountOptions} onChange={v => setFilter("account", v)} />
      <SelectFilter T={T} label="Período" value={filters.period} options={PERIOD_OPTIONS} onChange={v => setFilter("period", v)} />
      <SelectFilter T={T} label="Estado" value={filters.status} options={STATUS_OPTIONS} onChange={v => setFilter("status", v)} />
      <SelectFilter T={T} label="Método" value={filters.paymentMethod} options={methodOptions} onChange={v => setFilter("paymentMethod", v)} />
      <SelectFilter T={T} label="Ordenar" value={filters.sort} options={SORT_OPTIONS} onChange={v => setFilter("sort", v)} />
      {filters.period === "custom" && (
        <>
          <label className="tx-filter-control">
            <span>De</span>
            <input type="date" value={filters.dateFrom} onChange={e => setFilter("dateFrom", e.target.value)} style={{ background: T.panel2, color: T.text, borderColor: T.border }} />
          </label>
          <label className="tx-filter-control">
            <span>Até</span>
            <input type="date" value={filters.dateTo} onChange={e => setFilter("dateTo", e.target.value)} style={{ background: T.panel2, color: T.text, borderColor: T.border }} />
          </label>
        </>
      )}
    </>
  );

  const delTx = async id => {
    try {
      await api.transactions.remove(id);
      setTxs(ts => ts.filter(t => t.id !== id));
      toast("info", "Transação eliminada.");
    } catch (error) { toast("error", error.message); }
  };

  return (
    <div className="page">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        <Metric T={T} label="Receitas este mês" value={formatRoundedCurrency(txs.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0))} sub={`${txs.filter(t => t.amount > 0).length} entradas`} col={T.accent} />
        <Metric T={T} label="Despesas este mês" value={formatRoundedCurrency(Math.abs(txs.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0)))} sub={`${txs.filter(t => t.amount < 0).length} saídas`} col="#D4537E" />
        <Metric T={T} label="Saldo líquido" value={formatRoundedCurrency(txs.reduce((a, t) => a + t.amount, 0))} sub="transações filtradas" col={T.accent2} />
      </div>

      <div className="tx-filter-shell" style={{ background: T.panel, borderColor: T.border, boxShadow: "0 10px 28px rgba(0,0,0,.14)" }}>
        <div className="tx-search-row">
          <div className="tx-search" style={{ background: T.panel2, borderColor: T.border, color: T.text }}>
            <Search size={15} color={T.mut} />
            <input
              value={searchDraft}
              onChange={e => setSearchDraft(e.target.value)}
              placeholder="Pesquisar transações..."
              style={{ color: T.text }}
            />
          </div>
          <button className="tx-mobile-filter fp-btn" onClick={() => setDrawerOpen(true)} style={{ borderColor: T.border, color: T.text, background: T.panel2 }}>
            <SlidersHorizontal size={15} />Filtros
          </button>
        </div>

        <div className="tx-filter-row">
          <div className="tx-filter-grid">{renderFilterControls()}</div>
          <button className="tx-new-btn fp-btn" onClick={() => setModal({ type: "addTransaction" })} style={{ background: T.accent, color: "#0A0D12" }}>
            <Plus size={14} />Nova transação
          </button>
        </div>

        {activeChips.length > 0 && (
          <div className="tx-chip-row">
            {activeChips.map(([key, label]) => (
              <button key={`${key}-${label}`} className="tx-chip fp-btn" onClick={() => clearChip(key)} style={{ background: T.panel2, borderColor: T.border, color: T.text }}>
                {label}<X size={12} />
              </button>
            ))}
            <button className="tx-clear fp-btn" onClick={resetFilters} style={{ color: T.accent }}>Limpar filtros</button>
          </div>
        )}
      </div>

      {drawerOpen && (
        <div className="tx-drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="tx-drawer" onClick={e => e.stopPropagation()} style={{ background: T.panel, borderColor: T.border }}>
            <div className="tx-drawer-head">
              <div><Filter size={16} />Filtros</div>
              <button className="fp-btn" onClick={() => setDrawerOpen(false)}><X size={17} color={T.sub} /></button>
            </div>
            <div className="tx-drawer-controls">{renderFilterControls()}</div>
            <button className="tx-new-btn fp-btn" onClick={() => { setDrawerOpen(false); setModal({ type: "addTransaction" }); }} style={{ background: T.accent, color: "#0A0D12", width: "100%", justifyContent: "center" }}>
              <Plus size={14} />Nova transação
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        {txs.length === 0 && <div style={{ padding: 32, textAlign: "center", color: T.sub, fontSize: 13 }}>Sem transações para os filtros selecionados.</div>}
        {txs.map((t, i) => (
          <div key={t.id} className="fp-card stagger" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", animationDelay: `${i * 0.04}s` }}>
            <div className="fp-row" onClick={() => setExpanded(expanded === t.id ? null : t.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${t.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><t.icon size={15} color={t.color} /></div>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{t.merchant}</div><div style={{ fontSize: 11, color: T.sub }}>{t.cat} · {t.accountName ?? "Conta"} · {t.ds}</div></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="fp-num" style={{ fontSize: 13.5, fontWeight: 600, color: t.amount > 0 ? T.accent : T.text }}>{t.amount > 0 ? "+" : "-"}{formatCurrency(t.amount)}</span>
                <ChevronRight size={14} color={T.mut} style={{ transform: expanded === t.id ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s" }} />
              </div>
            </div>
            {expanded === t.id && (
              <div style={{ padding: "12px 16px 14px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div><div style={{ fontSize: 10.5, color: T.sub, marginBottom: 2 }}>Data</div><div style={{ fontSize: 12, fontWeight: 500 }}>{t.ds}</div></div>
                  <div><div style={{ fontSize: 10.5, color: T.sub, marginBottom: 2 }}>Categoria</div><div style={{ fontSize: 12, fontWeight: 500 }}>{t.cat}</div></div>
                  <div><div style={{ fontSize: 10.5, color: T.sub, marginBottom: 2 }}>Estado</div><div style={{ fontSize: 12, fontWeight: 500 }}>{STATUS_OPTIONS.find(([v]) => v === t.status)?.[1] ?? t.status}</div></div>
                  <div><div style={{ fontSize: 10.5, color: T.sub, marginBottom: 2 }}>Referência</div><div className="fp-num" style={{ fontSize: 12 }}>#{String(t.id).padStart(6, "0")}</div></div>
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
