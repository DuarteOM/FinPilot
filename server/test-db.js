import { query } from "./src/db/database.js";

try {
  // 1. Basic DB connection
  const ping = await query("SELECT 1 AS ok");
  console.log("✅ DB conectada:", ping);

  // 2. Check tables exist
  const tables = await query("SHOW TABLES");
  console.log("✅ Tabelas:", tables.map(t => Object.values(t)[0]).join(", "));

  // 3. Check users
  const users = await query("SELECT user_id, email FROM users LIMIT 3");
  console.log("✅ Utilizadores:", users);

  if (users.length > 0) {
    const uid = users[0].user_id;

    // 4. Check accounts for first user
    const accounts = await query("SELECT account_id, name FROM accounts WHERE user_id = ?", [uid]);
    console.log("✅ Contas:", accounts);

    if (accounts.length > 0) {
      // 5. Try the exact transactions query
      const txs = await query(
        `SELECT t.transaction_id AS id, t.transaction_type AS type, t.description,
                t.total_amount AS totalAmount, t.transaction_date AS date,
                t.merchant, t.status,
                a.name AS accountName
         FROM transactions t
         JOIN accounts a ON a.account_id = t.account_id
         WHERE a.user_id = ?
         ORDER BY t.transaction_date DESC LIMIT 5`,
        [uid]
      );
      console.log("✅ Transações:", txs);
    } else {
      console.log("⚠️  Utilizador sem contas");
    }
  }
} catch (err) {
  console.error("❌ ERRO:", err.message);
  console.error(err);
} finally {
  process.exit(0);
}
