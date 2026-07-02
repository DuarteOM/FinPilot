import { execute, transaction, queryOne } from "../db/database.js";

const isoDate = daysAgo => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

/**
 * Seeds demo data for a newly registered user.
 * Creates a default checking account, global categories (if missing),
 * sample transactions, budgets, goals and subscriptions.
 */
export async function seedDemoData(userId) {
  await transaction(async conn => {

    // ── 1. Default account ─────────────────────────────────────────────────
    const [accResult] = await conn.execute(
      "INSERT INTO accounts (user_id, account_type_id, name, institution, balance, color, is_default) VALUES (?, 1, 'Conta Principal', 'Banco Demo', 2400.00, '#5DCAA5', 1)",
      [userId]
    );
    const accountId = accResult.insertId;

    // ── 2. Ensure global categories exist (idempotent) ────────────────────
    const globalCats = [
      ["Restauração",  "utensils",     "#E8A33D", "expense"],
      ["Supermercado", "shopping-bag", "#5DCAA5", "expense"],
      ["Transportes",  "car",          "#7F8FE4", "expense"],
      ["Combustível",  "fuel",         "#7F8FE4", "expense"],
      ["Subscrições",  "film",         "#D4537E", "expense"],
      ["Casa",         "home",         "#888780", "expense"],
      ["Saúde",        "heart-pulse",  "#5DCAA5", "expense"],
      ["Compras",      "bag",          "#7F8FE4", "expense"],
      ["Lazer",        "smile",        "#D4537E", "expense"],
      ["Salário",      "briefcase",    "#5DCAA5", "income"],
      ["Freelance",    "laptop",       "#5DCAA5", "income"],
    ];

    const catIds = {};
    for (const [name, icon, color, type] of globalCats) {
      let row = (await conn.execute(
        "SELECT category_id FROM categories WHERE name = ? AND user_id IS NULL",
        [name]
      ))[0][0];

      if (!row) {
        const [r] = await conn.execute(
          "INSERT INTO categories (user_id, name, icon, color, type) VALUES (NULL, ?, ?, ?, ?)",
          [name, icon, color, type]
        );
        catIds[name] = r.insertId;
      } else {
        catIds[name] = row.category_id;
      }
    }

    // ── 3. Sample transactions ─────────────────────────────────────────────
    const txSamples = [
      // [type, merchant, totalAmount, daysAgo, categoryName]
      ["income",  "Salário — Acme Lda",   2400,   3,  "Salário"],
      ["expense", "Continente",            64.2,   0,  "Supermercado"],
      ["expense", "Netflix",               12.99,  1,  "Subscrições"],
      ["expense", "Galp",                  45.0,   2,  "Combustível"],
      ["expense", "Cervejaria Ramiro",     38.5,   4,  "Restauração"],
      ["expense", "Worten",               129.9,   6,  "Compras"],
      ["expense", "Spotify",                9.99,  8,  "Subscrições"],
      ["expense", "Renda — Julho",        850.0,  10,  "Casa"],
      ["expense", "Fitness Hut",           34.9,  12,  "Saúde"],
      ["income",  "Freelance — Projeto X", 380,   14,  "Freelance"],
    ];

    for (const [type, merchant, amount, daysAgo, catName] of txSamples) {
      const [txRes] = await conn.execute(
        "INSERT INTO transactions (account_id, transaction_type, description, total_amount, transaction_date, merchant, status) VALUES (?, ?, ?, ?, ?, ?, 'completed')",
        [accountId, type, merchant, amount, isoDate(daysAgo), merchant]
      );
      const txId = txRes.insertId;

      await conn.execute(
        "INSERT INTO transaction_items (transaction_id, category_id, amount) VALUES (?, ?, ?)",
        [txId, catIds[catName], amount]
      );

      // Update account balance
      const delta = type === "expense" ? -amount : amount;
      await conn.execute("UPDATE accounts SET balance = balance + ? WHERE account_id = ?", [delta, accountId]);
    }

    // ── 4. Sample budgets ──────────────────────────────────────────────────
    const now        = new Date();
    const startDate  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const endDate    = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const budgetSamples = [
      ["Restauração",  300,  "#E8A33D", "Restauração"],
      ["Transportes",  150,  "#7F8FE4", "Transportes"],
      ["Lazer",        200,  "#D4537E", "Lazer"],
      ["Supermercado", 380,  "#5DCAA5", "Supermercado"],
      ["Casa",        1000,  "#888780", "Casa"],
    ];

    for (const [name, amount, color, catName] of budgetSamples) {
      const [bRes] = await conn.execute(
        "INSERT INTO budgets (user_id, name, amount, start_date, end_date, alert_percentage, color, is_active) VALUES (?, ?, ?, ?, ?, 80, ?, 1)",
        [userId, name, amount, startDate, endDate, color]
      );
      if (catIds[catName]) {
        await conn.execute(
          "INSERT INTO budget_categories (budget_id, category_id) VALUES (?, ?)",
          [bRes.insertId, catIds[catName]]
        );
      }
    }

    // ── 5. Sample goals ────────────────────────────────────────────────────
    const goalSamples = [
      ["Entrada para casa",   20000, 8400,  "2027-10-01", "high",   "#5DCAA5", "home"],
      ["Viagem ao Japão",      3200, 1180,  "2027-03-01", "medium", "#7F8FE4", "plane"],
      ["Fundo de emergência",  6000, 2600,  "2027-01-01", "high",   "#E8A33D", "shield"],
    ];

    for (const [name, target, current, targetDate, priority, color, icon] of goalSamples) {
      await conn.execute(
        "INSERT INTO goals (user_id, name, target_amount, current_amount, target_date, priority, color, icon, status) VALUES (?,?,?,?,?,?,?,?,'active')",
        [userId, name, target, current, targetDate, priority, color, icon]
      );
    }

    // ── 6. Sample subscriptions ────────────────────────────────────────────
    const subSamples = [
      ["Netflix",   null, 12.99, "monthly",  "2026-08-03", "active"],
      ["Spotify",   null,  9.99, "monthly",  "2026-08-07", "active"],
      ["Adobe CC",  null, 24.59, "monthly",  "2026-08-12", "active"],
      ["iCloud+",   null,  2.99, "monthly",  "2026-08-15", "active"],
    ];

    const subCatId = catIds["Subscrições"] ?? null;
    for (const [name, provider, amount, cycle, nextPayment, status] of subSamples) {
      await conn.execute(
        "INSERT INTO subscriptions (user_id, account_id, category_id, name, provider, amount, billing_cycle, next_payment, auto_renew, reminder_days, status) VALUES (?,?,?,?,?,?,?,?,1,3,?)",
        [userId, accountId, subCatId, name, provider, amount, cycle, nextPayment, status]
      );
    }

    // ── 7. Welcome notification ────────────────────────────────────────────
    await conn.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Bem-vindo ao FinPilot!', 'A tua conta foi criada com dados de demonstração. Explora as funcionalidades e personaliza tudo ao teu gosto.', 'info')",
      [userId]
    );
  });
}
