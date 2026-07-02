import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { env } from "../config/env.js";
import { schema } from "./schema.js";

fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });

export const db = new DatabaseSync(env.databasePath);
db.exec(schema);

export function transaction(work) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
