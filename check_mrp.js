const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = "mongodb+srv://billing:Bill%401234@cluster0.eqb4ccq.mongodb.net/ecommerce?retryWrites=true&w=majority";

async function checkCollections() {
  let output = '';
  const log = (msg) => { output += msg + '\n'; console.log(msg); };

  try {
    await mongoose.connect(MONGODB_URI);
    log("Connected to MongoDB");

    const collections = await mongoose.connection.db.listCollections().toArray();
    log(`Found ${collections.length} collections:`);

    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      log(`  ${col.name}: ${count} documents`);
    }

    if (mongoose.connection.db.collection('products')) {
        const product = await mongoose.connection.db.collection('products').findOne();
        if (product) {
            log('Sample Product from raw collection:');
            log(JSON.stringify(product, null, 2));
        }
    }

    fs.writeFileSync('mrp_check_output.txt', output);
    log("Output written to mrp_check_output.txt");

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkCollections();
