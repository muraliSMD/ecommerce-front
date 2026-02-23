const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://billing:Bill%401234@cluster0.eqb4ccq.mongodb.net/ecommerce?retryWrites=true&w=majority";

const productSchema = new mongoose.Schema({
  name: String,
  mrp: Number,
  price: Number,
  slug: String
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

async function update() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update the first product found to have MRP
    const product = await Product.findOne();
    if (product) {
      console.log(`Updating product: ${product.name}`);
      const updated = await Product.findByIdAndUpdate(product._id, { 
        $set: { mrp: product.price * 5 } // Make MRP 5x higher for clear verification
      }, { new: true });
      console.log(`Updated product ${updated.name} with MRP: ${updated.mrp}`);
    } else {
      console.log("No products found");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

update();
