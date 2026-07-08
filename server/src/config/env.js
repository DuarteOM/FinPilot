import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(serverRoot, ".env") });

const schema = z.object({
  NODE_ENV:          z.enum(["development", "test", "production"]).default("development"),
  PORT:              z.coerce.number().int().positive().default(3001),
  CLIENT_ORIGIN:     z.string().default("http://localhost:5173"),

  // MySQL
  DB_HOST:           z.string().default("127.0.0.1"),
  DB_PORT:           z.coerce.number().int().positive().default(3306),
  DB_NAME:           z.string().default("finpilot"),
  DB_USER:           z.string().default("root"),
  DB_PASSWORD:       z.string().default(""),

  AUTH_SECRET:       z.string().min(24).default("finpilot-dev-secret-change-before-production"),
  TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  GOOGLE_CLIENT_ID:  z.string().optional(),

  OPENAI_API_KEY:      z.string().optional(),
  OPENROUTER_API_KEY:  z.string().optional(),
  OPENROUTER_BASE_URL: z.string().default("https://openrouter.ai/api/v1"),
  OPENAI_MODEL:        z.string().default("gpt-4o"),
});

const parsed = schema.parse(process.env);

if (parsed.NODE_ENV === "production" && parsed.AUTH_SECRET.includes("dev-secret")) {
  throw new Error("AUTH_SECRET tem de ser configurado em produção.");
}

export const env = { ...parsed, serverRoot };
