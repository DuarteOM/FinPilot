import { useEffect, useState } from "react";
import { Film, ShoppingBag, Target, Wallet, X } from "lucide-react";
import { COLORS } from "../../utils/mockData";
import { formatCurrency, formatRoundedCurrency } from "../../utils/currency";
import { api } from "../../../api/api";

// ─── Primitives ───────────────────────────────────────────────────────────────

function Overlay({ T, children }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
      <div className="scale-in" style={{ background: T.panel, borderRadius: 16, border: `1px solid ${T.border}`, padding: 24, width: 380, maxWidth: "92%", boxShadow: "0 16px 40px rgba(0,0,0,.3)", maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ T, title, onClose }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div className="fp-disp" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600 }}>{title}</div>
      <div className="fp-btn" onClick={onClose}><X size={16} color={T.sub} /></div>
    </div>
  );
}

function InputField({ T, label, placeholder, type = "text", value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>{label}</label>}
      <input value={value} onChange={onChange} placeholder={placeholder} type={type}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }} />
    </div>
  );
}

function Button({ T, label, onClick, color }) {
  return (
    <div className="fp-btn" onClick={onClick}
      style={{ padding: "11px", borderRadius: 9, background: color || T.accent, color: color ? "#fff" : "#0A0D12", fontSize: 13.5, fontWeight: 600, textAlign: "center", marginTop: 4 }}>
      {label}
    </div>
  );
}

function ColorPicker({ T, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 6 }}>Cor</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {COLORS.map(color => (
          <div key={color} className="fp-btn" onClick={() => onChange(color)}
            style={{ width: 24, height: 24, borderRadius: 6, background: color, border: `2px solid ${value === color ? T.text : "transparent"}` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Account selector ─────────────────────────────────────────────────────────

function AccountSelect({ T, value, onChange }) {
  const [accounts, setAccounts] = useState([]);
  useEffect(() => {
    api.accounts.list().then(r => setAccounts(r.accounts ?? [])).catch(() => {});
  }, []);

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Conta</label>
      <select value={value ?? ""} onChange={e => onChange(Number(e.target.value) || null)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }}>
        <option value="">Selecionar conta…</option>
        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
    </div>
  );
}

// ─── Category selector ────────────────────────────────────────────────────────

function CategorySelect({ T, value, onChange, type }) {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.categories.list().then(r => setCats((r.categories ?? []).filter(c => !type || c.type === type))).catch(() => {});
  }, [type]);

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Categoria</label>
      <select value={value ?? ""} onChange={e => onChange(Number(e.target.value) || null)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }}>
        <option value="">Selecionar categoria…</option>
        {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  );
}

// ─── Budget modal ─────────────────────────────────────────────────────────────

function BudgetModal({ T, modal, close, setBudgets, toast }) {
  const isEdit   = modal.type === "editBudget";
  const [name,   setName]   = useState(isEdit ? modal.data.name  : "");
  const [amount, setAmount] = useState(isEdit ? modal.data.limit : "");
  const [color,  setColor]  = useState(isEdit ? modal.data.color : COLORS[0]);

  const today      = new Date().toISOString().slice(0, 10);
  const lastOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(isEdit ? modal.data.startDate ?? today         : today);
  const [endDate,   setEndDate]   = useState(isEdit ? modal.data.endDate   ?? lastOfMonth   : lastOfMonth);

  const submit = async () => {
    if (!name || !amount) { toast("error", "Preenche todos os campos."); return; }
    try {
      if (isEdit) {
        const result = await api.budgets.update(modal.data.id, { name, amount: Number(amount), startDate, endDate, color, categoryIds: modal.data.categoryIds ?? [] });
        setBudgets(items => items.map(item => item.id === modal.data.id ? { ...item, name, limit: Number(amount), color, startDate, endDate } : item));
        toast("success", "Orçamento atualizado."); close();
      } else {
        const result = await api.budgets.create({ name, amount: Number(amount), startDate, endDate, color, categoryIds: [] });
        setBudgets(items => [...items, { id: result.budget.id, name, limit: Number(amount), spent: 0, color, icon: Wallet, startDate, endDate }]);
        toast("success", "Orçamento criado."); close();
      }
    } catch (error) { toast("error", error.message); }
  };

  return (
    <Overlay T={T}>
      <ModalHeader T={T} title={isEdit ? "Editar orçamento" : "Novo orçamento"} onClose={close} />
      <InputField T={T} label="Nome" placeholder="Ex: Alimentação" value={name} onChange={e => setName(e.target.value)} />
      <InputField T={T} label="Valor (€)" placeholder="Ex: 300" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Data início</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Data fim</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }} />
        </div>
      </div>
      <ColorPicker T={T} value={color} onChange={setColor} />
      <Button T={T} label={isEdit ? "Guardar alterações" : "Criar orçamento"} onClick={submit} />
    </Overlay>
  );
}

// ─── Goal modal ───────────────────────────────────────────────────────────────

