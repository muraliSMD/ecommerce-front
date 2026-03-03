const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/ecomerce-application', {
  });
  
  const Product = require('./src/models/Product').default || require('./src/models/Product');
  const Collection = require('./src/models/Collection').default || require('./src/models/Collection');

  const collections = await Collection.find();
  console.log("Collections:", collections.map(c => ({id: c._id, name: c.name})));

  const products = await Product.find({ collections: { $exists: true, $ne: [] } });
  console.log("Products with collections:", products.map(p => ({
      name: p.name,
      collections: p.collections
  })));

  mongoose.disconnect();
}

test().catch(console.error);
