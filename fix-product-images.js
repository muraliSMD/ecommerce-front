const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://billing:Bill%401234@cluster0.eqb4ccq.mongodb.net/ecommerce?retryWrites=true&w=majority";

async function fixImages() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB via fix script");

  const productSchema = new mongoose.Schema({}, { strict: false });
  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  const products = await Product.find({ images: { $in: ["https://picsum.photos/200/300"] } });
  
  console.log(`Found ${products.length} products with random images.`);

  for (const p of products) {
      // Use the product ID as a seed to ensure consistent image for this product
      // but different from others.
      const staticImage = `https://picsum.photos/seed/${p._id.toString()}/300/300`;
      
      // If the product has multiple random images, we might want to fix all of them
      // but typically the seed/demo data just has one or arrays of the same random url.
      // We will replace the entire array with one good static image (or multiple with different seeds if needed)
      
      // Let's just create 3 static images for each product to make it look nice
      const newImages = [
          `https://picsum.photos/seed/${p._id.toString()}-1/300/300`,
          `https://picsum.photos/seed/${p._id.toString()}-2/300/300`,
          `https://picsum.photos/seed/${p._id.toString()}-3/300/300`
      ];

      await Product.updateOne({ _id: p._id }, { $set: { images: newImages } });
      console.log(`Updated product ${p._id}`);
  }

  console.log("All products updated.");
  await mongoose.disconnect();
}

fixImages().catch(err => {
    console.error(err);
    process.exit(1);
});