function GoalModal({ T, close, setGoals, toast }) {
  const [name,       setName]       = useState("");
  const [target,     setTarget]     = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority,   setPriority]   = useState("medium");
  const [color,      setColor]      = useState(COLORS[0]);

  const submit = async () => {
    if (!name || !target) { toast("error", "Preenche os campos obrigatórios."); return; }
    try {
      const result = await api.goals.create({ name, targetAmount: Number(target), targetDate: targetDate || null, priority, color });
      setGoals(items => [...items, {
        id: result.goal.id, name, target: Number(target), saved: 0, monthly: 0,
        eta: targetDate ? new Date(targetDate).toLocaleDateString("pt-PT", { month: "short", year: "numeric" }) : "A calcular",
        prob: priority === "high" ? 85 : 70, color, icon: Target,
      }]);
      toast("success", "Objetivo criado com sucesso!"); close();
    } catch (error) { toast("error", error.message); }
  };

  return (
    <Overlay T={T}>
      <ModalHeader T={T} title="Novo objetivo" onClose={close} />
      <InputField T={T} label="Nome do objetivo" placeholder="Ex: Viagem ao Japão" value={name} onChange={e => setName(e.target.value)} />
      <InputField T={T} label="Valor alvo (€)" placeholder="Ex: 3000" type="number" value={target} onChange={e => setTarget(e.target.value)} />
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Data alvo (opcional)</label>
        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Prioridade</label>
        <select value={priority} onChange={e => setPriority(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }}>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
      </div>
      <ColorPicker T={T} value={color} onChange={setColor} />
      <Button T={T} label="Criar objetivo" onClick={submit} />
    </Overlay>
  );
}

// ─── Contribution modal ───────────────────────────────────────────────────────

function ContributionModal({ T, goal, close, setGoals, toast }) {
  const [amount, setAmount] = useState("");
  const progress = Math.round(goal.saved / goal.target * 100);

  const submit = async () => {
    if (!amount || Number(amount) <= 0) { toast("error", "Insere um valor válido."); return; }
    try {
      const result = await api.goals.contribute(goal.id, { amount: Number(amount) });
      setGoals(items => items.map(item => item.id === goal.id ? { ...item, saved: result.currentAmount } : item));
      toast("success", `${formatCurrency(Number(amount))} adicionados ao objetivo "${goal.name}".`);
      close();
    } catch (error) { toast("error", error.message); }
  };

  return (
    <Overlay T={T}>
      <ModalHeader T={T} title={`Contribuir — ${goal.name}`} onClose={close} />
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div className="fp-num" style={{ fontSize: 22, fontWeight: 600 }}>
          {formatRoundedCurrency(goal.saved)} <span style={{ color: T.sub, fontSize: 14 }}>de {formatRoundedCurrency(goal.target)}</span>
        </div>
        <div style={{ height: 6, background: T.border, borderRadius: 5, overflow: "hidden", margin: "10px 0 4px" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: goal.color, borderRadius: 5 }} />
        </div>
        <div style={{ fontSize: 12, color: T.sub }}>{progress}% concluído</div>
      </div>
      <InputField T={T} label="Valor a adicionar (€)" placeholder="Ex: 100" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <Button T={T} label="Adicionar contribuição" onClick={submit} />
    </Overlay>
  );
}

// ─── Transaction modal ────────────────────────────────────────────────────────

function TransactionModal({ T, close, setTxs, toast }) {
  const [merchant,    setMerchant]    = useState("");
  const [amount,      setAmount]      = useState("");
  const [type,        setType]        = useState("expense");
  const [accountId,   setAccountId]   = useState(null);
  const [categoryId,  setCategoryId]  = useState(null);
  const [date,        setDate]        = useState(new Date().toISOString().slice(0, 10));

  const submit = async () => {
    if (!merchant || !amount || !accountId || !categoryId) { toast("error", "Preenche todos os campos."); return; }
    try {
      const result = await api.transactions.create({
        accountId,
        transactionType: type,
        description:     merchant,
        merchant,
        totalAmount:     Math.abs(Number(amount)),
        transactionDate: date,
        status:          "completed",
        items: [{ categoryId, amount: Math.abs(Number(amount)) }],
      });
      const t = result.transaction;
      setTxs(items => [{
        id: t.id, type, merchant, amount: type === "expense" ? -Number(amount) : Number(amount),
        cat: "Nova transação", ds: new Date(date).toLocaleDateString("pt-PT", { day: "numeric", month: "short" }),
        color: "#5DCAA5", icon: ShoppingBag,
      }, ...items]);
      toast("success", "Transação adicionada."); close();
    } catch (error) { toast("error", error.message); }
  };

  return (
    <Overlay T={T}>
      <ModalHeader T={T} title="Nova transação" onClose={close} />
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["expense", "Despesa"], ["income", "Receita"]].map(([v, l]) => (
          <div key={v} className="fp-btn" onClick={() => setType(v)}
            style={{ flex: 1, textAlign: "center", padding: "7px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, background: type === v ? T.accent : T.panel2, color: type === v ? "#0A0D12" : T.sub, border: `1px solid ${type === v ? T.accent : T.border}` }}>
            {l}
          </div>
        ))}
      </div>
      <InputField T={T} label="Comerciante / Descrição" placeholder="Ex: Continente" value={merchant} onChange={e => setMerchant(e.target.value)} />
      <InputField T={T} label="Valor (€)" placeholder="Ex: 45.00" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Data</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }} />
      </div>
      <AccountSelect  T={T} value={accountId}  onChange={setAccountId} />
      <CategorySelect T={T} value={categoryId} onChange={setCategoryId} type={type} />
      <Button T={T} label="Adicionar transação" onClick={submit} />
    </Overlay>
  );
}

