
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

const run = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mens-fashion-store';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log('Total products:', products.length);

        products.forEach(p => {
            if (!p.slug) {
                console.log('Product missing slug:', p.name, p._id);
            } else if (p.slug === 'undefined') {
                console.log('Product has literal \"undefined\" slug:', p.name, p._id);
            }
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

run();
