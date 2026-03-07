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

async function resetAdminPassword() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to database");

    const email = "grabszy2025@gmail.com";
    const newPassword = "NEW_ADMIN_PASSWORD_HERE"; // User should replace this

    if (newPassword === "NEW_ADMIN_PASSWORD_HERE") {
        console.error("❌ Please replace 'NEW_ADMIN_PASSWORD_HERE' with a real password in the script.");
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { password: hashedPassword, role: 'admin' }, // Ensure role is admin as well
        { new: true, upsert: true } // Create if doesn't exist
    );

    console.log(`✅ Password reset successful for: ${user.email}`);
    console.log(`👤 Role ensured as: ${user.role}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

resetAdminPassword();