// ─── Cancel subscription modal ────────────────────────────────────────────────

function CancelSubscriptionModal({ T, subscription, close, setSubs, toast }) {
  const cancel = async () => {
    try {
      await api.subscriptions.setStatus(subscription.id, "cancelled");
      setSubs(items => items.map(item => item.id === subscription.id ? { ...item, active: false, status: "cancelled" } : item));
      toast("info", `"${subscription.name}" cancelada. Poupas ${formatRoundedCurrency(subscription.monthly * 12)}/ano.`);
      close();
    } catch (error) { toast("error", error.message); }
  };

  return (
    <Overlay T={T}>
      <ModalHeader T={T} title="Cancelar subscrição" onClose={close} />
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${subscription.color}22`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <subscription.icon size={22} color={subscription.color} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{subscription.name}</div>
        <div style={{ fontSize: 12.5, color: T.sub, lineHeight: 1.5 }}>
          Ao cancelar, poupas <strong className="fp-num">{formatCurrency(subscription.monthly)}/mês</strong> ({formatRoundedCurrency(subscription.monthly * 12)}/ano).<br />Podes reativar a qualquer momento.
        </div>
      </div>
      <Button T={T} label="Confirmar cancelamento" onClick={cancel} color={T.danger} />
      <div className="fp-btn" onClick={close} style={{ textAlign: "center", padding: "10px", borderRadius: 9, fontSize: 13, color: T.sub, marginTop: 8 }}>Manter subscrição</div>
    </Overlay>
  );
}

// ─── Subscription modal ───────────────────────────────────────────────────────

function SubscriptionModal({ T, close, setSubs, toast }) {
  const [name,         setName]         = useState("");
  const [amount,       setAmount]       = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextPayment,  setNextPayment]  = useState(new Date().toISOString().slice(0, 10));
  const [color,        setColor]        = useState(COLORS[0]);

  const submit = async () => {
    if (!name || !amount) { toast("error", "Preenche todos os campos."); return; }
    try {
      const result = await api.subscriptions.create({ name, amount: Number(amount), billingCycle, nextPayment, status: "active" });
      setSubs(items => [...items, {
        id: result.subscription.id, name, monthly: Number(amount), billingCycle,
        next: new Date(nextPayment).toLocaleDateString("pt-PT", { day: "numeric", month: "short" }),
        active: true, used: true, color, icon: Film, status: "active",
      }]);
      toast("success", "Subscrição adicionada."); close();
    } catch (error) { toast("error", error.message); }
  };

  return (
    <Overlay T={T}>
      <ModalHeader T={T} title="Adicionar subscrição" onClose={close} />
      <InputField T={T} label="Nome do serviço" placeholder="Ex: HBO Max" value={name} onChange={e => setName(e.target.value)} />
      <InputField T={T} label="Valor (€)" placeholder="Ex: 9.99" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Ciclo de faturação</label>
        <select value={billingCycle} onChange={e => setBillingCycle(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }}>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="quarterly">Trimestral</option>
          <option value="yearly">Anual</option>
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 4 }}>Próximo pagamento</label>
        <input type="date" value={nextPayment} onChange={e => setNextPayment(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontSize: 12.5, outline: "none" }} />
      </div>
      <ColorPicker T={T} value={color} onChange={setColor} />
      <Button T={T} label="Adicionar subscrição" onClick={submit} />
    </Overlay>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default function ModalRouter({ T, modal, setModal, setBudgets, setGoals, setTxs, setSubs, toast }) {
  if (!modal) return null;
  const close  = () => setModal(null);
  const common = { T, close, toast };

  if (modal.type === "addBudget" || modal.type === "editBudget")
    return <BudgetModal key={`${modal.type}-${modal.data?.id ?? "new"}`} {...common} modal={modal} setBudgets={setBudgets} />;
  if (modal.type === "addGoal")
    return <GoalModal         {...common} setGoals={setGoals} />;
  if (modal.type === "contributeGoal")
    return <ContributionModal {...common} goal={modal.data} setGoals={setGoals} />;
  if (modal.type === "addTransaction")
    return <TransactionModal  {...common} setTxs={setTxs} />;
  if (modal.type === "cancelSub")
    return <CancelSubscriptionModal {...common} subscription={modal.data} setSubs={setSubs} />;
  if (modal.type === "addSub")
    return <SubscriptionModal {...common} setSubs={setSubs} />;
  return null;
}
