import mysql from "mysql2/promise";
import { env } from "../config/env.js";

// ─── Connection pool ──────────────────────────────────────────────────────────
export const pool = mysql.createPool({
  host:               env.DB_HOST,
  port:               env.DB_PORT,
  database:           env.DB_NAME,
  user:               env.DB_USER,
  password:           env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit:    10,
  timezone:           "Z",        // UTC
  decimalNumbers:     true,       // DECIMAL → number, não string
  charset:            "utf8mb4",
  namedPlaceholders:  false,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * query() — usa pool.query() (sem prepared statements).
 * Suporta subqueries, IN(...), LIMIT/OFFSET misturados, e qualquer SQL complexo.
 * Os valores são escapados pelo mysql2 de forma segura.
 */
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * queryOne() — devolve a primeira linha ou null.
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

/**
 * execute() — usa pool.execute() (prepared statements) para INSERTs/UPDATEs/DELETEs simples.
 * Devolve { insertId, affectedRows }.
 * Não usar para SELECTs com subqueries ou LIMIT dinâmico.
 */
export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

/**
 * transaction() — corre várias operações numa transação MySQL.
 * Usa pool.query() internamente para compatibilidade máxima.
 */
export async function transaction(work) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
