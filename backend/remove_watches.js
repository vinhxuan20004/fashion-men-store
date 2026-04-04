'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/database');

const removeWatches = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB...');

        // 1. Find category "Đồng hồ"
        const categoryName = 'Đồng hồ';
        const category = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });

        if (!category) {
            console.log(`Category "${categoryName}" not found.`);
            process.exit(0);
        }

        console.log(`Found category: ${category.name} (${category._id})`);

        // 2. Count products in this category
        const productCount = await Product.countDocuments({ category: category._id });
        console.log(`Found ${productCount} products in this category.`);

        if (productCount > 0) {
            // 3. Delete products
            const deleteProductsRes = await Product.deleteMany({ category: category._id });
            console.log(`Deleted ${deleteProductsRes.deletedCount} products.`);
        }

        // 4. Delete category
        const deleteCategoryRes = await Category.deleteOne({ _id: category._id });
        console.log(`Deleted category "${category.name}".`);

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

removeWatches();
