import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const legacySource = path.join(root, "client", "FinPilot.jsx");
if (!fs.existsSync(legacySource)) {
  throw new Error("A fonte legada client/FinPilot.jsx foi removida; a migração já não pode ser repetida.");
}
if (fs.existsSync(path.join(root, "src")) && !process.argv.includes("--force")) {
  throw new Error("A organização já foi aplicada. Usa --force apenas para repetir a migração.");
}
const source = fs.readFileSync(legacySource, "utf8");
const lines = source.split(/\r?\n/);

const slice = (start, end) => lines.slice(start - 1, end).join("\n").trimEnd();
const write = (file, content) => {
  const destination = path.join(root, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${content.trim()}\n`, "utf8");
};
const makeDefault = (body, component) =>
  body.replace(`function ${component}`, `export default function ${component}`);

const theme = slice(16, 58)
  .replace("const D=", "export const darkTheme=")
  .replace("const L=", "export const lightTheme=")
  .replace("const CSS =", "export const createGlobalStyles =");
write("src/config/theme.js", theme);

const dataNames = [
  "TREND", "REPORT_DATA", "CATS", "TX0", "GOALS0", "BDG0", "SUB0",
  "NTF0", "CHAT0", "REPS", "CAT_NAMES", "COLORS",
];
let data = slice(61, 114);
for (const name of dataNames) data = data.replace(`const ${name}=`, `export const ${name}=`);
write("src/data/mockData.jsx", `
import {
  AlertTriangle, Briefcase, Dumbbell, Film, Fuel, Home, Plane,
  Shield, ShoppingBag, Utensils, Zap,
} from "lucide-react";

${data}
`);

write("src/utils/currency.js", `
export const formatCurrency = n => Math.abs(n).toLocaleString("pt-PT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export const formatRoundedCurrency = n => n.toLocaleString("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

let uid = 200;
export const nextId = () => ++uid;
`);

write("src/components/brand/GoogleLogo.jsx", makeDefault(slice(122, 129), "GoogleG"));

let shared = slice(1200, 1243)
  .replace("function Metric", "export function Metric")
  .replace("function Section", "export function Section")
  .replace("function MiniGoal", "export function MiniGoal")
  .replace("function Leg", "export function Leg")
  .replaceAll("fmtS(", "formatRoundedCurrency(");
write("src/components/ui/FinanceComponents.jsx", `
import { useEffect, useState } from "react";
import { formatRoundedCurrency } from "../../utils/currency";

${shared}
`);

let login = makeDefault(slice(389, 471), "LoginPage");
login = login.replaceAll("CSS(", "createGlobalStyles(").replaceAll("<GoogleG", "<GoogleLogo");
write("src/components/auth/LoginPage.jsx", `
import { useState } from "react";
import { CheckCheck, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { createGlobalStyles } from "../../config/theme";
import GoogleLogo from "../brand/GoogleLogo";

${login}
`);

let onboarding = makeDefault(slice(472, 548), "OnboardWizard");
onboarding = onboarding.replaceAll("CSS(", "createGlobalStyles(");
write("src/components/auth/OnboardingWizard.jsx", `
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { createGlobalStyles } from "../../config/theme";

${onboarding}
`);

let dashboard = makeDefault(slice(549, 668), "PageDashboard")
  .replaceAll("fmtS(", "formatRoundedCurrency(")
  .replaceAll("fmt(", "formatCurrency(");
write("src/pages/DashboardPage.jsx", `
import {
  Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownRight, ArrowUpRight, ChevronRight, TrendingDown, TrendingUp,
} from "lucide-react";
import { CATS, TREND } from "../data/mockData";
import { formatCurrency, formatRoundedCurrency } from "../utils/currency";
import { Leg, MiniGoal } from "../components/ui/FinanceComponents";

${dashboard}
`);

let transactions = makeDefault(slice(669, 744), "PageTransactions")
  .replaceAll("fmtS(", "formatRoundedCurrency(")
  .replaceAll("fmt(", "formatCurrency(");
write("src/pages/TransactionsPage.jsx", `
import { useMemo, useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { formatCurrency, formatRoundedCurrency } from "../utils/currency";
import { Metric } from "../components/ui/FinanceComponents";

${transactions}
`);

let budgets = makeDefault(slice(745, 807), "PageBudgets")
  .replaceAll("fmtS(", "formatRoundedCurrency(");
write("src/pages/BudgetsPage.jsx", `
import { useEffect, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { formatRoundedCurrency } from "../utils/currency";
import { Metric } from "../components/ui/FinanceComponents";

${budgets}
`);

let goals = makeDefault(slice(808, 863), "PageGoals")
  .replaceAll("fmtS(", "formatRoundedCurrency(");
write("src/pages/GoalsPage.jsx", `
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatRoundedCurrency } from "../utils/currency";
import { Metric } from "../components/ui/FinanceComponents";

${goals}
`);

let subscriptions = makeDefault(slice(864, 928), "PageSubscriptions")
  .replaceAll("fmtS(", "formatRoundedCurrency(")
  .replaceAll("fmt(", "formatCurrency(");
write("src/pages/SubscriptionsPage.jsx", `
import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { formatCurrency, formatRoundedCurrency } from "../utils/currency";
import { Metric } from "../components/ui/FinanceComponents";

${subscriptions}
`);

let reports = makeDefault(slice(929, 1007), "PageReports")
  .replaceAll("fmtS(", "formatRoundedCurrency(")
  .replaceAll("fmt(", "formatCurrency(");
write("src/pages/ReportsPage.jsx", `
import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { CATS, REPORT_DATA } from "../data/mockData";
import { formatCurrency, formatRoundedCurrency } from "../utils/currency";
import { Leg, Metric } from "../components/ui/FinanceComponents";

${reports}
`);

const settings = makeDefault(slice(1008, 1083), "PageSettings");
write("src/pages/SettingsPage.jsx", `
import { useState } from "react";
import { Download, Edit2, LogOut, Trash2 } from "lucide-react";
import { Section } from "../components/ui/FinanceComponents";

${settings}
`);

let modal = makeDefault(slice(1084, 1199), "ModalRouter")
  .replaceAll("fmtS(", "formatRoundedCurrency(")
  .replaceAll("fmt(", "formatCurrency(")
  .replaceAll("nid()", "nextId()");
write("src/components/modals/ModalRouter.jsx", `
import { useState } from "react";
import { Film, ShoppingBag, Target, Wallet, X } from "lucide-react";
import { CAT_NAMES, COLORS } from "../../data/mockData";
import { formatCurrency, formatRoundedCurrency, nextId } from "../../utils/currency";

${modal}
`);

let app = slice(132, 386)
  .replaceAll("D:L", "darkTheme:lightTheme")
  .replace("dark?D:L", "dark ? darkTheme : lightTheme")
  .replaceAll("CSS(", "createGlobalStyles(")
  .replaceAll("fmt(", "formatCurrency(")
  .replaceAll("nid()", "nextId()")
  .replaceAll("<LoginPage", "<LoginPage")
  .replaceAll("<OnboardWizard", "<OnboardingWizard")
  .replaceAll("<PageDashboard", "<DashboardPage")
  .replaceAll("<PageTransactions", "<TransactionsPage")
  .replaceAll("<PageBudgets", "<BudgetsPage")
  .replaceAll("<PageGoals", "<GoalsPage")
  .replaceAll("<PageSubscriptions", "<SubscriptionsPage")
  .replaceAll("<PageReports", "<ReportsPage")
  .replaceAll("<PageSettings", "<SettingsPage");
write("src/FinPilotApp.jsx", `
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart2, Bell, BellRing, CheckCheck, CreditCard, LayoutDashboard, LogOut,
  Moon, Repeat, Search, Send, Settings, Sparkles, Sun, Target, Wallet, X,
} from "lucide-react";
import { createGlobalStyles, darkTheme, lightTheme } from "./config/theme";
import { BDG0, CHAT0, GOALS0, NTF0, REPS, SUB0, TX0 } from "./data/mockData";
import { formatCurrency, nextId } from "./utils/currency";
import LoginPage from "./components/auth/LoginPage";
import OnboardingWizard from "./components/auth/OnboardingWizard";
import ModalRouter from "./components/modals/ModalRouter";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";
import GoalsPage from "./pages/GoalsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

${app}
`);

write("src/main.jsx", `
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FinPilotApp from "./FinPilotApp";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FinPilotApp />
  </StrictMode>,
);
`);

write("src/index.css", `
:root {
  color-scheme: dark;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

html, body, #root {
  min-width: 320px;
  min-height: 100%;
  margin: 0;
}

body {
  min-height: 100vh;
  background: #0a0d12;
}

#root {
  padding: 24px;
}
`);

write("FinPilot.jsx", `
export { default } from "./src/FinPilotApp";
`);
