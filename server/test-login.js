import { query, queryOne, execute } from "./src/db/database.js";
import { hashPassword, verifyPassword, createToken } from "./src/utils/auth.js";

const testEmail = "j@gmail.com";

try {
  console.log("1. Testar ligação...");
  const ping = await query("SELECT 1 AS ok");
  console.log("✅ DB OK");

  console.log("2. Testar login query...");
  const user = await queryOne(
    "SELECT user_id, first_name, last_name, email, password_hash FROM users WHERE email = ? AND is_active = 1",
    [testEmail]
  );
  console.log("✅ User:", user ? `${user.first_name} ${user.last_name} (id=${user.user_id})` : "NÃO ENCONTRADO");

  if (user) {
    console.log("3. Testar verifyPassword...");
    const ok = verifyPassword("20080831DOm", user.password_hash);
    console.log("✅ Password válida:", ok);

    if (ok) {
      const token = createToken(user.user_id);
      console.log("✅ Token criado:", token.slice(0, 30) + "...");
    }
  }

  console.log("4. Testar INSERT (execute)...");
  // Test a simple execute to make sure writes still work
  const r = await execute("UPDATE users SET updated_at = NOW() WHERE user_id = ?", [user?.user_id ?? 0]);
  console.log("✅ Execute OK, affectedRows:", r.affectedRows);

} catch (err) {
  console.error("❌ ERRO:", err.message);
  console.error(err.stack);
} finally {
  process.exit(0);
}
