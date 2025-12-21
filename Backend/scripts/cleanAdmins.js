// scripts/cleanAdmins.js
import "dotenv/config";
import connectDB from "../models/db.js";
import Admin from "../models/Admin.js";

async function run() {
  await connectDB();
  const keepId = "69465a7a9ad7c43ebaaa9bb1"; // SUPER_ADMIN id
  const result = await Admin.deleteMany({ _id: { $ne: keepId } });
  console.log("Deleted admins count:", result.deletedCount);
  process.exit(0);
}

run();
