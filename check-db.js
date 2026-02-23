const mongoose = require('mongoose');

const mongoUri = "mongodb+srv://billing:Bill%401234@cluster0.eqb4ccq.mongodb.net/ecommerce?retryWrites=true&w=majority";

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String },
  length: { type: String },
  stock: { type: Number, default: 0 },
  price: { type: Number, required: true },
  mrp: { type: Number },
  discount: { type: Number },
  images: { type: [String], default: [] },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  discount: { type: Number },
  hasVariants: { type: Boolean, default: false },
  variants: [variantSchema],
});

// Force schema update in this script
delete mongoose.models.Product;
const Product = mongoose.model('Product', productSchema);

async function checkData() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const products = await Product.find({}).limit(10);
    
    products.forEach(p => {
      console.log(`[${p._id}] ${p.name}`);
      console.log(`  - Single: Price: ${p.price}, MRP: ${p.mrp}, Disc: ${p.discount}`);
      if (p.hasVariants) {
        console.log(`  - Variants:`);
        p.variants.forEach(v => {
          console.log(`    * ${v.color}/${v.size || v.length} -> Price: ${v.price}, MRP: ${v.mrp}, Disc: ${v.discount}`);
        });
      }
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
