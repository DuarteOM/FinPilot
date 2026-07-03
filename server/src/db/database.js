import mysql from "mysql2/promise";
import { env } from "../config/env.js";

// ─── BigInt serialisation fix ─────────────────────────────────────────────────
// mysql2 returns BIGINT UNSIGNED columns as JavaScript BigInt by default.
// This causes "Cannot serialize BigInt" errors and subtle query param issues.
// We override JSON serialisation and coerce all BigInts to Number at the pool level.
// All IDs in this schema fit safely in Number (< 2^53).
BigInt.prototype.toJSON = function () { return Number(this); }; // eslint-disable-line no-extend-native

// ─── Connection pool ──────────────────────────────────────────────────────────
export const pool = mysql.createPool({
  host:               env.DB_HOST,
  port:               env.DB_PORT,
  database:           env.DB_NAME,
  user:               env.DB_USER,
  password:           env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit:    10,
  timezone:           "Z",          // UTC
  decimalNumbers:     true,         // DECIMAL → number, not string
  charset:            "utf8mb4",
  bigNumberStrings:   false,        // keep as JS number where possible
  supportBigNumbers:  true,         // allow big numbers
  namedPlaceholders:  false,
});

// ─── Coerce BigInt values in result rows ──────────────────────────────────────
function coerceBigInts(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return Number(obj);
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(coerceBigInts);
  if (typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = coerceBigInts(v);
    return out;
  }
  return obj;
}

// ─── Safe param coercion ──────────────────────────────────────────────────────
// Ensures any BigInt params passed to queries are converted to Number
function coerceParams(params) {
  return params.map(p => (typeof p === "bigint" ? Number(p) : p));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * query() — uses pool.query() (no prepared statements).
 * Supports subqueries, IN(...), dynamic LIMIT/OFFSET, and complex SQL.
 * Values are escaped safely by mysql2.
 */
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, coerceParams(params));
  return coerceBigInts(rows);
}

/**
 * queryOne() — returns first row or null.
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

/**
 * execute() — uses pool.execute() (prepared statements) for simple INSERT/UPDATE/DELETE.
 * Returns { insertId, affectedRows }.
 * Do NOT use for SELECTs with subqueries or dynamic LIMIT.
 */
export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, coerceParams(params));
  return coerceBigInts(result);
}

/**
 * transaction() — runs multiple operations in a MySQL transaction.
 */
export async function transaction(work) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await work(conn);
    await conn.commit();
    return coerceBigInts(result);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
