import { db } from "../db/database.js";

export function getFinancialContext(userId) {
  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS income,
      ABS(COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0)) AS expenses
    FROM transactions WHERE user_id = ? AND transaction_date >= date('now', '-90 days')
  `).get(userId);
  const categories = db.prepare(`
    SELECT category, ROUND(ABS(SUM(amount)), 2) AS spent
    FROM transactions WHERE user_id = ? AND amount < 0 AND transaction_date >= date('now', '-90 days')
    GROUP BY category ORDER BY spent DESC LIMIT 8
  `).all(userId);
  const budgets = db.prepare(`
    SELECT b.name, b.limit_amount AS limitAmount,
      ROUND(ABS(COALESCE(SUM(t.amount), 0)), 2) AS spentAmount
    FROM budgets b LEFT JOIN transactions t
      ON t.user_id=b.user_id AND t.category=b.name AND t.amount<0
      AND substr(t.transaction_date,1,7)=strftime('%Y-%m','now')
    WHERE b.user_id=? GROUP BY b.id ORDER BY b.name
  `).all(userId);
  const goals = db.prepare("SELECT name, target_amount AS targetAmount, saved_amount AS savedAmount, monthly_amount AS monthlyAmount FROM goals WHERE user_id=?").all(userId);
  const subscriptions = db.prepare("SELECT name, monthly_amount AS monthlyAmount, is_used AS isUsed FROM subscriptions WHERE user_id=? AND is_active=1").all(userId);
  return { totals, categories, budgets, goals, subscriptions };
}

export function getDashboard(userId) {
  const context = getFinancialContext(userId);
  const recentTransactions = db.prepare("SELECT id,merchant,category,transaction_date AS date,amount,color FROM transactions WHERE user_id=? ORDER BY transaction_date DESC, created_at DESC LIMIT 8").all(userId);
  const activeSubscriptions = context.subscriptions.map(item => ({ ...item, isUsed: Boolean(item.isUsed) }));
  return {
    ...context,
    balance: Number((context.totals.income - context.totals.expenses).toFixed(2)),
    recentTransactions,
    subscriptions: activeSubscriptions,
  };
}

export function getReports(userId, months = 7) {
  const trend = db.prepare(`
    SELECT strftime('%Y-%m', transaction_date) AS month,
      ROUND(SUM(CASE WHEN amount>0 THEN amount ELSE 0 END),2) AS income,
      ROUND(ABS(SUM(CASE WHEN amount<0 THEN amount ELSE 0 END)),2) AS expenses
    FROM transactions WHERE user_id=? AND transaction_date >= date('now', ?)
    GROUP BY month ORDER BY month
  `).all(userId, `-${months} months`).map(row => ({ ...row, saved: Number((row.income-row.expenses).toFixed(2)) }));
  const categories = db.prepare(`SELECT category AS name, ROUND(ABS(SUM(amount)),2) AS value FROM transactions WHERE user_id=? AND amount<0 AND transaction_date>=date('now',?) GROUP BY category ORDER BY value DESC`).all(userId, `-${months} months`);
  return { trend, categories };
}
