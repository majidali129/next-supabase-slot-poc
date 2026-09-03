// One-off dev helper: creates a pre-confirmed Supabase user via the admin
// API, bypassing the email-confirmation flow (and its rate limit) so local
// testing doesn't depend on receiving a real email.
//
// Usage: node scripts/create-test-user.mjs
// Writes the generated email/password to .local/test-user.json (gitignored)
// instead of printing the password anywhere.
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const email = `poc-test-${Date.now()}@proton.me`;
const password = randomBytes(18).toString("base64url");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Failed:", error.message);
  process.exit(1);
}

mkdirSync(".local", { recursive: true });
writeFileSync(".local/test-user.json", JSON.stringify({ email, password }, null, 2));

console.log("Created user:", data.user.id, data.user.email, "-> .local/test-user.json");
