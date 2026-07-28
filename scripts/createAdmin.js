/* ================================================================
   createAdmin.js
   Since public registration can no longer grant the "admin" role
   (fixed as a privilege-escalation hole), use this one-off script
   to create the first admin account, or promote an existing user.

   Usage:
     node scripts/createAdmin.js admin@agrilink.com "Admin Name" "StrongPassw0rd!"

   If a user with that email already exists, it's promoted to admin
   (password left unchanged). Otherwise a new admin user is created.
================================================================ */
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config({ quiet: true });

const [, , email, name, password] = process.argv;

if (!email) {
  console.log("Usage: node scripts/createAdmin.js <email> [name] [password]");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`✅ Promoted existing user "${existing.email}" to admin.`);
  } else {
    if (!name || !password) {
      console.log("New user — please supply name and password too:");
      console.log('  node scripts/createAdmin.js admin@agrilink.com "Admin Name" "StrongPassw0rd!"');
      process.exit(1);
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: "admin" });
    console.log(`✅ Created new admin account: ${user.email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error("❌ Failed to create/promote admin:", err.message);
  process.exit(1);
});
