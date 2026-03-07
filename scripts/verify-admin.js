const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}

// User Schema (simplified for script)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function verifyAdmin() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to database");

    const email = "grabszy2025@gmail.com";
    const password = "ADMIN_PASSWORD_HERE"; // User should replace this

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(0);
    }

    console.log(`✅ User found: ${user.email}`);
    console.log(`👤 Role: ${user.role}`);

    if (user.role !== 'admin') {
      console.log("⚠️  Warning: User is NOT an admin!");
    }

    const { data: { adminPassword } } = { data: { adminPassword: password } }; // Just a placeholder for the logic below

    // If the user wants to check a specific password
    if (password !== "ADMIN_PASSWORD_HERE") {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        console.log("✅ Password matches the hash in the database.");
      } else {
        console.log("❌ Password DOES NOT match the hash in the database.");
      }
    } else {
      console.log("ℹ️  To verify the password, replace 'ADMIN_PASSWORD_HERE' with the real password in the script.");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

verifyAdmin();
