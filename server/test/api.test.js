import assert from "node:assert/strict";
import { after, before, test } from "node:test";

process.env.NODE_ENV = "test";
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "finpilot-test-secret-with-enough-characters";

let request;
let app;
let pool;
let query;
let execute;
let token;
let email;

async function cleanupAuditUser() {
  if (!email) return;

  const user = await query("SELECT user_id FROM users WHERE email = ?", [email]).then(rows => rows[0]);
  if (!user) return;

  const userId = user.user_id;
  const accountIds = (await query("SELECT account_id FROM accounts WHERE user_id = ?", [userId])).map(r => r.account_id);
  const goalIds = (await query("SELECT goal_id FROM goals WHERE user_id = ?", [userId])).map(r => r.goal_id);
  const budgetIds = (await query("SELECT budget_id FROM budgets WHERE user_id = ?", [userId])).map(r => r.budget_id);
  const convIds = (await query("SELECT conversation_id FROM ai_conversations WHERE user_id = ?", [userId])).map(r => r.conversation_id);

  if (accountIds.length) {
    const txIds = (await query(
      `SELECT transaction_id FROM transactions WHERE account_id IN (${accountIds.map(() => "?").join(",")})`,
      accountIds,
    )).map(r => r.transaction_id);

    if (txIds.length) {
      await execute(`DELETE FROM transaction_items WHERE transaction_id IN (${txIds.map(() => "?").join(",")})`, txIds);
      await execute(`DELETE FROM transactions WHERE transaction_id IN (${txIds.map(() => "?").join(",")})`, txIds);
    }
  }

  if (goalIds.length) {
    await execute(`DELETE FROM goal_contributions WHERE goal_id IN (${goalIds.map(() => "?").join(",")})`, goalIds);
  }

  if (budgetIds.length) {
    await execute(`DELETE FROM budget_categories WHERE budget_id IN (${budgetIds.map(() => "?").join(",")})`, budgetIds);
  }

  if (convIds.length) {
    await execute(`DELETE FROM ai_messages WHERE conversation_id IN (${convIds.map(() => "?").join(",")})`, convIds);
    await execute(`DELETE FROM ai_conversations WHERE conversation_id IN (${convIds.map(() => "?").join(",")})`, convIds);
  }

  await execute("DELETE FROM notifications WHERE user_id = ?", [userId]);
  await execute("DELETE FROM subscriptions WHERE user_id = ?", [userId]);
  await execute("DELETE FROM budgets WHERE user_id = ?", [userId]);
  await execute("DELETE FROM goals WHERE user_id = ?", [userId]);
  await execute("DELETE FROM categories WHERE user_id = ?", [userId]);
  await execute("DELETE FROM accounts WHERE user_id = ?", [userId]);
  await execute("DELETE FROM user_settings WHERE user_id = ?", [userId]);
  await execute("DELETE FROM users WHERE user_id = ?", [userId]);
}

before(async () => {
  email = `finpilot.test.${Date.now()}@example.pt`;
  ({ default: request } = await import("supertest"));
  ({ app } = await import("../src/app.js"));
  ({ pool, query, execute } = await import("../src/db/database.js"));
});

after(async () => {
  await cleanupAuditUser();
  await pool.end();
});

test("health check verifies the database connection", async () => {
  const response = await request(app).get("/api/health").expect(200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.db, "mysql");
});

test("register creates a usable account and duplicate register returns 409", async () => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({ firstName: "Maria", lastName: "Teste", email, password: "segredo123" })
    .expect(201);

  token = response.body.token;
  assert.ok(token);
  assert.equal(response.body.user.email, email);

  await request(app)
    .post("/api/auth/register")
    .send({ firstName: "Maria", lastName: "Teste", email, password: "segredo123" })
    .expect(409);
});

test("login accepts valid credentials and rejects invalid credentials", async () => {
  await request(app)
    .post("/api/auth/login")
    .send({ email, password: "errada123" })
    .expect(401);

  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "segredo123" })
    .expect(200);

  assert.ok(response.body.token);
});

test("authenticated financial resources are available", async () => {
  const response = await request(app)
    .get("/api/dashboard")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(response.body.recentTransactions));
});

test("transaction CRUD works with the current API contract", async () => {
  const accounts = await request(app)
    .get("/api/accounts")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  const categories = await request(app)
    .get("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  const accountId = accounts.body.accounts[0].id;
  const categoryId = categories.body.categories.find(c => c.type === "expense")?.id ?? categories.body.categories[0].id;

  const created = await request(app)
    .post("/api/transactions")
    .set("Authorization", `Bearer ${token}`)
    .send({
      accountId,
      transactionType: "expense",
      description: "Teste",
      totalAmount: 12.5,
      transactionDate: "2026-07-02",
      merchant: "Teste",
      status: "completed",
      items: [{ categoryId, description: "Teste", amount: 12.5 }],
    })
    .expect(201);

  await request(app)
    .delete(`/api/transactions/${created.body.transaction.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(204);
});

test("AI rejects messages that are not relevant to the app", async () => {
  const response = await request(app)
    .post("/api/ai/chat")
    .set("Authorization", `Bearer ${token}`)
    .send({ message: "Diz-me uma piada" })
    .expect(400);

  assert.match(response.body.error, /finanças|FinPilot/i);
});

test("AI explains missing configuration when no key is configured", async () => {
  if (process.env.OPENAI_API_KEY) return;

  const response = await request(app)
    .post("/api/ai/chat")
    .set("Authorization", `Bearer ${token}`)
    .send({ message: "Quanto poupei?" })
    .expect(503);

  assert.match(response.body.error, /não está configurada/i);
});
