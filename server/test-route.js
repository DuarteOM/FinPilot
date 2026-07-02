import { query, queryOne } from "./src/db/database.js";

// Simulates exactly what GET /api/transactions does for user_id=1
const userId = 1;

try {
  const limit  = 100;
  const offset = 0;

  const conditions = ["t.account_id IN (SELECT account_id FROM accounts WHERE user_id = ?)"];
  const params     = [userId];

  const where = conditions.join(" AND ");

  const rows = await query(
    `SELECT t.transaction_id AS id, t.transaction_type AS type, t.description,
            t.total_amount AS totalAmount, t.transaction_date AS date,
            t.merchant, t.location, t.notes, t.status,
            a.name AS accountName, pm.name AS paymentMethod
     FROM transactions t
     JOIN accounts a ON a.account_id = t.account_id
     LEFT JOIN payment_methods pm ON pm.payment_method_id = t.payment_method_id
     WHERE ${where}
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  console.log(`✅ ${rows.length} transações encontradas`);

  // This is where the 500 might happen — IN () with array of ids
  const txIds = rows.map(r => r.id);
  console.log("txIds:", txIds);

  let items = [];
  if (txIds.length) {
    const placeholders = txIds.map(() => "?").join(",");
    items = await query(
      `SELECT ti.item_id AS id, ti.transaction_id AS transactionId,
              ti.category_id AS categoryId, c.name AS categoryName, c.color AS categoryColor,
              c.icon AS categoryIcon, ti.description, ti.amount
       FROM transaction_items ti
       JOIN categories c ON c.category_id = ti.category_id
       WHERE ti.transaction_id IN (${placeholders})`,
      txIds
    );
    console.log(`✅ ${items.length} items encontrados`);
  }

  const itemsByTx = items.reduce((acc, item) => {
    (acc[item.transactionId] ||= []).push(item);
    return acc;
  }, {});

  const result = rows.map(r => ({ ...r, items: itemsByTx[r.id] || [] }));
  console.log("✅ Resultado final:", JSON.stringify(result[0], null, 2));

} catch (err) {
  console.error("❌ ERRO na rota:", err.message);
  console.error(err.stack);
} finally {
  process.exit(0);
}
