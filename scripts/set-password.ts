import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: pnpm set-password <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log("\nAdd this to your .env.local:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log();
