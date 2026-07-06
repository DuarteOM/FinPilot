import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import { createGlobalStyles, darkTheme, lightTheme } from "../shared/utils/theme";
import { CHAT0, BDG0, GOALS0, NTF0, SUB0, TX0 } from "../shared/utils/mockData";
import { nextId } from "../shared/utils/currency";
import { hydrateBudget, hydrateGoal, hydrateSubscription, hydrateTransaction } from "../shared/utils/entities";
import { api } from "../api/api";

// Layout
import Sidebar   from "../shared/components/layout/Sidebar";
import TopBar    from "../shared/components/layout/TopBar";
import ChatPanel from "../shared/components/layout/ChatPanel";
import ToastList from "../shared/components/layout/ToastList";

// Auth
import LoginPage        from "../shared/components/auth/LoginPage";
import OnboardingWizard from "../shared/components/auth/OnboardingWizard";

// Modals
import ModalRouter from "../shared/components/modals/ModalRouter";

// Features
import DashboardPage     from "../features/dashboard/DashboardPage";
import TransactionsPage  from "../features/transactions/TransactionsPage";
import BudgetsPage       from "../features/budgets/BudgetsPage";
import GoalsPage         from "../features/goals/GoalsPage";
import SubscriptionsPage from "../features/subscriptions/SubscriptionsPage";
import ReportsPage       from "../features/reports/ReportsPage";
import SettingsPage      from "../features/settings/SettingsPage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fullName(user) {
  if (!user) return "";
  if (user.name) return user.name;
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

function loadGoogleIdentity() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google);
      return;
    }

    const existing = document.querySelector("script[data-google-identity]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google), { once: true });
      existing.addEventListener("error", () => reject(new Error("Não foi possível carregar o Google.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Não foi possível carregar o Google."));
    document.head.appendChild(script);
  });
}

