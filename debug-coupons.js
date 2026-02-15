const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8').split('\n');
    envConfig.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            process.env[key] = value;
        }
    });
}

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

async function debugCoupons() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const coupons = await Coupon.find({});
        console.log(`Found ${coupons.length} coupons:`);
        
        const now = new Date();
        console.log("Current Server Time:", now.toISOString());

        coupons.forEach(c => {
            const isExpired = c.expiryDate && new Date(c.expiryDate) < now;
            console.log(`
            Code: ${c.code}
            Active: ${c.isActive}
            Expiry: ${c.expiryDate ? c.expiryDate.toISOString() : 'None'} (${isExpired ? 'Expired' : 'Valid'})
            Usage: ${c.usedCount} / ${c.usageLimit || 'Unlimited'}
            `);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

debugCoupons();
