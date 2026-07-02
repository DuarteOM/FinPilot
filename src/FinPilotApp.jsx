import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import { createGlobalStyles, darkTheme, lightTheme } from "./config/theme";
import { BDG0, CHAT0, GOALS0, NTF0, SUB0, TX0 } from "./data/mockData";
import { nextId } from "./utils/currency";
import { hydrateBudget, hydrateGoal, hydrateSubscription, hydrateTransaction } from "./utils/entities";
import { api } from "./services/api";

// Layout
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import ChatPanel from "./components/layout/ChatPanel";
import ToastList from "./components/layout/ToastList";

// Auth
import LoginPage from "./components/auth/LoginPage";
import OnboardingWizard from "./components/auth/OnboardingWizard";

// Modals
import ModalRouter from "./components/modals/ModalRouter";

// Pages
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";
import GoalsPage from "./pages/GoalsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function loadFinancialData() {
  const [txRes, bdgRes, goalRes, subRes] = await Promise.all([
    api.transactions.list(),
    api.budgets.list(),
    api.goals.list(),
    api.subscriptions.list(),
  ]);
  return {
    transactions:  txRes.transactions.map(hydrateTransaction),
    budgets:       bdgRes.budgets.map(hydrateBudget),
    goals:         goalRes.goals.map(hydrateGoal),
    subscriptions: subRes.subscriptions.map(hydrateSubscription),
  };
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function FinPilotApp() {
  // Theme
  const [dark, setDark] = useState(true);
  const T = dark ? darkTheme : lightTheme;

  // Auth
  const [authed,       setAuthed]       = useState(false);
  const [authLoad,     setAuthLoad]     = useState(false);
  const [authChecking, setAuthChecking] = useState(api.hasSession());
  const [onboarding,   setOnboarding]   = useState(false);
  const [obStep,       setObStep]       = useState(1);

  // Navigation
  const [view, setView] = useState("dashboard");

  // Financial data (start with mock data so UI is never empty)
  const [txs,     setTxs]     = useState(TX0);
  const [budgets, setBudgets] = useState(BDG0);
  const [goals,   setGoals]   = useState(GOALS0);
  const [subs,    setSubs]    = useState(SUB0);
  const [notifs,  setNotifs]  = useState(NTF0);

  // UI state
  const [chatOpen,    setChatOpen]    = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [toasts,      setToasts]      = useState([]);
  const [modal,       setModal]       = useState(null);
  const [searchQ,     setSearchQ]     = useState("");
  const [searchOpen,  setSearchOpen]  = useState(false);

  // AI chat
  const [msgs, setMsgs] = useState(CHAT0);

  // User profile
  const [profile,     setProfile]     = useState({ name: "Mariana Rodrigues", email: "mariana@exemplo.pt" });
  const [notifPrefs,  setNotifPrefs]  = useState({ budget: true, salary: true, insights: true, goals: true, unusual: true });
  const [twoFA,       setTwoFA]       = useState(false);

  // Close dropdowns on outside click
  const overlayRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Restore session on mount
  useEffect(() => {
    if (!api.hasSession()) return;
    Promise.all([api.auth.me(), loadFinancialData(), api.ai.history()])
      .then(([account, data, history]) => {
        setProfile(account.user);
        setDark(account.settings.darkMode);
        setTwoFA(account.settings.twoFactor);
        setNotifPrefs(account.settings.notificationPrefs);
        setTxs(data.transactions);
        setBudgets(data.budgets);
        setGoals(data.goals);
        setSubs(data.subscriptions);
        if (history.messages.length) {
          setMsgs(history.messages.map((m) => ({ role: m.role, text: m.content })));
        }
        setAuthed(true);
      })
      .catch(() => api.setToken(null))
      .finally(() => setAuthChecking(false));
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const toast = (type, text) => {
    const id = nextId();
    setToasts((ts) => [...ts, { id, type, text }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 3600);
  };

  const login = async (credentials, isNew = false) => {
    setAuthLoad(true);
    try {
      const result = isNew
        ? await api.auth.register(credentials)
        : await api.auth.login(credentials);
      api.setToken(result.token);
      setProfile(result.user);
      const data = await loadFinancialData();
      setTxs(data.transactions);
      setBudgets(data.budgets);
      setGoals(data.goals);
      setSubs(data.subscriptions);
      setAuthed(true);
      if (isNew) {
        setOnboarding(true);
        setObStep(1);
      } else {
        toast("success", "Sessão iniciada com sucesso.");
      }
    } catch (error) {
      api.setToken(null);
      throw error;
    } finally {
      setAuthLoad(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setAuthed(false);
    setMsgs(CHAT0);
    setTxs(TX0);
    setBudgets(BDG0);
    setGoals(GOALS0);
    setSubs(SUB0);
  };

  // ── Search ───────────────────────────────────────────────────────────────

  const searchResults = useMemo(() => {
    if (!searchQ.trim()) return [];
    const q = searchQ.toLowerCase();
    return txs
      .filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.cat.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQ, txs]);

  // ── Auth screens ─────────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div style={{ minHeight: 600, display: "grid", placeItems: "center", background: T.bg, color: T.text }}>
        A carregar o FinPilot…
      </div>
    );
  }

  if (!authed) {
    return (
      <LoginPage
        T={T}
        dark={dark}
        loading={authLoad}
        onLogin={(credentials) => login(credentials, false)}
        onGoogle={() => Promise.reject(new Error("A autenticação Google será configurada numa fase seguinte."))}
        onRegister={(credentials) => login(credentials, true)}
      />
    );
  }

  if (onboarding) {
    return (
      <OnboardingWizard
        T={T}
        step={obStep}
        setStep={setObStep}
        onDone={() => {
          setOnboarding(false);
          toast("success", "Bem-vindo ao FinPilot! 🎉 O teu espaço financeiro está pronto.");
        }}
      />
    );
  }

  // ── Main shell ───────────────────────────────────────────────────────────

  return (
    <div
      style={{
        fontFamily: "'Inter',-apple-system,sans-serif",
        background: T.bg,
        color: T.text,
        minHeight: 600,
        display: "flex",
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${T.border}`,
        position: "relative",
      }}
    >
      <style>{createGlobalStyles(T)}</style>

      {/* ── Sidebar ── */}
      <Sidebar
        T={T}
        view={view}
        setView={setView}
        dark={dark}
        setDark={setDark}
        profile={profile}
        txCount={txs.length}
        onLogout={logout}
      />

      {/* ── Main column ── */}
      <div
        ref={overlayRef}
        className="fp-scroll"
        style={{ flex: 1, overflowY: "auto", maxHeight: 700, display: "flex", flexDirection: "column" }}
      >
        <TopBar
          T={T}
          view={view}
          profile={profile}
          notifs={notifs}
          setNotifs={setNotifs}
          searchQ={searchQ}
          setSearchQ={setSearchQ}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          searchResults={searchResults}
        />

        {/* Page content */}
        <div style={{ padding: "18px 28px 28px", flex: 1 }}>
          {view === "dashboard"     && <DashboardPage     T={T} goals={goals} subs={subs} txs={txs} setView={setView} />}
          {view === "transactions"  && <TransactionsPage  T={T} txs={txs} setTxs={setTxs} setModal={setModal} toast={toast} />}
          {view === "budgets"       && <BudgetsPage       T={T} budgets={budgets} setBudgets={setBudgets} setModal={setModal} toast={toast} />}
          {view === "goals"         && <GoalsPage         T={T} goals={goals} setGoals={setGoals} setModal={setModal} toast={toast} />}
          {view === "subscriptions" && <SubscriptionsPage T={T} subs={subs} setSubs={setSubs} setModal={setModal} toast={toast} />}
          {view === "reports"       && <ReportsPage       T={T} toast={toast} />}
          {view === "settings"      && (
            <SettingsPage
              T={T}
              profile={profile}
              setProfile={setProfile}
              notifPrefs={notifPrefs}
              setNotifPrefs={setNotifPrefs}
              twoFA={twoFA}
              setTwoFA={setTwoFA}
              toast={toast}
              dark={dark}
              setDark={setDark}
              onLogout={logout}
            />
          )}
        </div>
      </div>

      {/* ── AI Chat panel ── */}
      {chatOpen && (
        <ChatPanel
          T={T}
          msgs={msgs}
          setMsgs={setMsgs}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* ── Modals ── */}
      <ModalRouter
        T={T}
        modal={modal}
        setModal={setModal}
        budgets={budgets}
        setBudgets={setBudgets}
        goals={goals}
        setGoals={setGoals}
        txs={txs}
        setTxs={setTxs}
        subs={subs}
        setSubs={setSubs}
        toast={toast}
      />

      {/* ── Toasts ── */}
      <ToastList T={T} toasts={toasts} />

      {/* ── AI FAB ── */}
      <button
        className="fp-btn"
        aria-label="Abrir assistente FinPilot"
        onClick={() => setChatOpen((o) => !o)}
        style={{
          position: "absolute",
          bottom: 22,
          right: 22,
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 18px rgba(0,0,0,.28)",
          zIndex: 5,
          border: "none",
          cursor: "pointer",
        }}
      >
        <Sparkles size={20} color="#0A0D12" />
      </button>
    </div>
  );
}
