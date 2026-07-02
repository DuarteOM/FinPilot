import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, before, test } from "node:test";

const databasePath=path.resolve(`data/test-${process.pid}.db`);
process.env.NODE_ENV="test";
process.env.DATABASE_PATH=`./data/test-${process.pid}.db`;
process.env.AUTH_SECRET="finpilot-test-secret-with-enough-characters";

let request;
let app;
let token;

before(async()=>{
  fs.rmSync(databasePath,{force:true});
  ({default:request}=await import("supertest"));
  ({app}=await import("../src/app.js"));
});

after(async()=>{const {db}=await import("../src/db/database.js");db.close();fs.rmSync(databasePath,{force:true});});

test("health check",async()=>{const response=await request(app).get("/api/health").expect(200);assert.equal(response.body.status,"ok");});
test("register creates a usable account",async()=>{const response=await request(app).post("/api/auth/register").send({name:"Maria Teste",email:"maria@example.pt",password:"segredo123"}).expect(201);token=response.body.token;assert.ok(token);});
test("authenticated financial resources are available",async()=>{const response=await request(app).get("/api/dashboard").set("Authorization",`Bearer ${token}`).expect(200);assert.ok(response.body.recentTransactions.length>0);});
test("transaction CRUD",async()=>{const created=await request(app).post("/api/transactions").set("Authorization",`Bearer ${token}`).send({merchant:"Teste",category:"Outros",date:"2026-07-02",amount:-12.5,color:"#5DCAA5"}).expect(201);await request(app).delete(`/api/transactions/${created.body.transaction.id}`).set("Authorization",`Bearer ${token}`).expect(204);});
test("AI explains missing configuration",async()=>{const response=await request(app).post("/api/ai/chat").set("Authorization",`Bearer ${token}`).send({message:"Quanto poupei?"}).expect(503);assert.match(response.body.error,/não está configurada/i);});
