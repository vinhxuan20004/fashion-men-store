'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');

const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Voucher = require('../models/Voucher');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mens-fashion-store';

async function clearData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing mock data (preserving users)...');

    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
      Voucher.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
    ]);

    console.log('Data cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Data clearing failed:', err);
    process.exit(1);
  }
}

clearData();
