'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/database');

const listData = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected.');
    
    const categories = await Category.find();
    console.log(`Found ${categories.length} categories.`);
    
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat._id });
      console.log(`CAT_ID: ${cat._id} | NAME: ${cat.name} | COUNT: ${count}`);
    }
    
    const totalProducts = await Product.countDocuments();
    console.log(`\nTOTAL_PRODUCTS: ${totalProducts}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

listData();
