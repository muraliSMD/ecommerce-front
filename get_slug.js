const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env.local') });

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI);
};

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ slug: String }));

async function getSlug() {
  await dbConnect();
  const product = await Product.findOne({}).select('slug');
  console.log(product ? product.slug : 'No product found');
  process.exit(0);
}

getSlug();
