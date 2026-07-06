import { Briefcase, Dumbbell, Film, Fuel, Home, ShoppingBag, Target, Utensils, Zap } from "lucide-react";

// ─── Icon map by category name ────────────────────────────────────────────────
const ICON_MAP = {
  "Restauração":  Utensils,
  "Supermercado": ShoppingBag,
  "Transportes":  Fuel,
  "Combustível":  Fuel,
  "Subscrições":  Film,
  "Casa":         Home,
  "Saúde":        Dumbbell,
  "Salário":      Zap,
  "Freelance":    Briefcase,
  "Receita":      Zap,
  "Compras":      ShoppingBag,
};

export const iconFor = name => ICON_MAP[name] || Briefcase;

// ─── Hydrators — normalise DB responses to UI shape ──────────────────────────

/**
 * Transaction from MySQL API:
 * { id, type, merchant, totalAmount, date, categoryName, categoryColor, accountName, status }
 */
export function hydrateTransaction(item) {
  const firstItem = item.items?.[0];
  const cat   = item.categoryName ?? firstItem?.categoryName ?? item.category ?? "Outros";
  const color = item.categoryColor ?? firstItem?.categoryColor ?? "#5DCAA5";
  const amount = item.type === "expense" ? -Number(item.totalAmount) : Number(item.totalAmount);
  return {
    ...item,
    id:     item.id,
    merchant: item.merchant ?? item.description ?? "—",
    amount,
    cat,
    ds:     item.date ? new Date(item.date).toLocaleDateString("pt-PT", { day: "numeric", month: "short" }) : "—",
    color,
    icon:   iconFor(cat),
  };
}

/**
 * Budget from MySQL API:
 * { id, name, amount, spent, color, isActive, startDate, endDate, categories }
 */
export function hydrateBudget(item) {
  return {
    ...item,
    id:    item.id,
    name:  item.name,
    limit: Number(item.amount),        // UI uses `limit`
    spent: Number(item.spent ?? 0),
    color: item.color ?? "#5DCAA5",
    icon:  iconFor(item.name),
  };
}

/**
 * Goal from MySQL API:
 * { id, name, targetAmount, currentAmount, targetDate, priority, color, icon, status }
 */
export function hydrateGoal(item) {
  return {
    ...item,
    id:      item.id,
    name:    item.name,
    target:  Number(item.targetAmount),
    saved:   Number(item.currentAmount ?? 0),
    monthly: 0,                          // not stored in new schema; could be derived
    eta:     item.targetDate
               ? new Date(item.targetDate).toLocaleDateString("pt-PT", { month: "short", year: "numeric" })
               : "A calcular",
    prob:    item.priority === "high" ? 85 : item.priority === "medium" ? 70 : 55,
    color:   item.color ?? "#5DCAA5",
    icon:    item.icon ? iconFor(item.icon) : Target,
  };
}

/**
 * Subscription from MySQL API:
 * { id, name, amount, billingCycle, nextPayment, status, autoRenew }
 */
export function hydrateSubscription(item) {
  return {
    ...item,
    id:      item.id,
    name:    item.name,
    monthly: Number(item.amount),       // UI uses `monthly`
    next:    item.nextPayment
               ? new Date(item.nextPayment).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
               : "—",
    active:  item.status === "active",
    used:    item.status !== "cancelled",
    color:   item.categoryColor ?? "#7F8FE4",
    icon:    Film,
  };
}
