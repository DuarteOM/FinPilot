import { query, queryOne } from "../db/database.js";

// ─── Financial context for AI ─────────────────────────────────────────────────

export async function getFinancialContext(userId) {
  // Total income / expenses last 90 days (across all user accounts)
  const totals = await queryOne(
    `SELECT
       COALESCE(SUM(CASE WHEN t.transaction_type = 'income'  THEN t.total_amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.total_amount ELSE 0 END), 0) AS expenses
     FROM transactions t
     JOIN accounts a ON a.account_id = t.account_id
     WHERE a.user_id = ?
       AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
       AND t.status = 'completed'`,
    [userId]
  );

  // Spending by category last 90 days
  const categories = await query(
    `SELECT c.name AS category, ROUND(SUM(ti.amount), 2) AS spent
     FROM transaction_items ti
     JOIN categories c ON c.category_id = ti.category_id
     JOIN transactions t ON t.transaction_id = ti.transaction_id
     JOIN accounts a ON a.account_id = t.account_id
     WHERE a.user_id = ?
       AND t.transaction_type = 'expense'
       AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
       AND t.status = 'completed'
     GROUP BY c.category_id, c.name
     ORDER BY spent DESC
     LIMIT 8`,
    [userId]
  );

  // Active budgets with current spend
  const budgets = await query(
    `SELECT b.name, b.amount AS limitAmount,
       COALESCE(
         (SELECT ROUND(SUM(ti2.amount), 2)
          FROM transaction_items ti2
          JOIN transactions t2 ON t2.transaction_id = ti2.transaction_id
          JOIN accounts a2 ON a2.account_id = t2.account_id
          JOIN budget_categories bc ON bc.category_id = ti2.category_id AND bc.budget_id = b.budget_id
          WHERE a2.user_id = ?
            AND t2.transaction_type = 'expense'
            AND t2.transaction_date BETWEEN b.start_date AND b.end_date
         ), 0
       ) AS spentAmount
     FROM budgets b
     WHERE b.user_id = ? AND b.is_active = 1
     ORDER BY b.name`,
    [userId, userId]
  );

  // Active goals
  const goals = await query(
    `SELECT name, target_amount AS targetAmount, current_amount AS currentAmount,
            target_date AS targetDate, priority
     FROM goals WHERE user_id = ? AND status = 'active'`,
    [userId]
  );

  // Active subscriptions
  const subscriptions = await query(
    `SELECT name, amount, billing_cycle AS billingCycle, next_payment AS nextPayment
     FROM subscriptions WHERE user_id = ? AND status = 'active'`,
    [userId]
  );

  // Account balances
  const accounts = await query(
    `SELECT a.name, a.balance, at.name AS type
     FROM accounts a
     JOIN account_types at ON at.account_type_id = a.account_type_id
     WHERE a.user_id = ? AND a.is_archived = 0`,
    [userId]
  );

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  return { totals, categories, budgets, goals, subscriptions, accounts, totalBalance };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard(userId) {
  const context = await getFinancialContext(userId);

  // 5 most recent transactions
  const recentTransactions = await query(
    `SELECT t.transaction_id AS id, t.transaction_type AS type, t.merchant,
            t.total_amount AS totalAmount, t.transaction_date AS date,
            t.status,
            a.name AS accountName,
            (SELECT c.name FROM transaction_items ti JOIN categories c ON c.category_id = ti.category_id
             WHERE ti.transaction_id = t.transaction_id LIMIT 1) AS categoryName,
            (SELECT c.color FROM transaction_items ti JOIN categories c ON c.category_id = ti.category_id
             WHERE ti.transaction_id = t.transaction_id LIMIT 1) AS categoryColor
     FROM transactions t
     JOIN accounts a ON a.account_id = t.account_id
     WHERE a.user_id = ? AND t.status = 'completed'
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT 8`,
    [userId]
  );

  // Upcoming subscription payments (next 30 days)
  const upcomingSubscriptions = await query(
    `SELECT name, amount, billing_cycle AS billingCycle, next_payment AS nextPayment
     FROM subscriptions
     WHERE user_id = ? AND status = 'active'
       AND next_payment <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
     ORDER BY next_payment ASC
     LIMIT 5`,
    [userId]
  );

  // Unread notifications count
  const notifCount = await queryOne(
    "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId]
  );

  return {
    ...context,
    recentTransactions,
    upcomingSubscriptions,
    unreadNotifications: notifCount?.total ?? 0,
  };
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function getReports(userId, months = 7) {
  // Monthly income vs expenses trend
  const trend = await query(
    `SELECT DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
       ROUND(SUM(CASE WHEN t.transaction_type = 'income'  THEN t.total_amount ELSE 0 END), 2) AS income,
       ROUND(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.total_amount ELSE 0 END), 2) AS expenses
     FROM transactions t
     JOIN accounts a ON a.account_id = t.account_id
     WHERE a.user_id = ?
       AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
       AND t.status = 'completed'
     GROUP BY month
     ORDER BY month ASC`,
    [userId, months]
  );

  const trendWithSaved = trend.map(row => ({
    ...row,
    saved: Number((row.income - row.expenses).toFixed(2)),
  }));

  // Spending by category
  const categories = await query(
    `SELECT c.name, ROUND(SUM(ti.amount), 2) AS value, c.color
     FROM transaction_items ti
     JOIN categories c ON c.category_id = ti.category_id
     JOIN transactions t ON t.transaction_id = ti.transaction_id
     JOIN accounts a ON a.account_id = t.account_id
     WHERE a.user_id = ?
       AND t.transaction_type = 'expense'
       AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
       AND t.status = 'completed'
     GROUP BY c.category_id, c.name, c.color
     ORDER BY value DESC`,
    [userId, months]
  );

  // Top merchants
  const topMerchants = await query(
    `SELECT t.merchant, ROUND(SUM(t.total_amount), 2) AS total, COUNT(*) AS count
     FROM transactions t
     JOIN accounts a ON a.account_id = t.account_id
     WHERE a.user_id = ?
       AND t.transaction_type = 'expense'
       AND t.merchant IS NOT NULL
       AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
       AND t.status = 'completed'
     GROUP BY t.merchant
     ORDER BY total DESC
     LIMIT 5`,
    [userId, months]
  );

  return { trend: trendWithSaved, categories, topMerchants };
}
