const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://billing:Bill%401234@cluster0.eqb4ccq.mongodb.net/ecommerce?retryWrites=true&w=majority";

async function checkImages() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const productSchema = new mongoose.Schema({}, { strict: false });
  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  const products = await Product.find({}, { name: 1, images: 1 }).limit(10);
  
  console.log("Checking first 10 products:");
  products.forEach(p => {
      console.log(`Product: ${p.name}`);
      console.log(`Images: ${JSON.stringify(p.images)}`);
  });

  await mongoose.disconnect();
}

checkImages().catch(console.error);
