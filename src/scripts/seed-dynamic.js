
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define Schemas locally to avoid import issues in standalone script
const heroSlideSchema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  link: { type: String, default: "/shop" },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const HeroSlide = mongoose.models.HeroSlide || mongoose.model("HeroSlide", heroSlideSchema);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/grabszy_ecommerce";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB via seed script");

  // Seed Hero Slides
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070",
      title: "Summer Collection 2026",
      subtitle: "Discover the hottest trends for the season.",
      link: "/shop?category=Summer",
      order: 1,
      isActive: true
    },
    {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070",
      title: "New Arrivals",
      subtitle: "Fresh styles just landed.",
      link: "/shop?sort=newest",
      order: 2,
      isActive: true
    },
    {
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071",
      title: "Exclusive Deals",
      subtitle: "Up to 50% off on selected items.",
      link: "/shop?sort=price_asc",
      order: 3,
      isActive: true
    }
  ];

  await HeroSlide.deleteMany({});
  await HeroSlide.insertMany(slides);
  console.log("Hero Slides seeded");

  // Update some products to be featured
  // We need to use valid ObjectIds or update existing ones. 
  // For simplicity, we'll try to update random 4 products to be featured if products exist.
  // Note: We can't easily import the Product model here without full context, 
  // so we will trust the app usage or manual update for now, OR we can define crude schema.
  
  const productSchema = new Schema({}, { strict: false });
  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
  
  const products = await Product.find().limit(10);
  if (products.length > 0) {
      const updatePromises = products.slice(0, 4).map(p => 
          Product.updateOne({ _id: p._id }, { $set: { isFeatured: true } })
      );
      await Promise.all(updatePromises);
      console.log("Updated 4 products to be featured");
  } else {
      console.log("No products found to mark as featured");
  }

  await mongoose.disconnect();
  console.log("Seed complete");
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
