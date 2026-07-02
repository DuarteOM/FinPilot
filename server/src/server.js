import { app } from "./app.js";
import { env } from "./config/env.js";

const server=app.listen(env.PORT,()=>console.log(`FinPilot API disponível em http://localhost:${env.PORT}`));

const shutdown=signal=>{console.log(`${signal}: a encerrar...`);server.close(()=>process.exit(0));};
process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));