async function loadFinancialData() {
  const [txRes, bdgRes, goalRes, subRes] = await Promise.all([
    api.transactions.list(),
    api.budgets.list(),
    api.goals.list(),
    api.subscriptions.list(),
  ]);
  return {
    transactions:  (txRes.transactions  ?? []).map(hydrateTransaction),
    budgets:       (bdgRes.budgets       ?? []).map(hydrateBudget),
    goals:         (goalRes.goals        ?? []).map(hydrateGoal),
    subscriptions: (subRes.subscriptions ?? []).map(hydrateSubscription),
  };
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
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

  // Financial data (start with mock so UI is never empty before session loads)
  const [txs,     setTxs]     = useState(TX0);
  const [budgets, setBudgets] = useState(BDG0);
  const [goals,   setGoals]   = useState(GOALS0);
  const [subs,    setSubs]    = useState(SUB0);
  const [notifs,  setNotifs]  = useState(NTF0);

  // UI
  const [chatOpen,   setChatOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [toasts,     setToasts]     = useState([]);
  const [modal,      setModal]      = useState(null);
  const [searchQ,    setSearchQ]    = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [contentScrolled, setContentScrolled] = useState(false);

  // AI
  const [msgs, setMsgs] = useState(CHAT0);

  // User
  const [profile, setProfile] = useState({ name: "FinPilot", email: "" });
  const [settings, setSettings] = useState({
    darkMode: true,
    notificationsEnabled: true,
    emailNotifications: true,
    language: "pt",
    currencyFormat: "EUR",
    firstDayOfWeek: "monday",
  });

  // Close dropdowns on outside click
  const overlayRef = useRef(null);
  useEffect(() => {
    const handler = e => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setContentScrolled(false);
  }, [view]);

  // Restore session on mount
  useEffect(() => {
    if (!api.hasSession()) return;
    Promise.all([api.auth.me(), loadFinancialData(), api.ai.history(), api.notifications.list()])
      .then(([account, data, history, notifRes]) => {
        const name = fullName(account.user);
        setProfile({ ...account.user, name });
        setSettings(account.settings ?? settings);
        setDark(account.settings?.darkMode ?? true);
        setTxs(data.transactions);
        setBudgets(data.budgets);
        setGoals(data.goals);
        setSubs(data.subscriptions);
        if ((notifRes?.notifications ?? []).length) {
          setNotifs(notifRes.notifications.map(n => ({
            ...n,
            read:  Boolean(n.isRead),
            text:  n.message,
            time:  new Date(n.createdAt).toLocaleString("pt-PT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
            // Map type to icon — use a generic fallback handled in TopBar
            color: n.type === "warning" ? "#E8A33D" : n.type === "error" ? "#E0544F" : n.type === "success" ? "#5DCAA5" : "#7F8FE4",
          })));
        }
        if ((history?.messages ?? []).length) {
          setMsgs(history.messages.map(m => ({ role: m.role, text: m.content })));
        }
        setAuthed(true);
      })
      .catch(() => api.setToken(null))
      .finally(() => setAuthChecking(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toast = (type, text) => {
    const id = nextId();
    setToasts(ts => [...ts, { id, type, text }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3600);
  };

  const applyData = data => {
    setTxs(data.transactions);
    setBudgets(data.budgets);
    setGoals(data.goals);
    setSubs(data.subscriptions);
  };

  const login = async (credentials, isNew = false) => {
    setAuthLoad(true);
    try {
      const result = isNew
        ? await api.auth.register(credentials)
        : await api.auth.login(credentials);
      api.setToken(result.token);
      const name = fullName(result.user);
      setProfile({ ...result.user, name });
      applyData(await loadFinancialData());
      setAuthed(true);
      if (isNew) { setOnboarding(true); setObStep(1); }
      else toast("success", "Sessão iniciada com sucesso.");
    } catch (error) {
      api.setToken(null);
      throw error;
    } finally {
      setAuthLoad(false);
    }
  };

  const loginWithGoogle = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("Configura VITE_GOOGLE_CLIENT_ID no ficheiro .env.");

    setAuthLoad(true);
    try {
      const google = await loadGoogleIdentity();
      const accessToken = await new Promise((resolve, reject) => {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          prompt: "select_account",
          callback: response => response.access_token
            ? resolve(response.access_token)
            : reject(new Error(response.error_description || "A Google não devolveu credenciais.")),
        });
        client.requestAccessToken();
      });

      const result = await api.auth.google(accessToken);
      api.setToken(result.token);
      const name = fullName(result.user);
      setProfile({ ...result.user, name });
      applyData(await loadFinancialData());
      setAuthed(true);
      toast("success", "Sessão iniciada com Google.");
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
    setNotifs(NTF0);
  };

  // ── Search ─────────────────────────────────────────────────────────────────

  const searchResults = useMemo(() => {
    if (!searchQ.trim()) return [];
    const q = searchQ.toLowerCase();
    return txs
      .filter(t =>
        (t.merchant ?? "").toLowerCase().includes(q) ||
        (t.cat       ?? "").toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQ, txs]);

  // ── Auth screens ────────────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: T.bg, color: T.text }}>
        A carregar o FinPilot…
      </div>
    );
  }

  if (!authed) {
    return (
      <LoginPage T={T} dark={dark} loading={authLoad}
        onLogin={c => login(c, false)}
        onGoogle={loginWithGoogle}
        onRegister={c => login(c, true)} />
    );
  }

  if (onboarding) {
    return (
      <OnboardingWizard T={T} step={obStep} setStep={setObStep}
        onDone={() => { setOnboarding(false); toast("success", "Bem-vindo ao FinPilot! 🎉 O teu espaço financeiro está pronto."); }} />
    );
  }

  // ── Shell ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex", borderRadius: 0, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative" }}>
      <style>{createGlobalStyles(T)}</style>

      <Sidebar T={T} view={view} setView={setView} dark={dark} setDark={setDark}
        profile={profile} txCount={txs.length} onLogout={logout} />

      <div
        ref={overlayRef}
        className="fp-scroll"
        onScroll={e => setContentScrolled(e.currentTarget.scrollTop > 80)}
        style={{ flex: 1, overflowY: "auto", maxHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <TopBar T={T} view={view} profile={profile}
          notifs={notifs} setNotifs={setNotifs}
          searchQ={searchQ} setSearchQ={setSearchQ}
          searchOpen={searchOpen} setSearchOpen={setSearchOpen}
          notifOpen={notifOpen} setNotifOpen={setNotifOpen}
          searchResults={searchResults} />

        <div style={{ padding: "18px 28px 28px", flex: 1 }}>
          {view === "dashboard"     && <DashboardPage     T={T} goals={goals} subs={subs} txs={txs} setView={setView} />}
          {view === "transactions"  && <TransactionsPage  T={T} txs={txs} setTxs={setTxs} setModal={setModal} toast={toast} />}
          {view === "budgets"       && <BudgetsPage       T={T} budgets={budgets} setBudgets={setBudgets} setModal={setModal} toast={toast} />}
          {view === "goals"         && <GoalsPage         T={T} goals={goals} setGoals={setGoals} setModal={setModal} toast={toast} />}
          {view === "subscriptions" && <SubscriptionsPage T={T} subs={subs} setSubs={setSubs} setModal={setModal} toast={toast} />}
          {view === "reports"       && <ReportsPage       T={T} toast={toast} />}
          {view === "settings"      && (
            <SettingsPage T={T} profile={profile} setProfile={setProfile}
              settings={settings} setSettings={setSettings}
              toast={toast} dark={dark} setDark={setDark} onLogout={logout} />
          )}
        </div>
      </div>

      {chatOpen && <ChatPanel T={T} msgs={msgs} setMsgs={setMsgs} onClose={() => setChatOpen(false)} />}

      <ModalRouter T={T} modal={modal} setModal={setModal}
        budgets={budgets} setBudgets={setBudgets}
        goals={goals}   setGoals={setGoals}
        txs={txs}       setTxs={setTxs}
        subs={subs}     setSubs={setSubs}
        toast={toast} />

      <ToastList T={T} toasts={toasts} />

      <button className="fp-btn" aria-label="Abrir assistente FinPilot"
        onClick={() => setChatOpen(o => !o)}
        style={{ position: "absolute", bottom: 22, right: 22, width: contentScrolled && !chatOpen ? 30 : 50, height: contentScrolled && !chatOpen ? 30 : 50, borderRadius: "50%", background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: contentScrolled && !chatOpen ? "0 4px 12px rgba(0,0,0,.22)" : "0 6px 18px rgba(0,0,0,.28)", zIndex: 5, border: "none", cursor: "pointer", transition: "width .22s ease, height .22s ease, box-shadow .22s ease, transform .22s ease" }}>
        <Sparkles size={contentScrolled && !chatOpen ? 12 : 20} color="#0A0D12" />
      </button>
    </div>
  );
}
