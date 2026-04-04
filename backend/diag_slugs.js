
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mens-fashion-store';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const allProducts = await Product.find({}, 'name slug');
    console.log('Total products:', allProducts.length);

    const missingSlug = allProducts.filter(p => !p.slug);
    console.log('Products without slug:', missingSlug.length);

    if (missingSlug.length > 0) {
      console.log('Missing slug products:', JSON.stringify(missingSlug.slice(0, 5), null, 2));
      
      // Auto-fix if missing
      console.log('Attempting to fix missing slugs...');
      for (const p of missingSlug) {
        p.slug = undefined; // Trigger pre-save hook
        await p.save();
      }
      console.log('Fix completed.');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

run();
