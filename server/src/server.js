import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/database.js";

const server = app.listen(env.PORT, () =>
  console.log(`FinPilot API disponível em http://localhost:${env.PORT} [MySQL: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}]`)
);

const shutdown = async signal => {
  console.log(`${signal}: a encerrar...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
