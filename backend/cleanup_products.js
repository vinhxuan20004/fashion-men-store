'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/database');

const cleanup = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected.');
    
    // Whitelist category names (Case-insensitive match)
    const whitelistNames = ['Áo Sơ Mi', 'Áo Vest', 'Quần Âu', 'Quần Bò'];
    
    // Find category documents for the whitelist
    const whitelistCategories = await Category.find({
      name: { $in: whitelistNames.map(name => new RegExp(`^${name}$`, 'i')) }
    });
    
    const whitelistIds = whitelistCategories.map(cat => cat._id);
    
    console.log('Whitelist Categories Found:');
    whitelistCategories.forEach(cat => console.log(`- ${cat.name} (${cat._id})`));
    
    if (whitelistIds.length === 0) {
      console.error('ERROR: No whitelist categories found. Aborting cleanup to prevent complete wipe.');
      process.exit(1);
    }
    
    // Identify products to delete
    const toDeleteCount = await Product.countDocuments({
      category: { $nin: whitelistIds }
    });
    
    console.log(`\nProducts to be deleted: ${toDeleteCount}`);
    
    if (toDeleteCount > 0) {
      const result = await Product.deleteMany({
        category: { $nin: whitelistIds }
      });
      console.log(`Successfully deleted ${result.deletedCount} products.`);
    } else {
      console.log('No products found outside the whitelist categories.');
    }
    
    // Optional: Delete categories that are now empty and not in the whitelist
    const allCategories = await Category.find();
    for (const cat of allCategories) {
      const isWhitelisted = whitelistIds.some(id => id.equals(cat._id));
      if (!isWhitelisted) {
        const prodCount = await Product.countDocuments({ category: cat._id });
        if (prodCount === 0) {
          console.log(`Deleting empty non-whitelisted category: ${cat.name}`);
          await Category.findByIdAndDelete(cat._id);
        }
      }
    }
    
    console.log('\nCleanup completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
};

cleanup();
