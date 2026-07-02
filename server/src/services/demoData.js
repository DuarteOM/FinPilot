import { randomUUID } from "node:crypto";
import { db, transaction } from "../db/database.js";

const isoDate = daysAgo => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

export function seedDemoData(userId) {
  const transactions = [
    ["Continente", "Supermercado", -64.2, 0, "#5DCAA5"],
    ["Netflix", "Subscrições", -12.99, 1, "#D4537E"],
    ["Galp", "Combustível", -45, 2, "#7F8FE4"],
    ["Salário — Acme Lda", "Receita", 2400, 3, "#5DCAA5"],
    ["Cervejaria Ramiro", "Restauração", -38.5, 4, "#E8A33D"],
    ["Worten", "Compras", -129.9, 6, "#7F8FE4"],
    ["Spotify", "Subscrições", -9.99, 8, "#D4537E"],
    ["Renda", "Casa", -850, 10, "#888780"],
  ];
  const budgets = [
    ["Restauração", 300, "#E8A33D"], ["Transportes", 150, "#7F8FE4"],
    ["Lazer", 200, "#D4537E"], ["Supermercado", 380, "#5DCAA5"], ["Casa", 1000, "#888780"],
  ];
  const goals = [
    ["Entrada para casa", 20000, 8400, 420, "Out 2027", "#5DCAA5", 82],
    ["Viagem ao Japão", 3200, 1180, 165, "Mar 2027", "#7F8FE4", 91],
    ["Fundo de emergência", 6000, 2600, 280, "Jan 2027", "#E8A33D", 76],
  ];
  const subscriptions = [
    ["Netflix", 12.99, "3 ago", 1, "#D4537E"], ["Spotify", 9.99, "7 ago", 1, "#5DCAA5"],
    ["Adobe CC", 24.59, "12 ago", 0, "#E8A33D"], ["iCloud+", 2.99, "15 ago", 1, "#7F8FE4"],
  ];

  transaction(() => {
    const insertTransaction = db.prepare("INSERT INTO transactions (id,user_id,merchant,category,transaction_date,amount,color) VALUES (?,?,?,?,?,?,?)");
    transactions.forEach(([merchant, category, amount, days, color]) => insertTransaction.run(randomUUID(), userId, merchant, category, isoDate(days), amount, color));
    const insertBudget = db.prepare("INSERT INTO budgets (id,user_id,name,limit_amount,color) VALUES (?,?,?,?,?)");
    budgets.forEach(([name, limit, color]) => insertBudget.run(randomUUID(), userId, name, limit, color));
    const insertGoal = db.prepare("INSERT INTO goals (id,user_id,name,target_amount,saved_amount,monthly_amount,eta,color,probability) VALUES (?,?,?,?,?,?,?,?,?)");
    goals.forEach(values => insertGoal.run(randomUUID(), userId, ...values));
    const insertSubscription = db.prepare("INSERT INTO subscriptions (id,user_id,name,monthly_amount,next_charge,is_used,color) VALUES (?,?,?,?,?,?,?)");
    subscriptions.forEach(values => insertSubscription.run(randomUUID(), userId, ...values));
  });
}
