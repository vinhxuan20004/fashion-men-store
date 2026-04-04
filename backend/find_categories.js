
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

const getCategories = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mens-fashion-store';
    await mongoose.connect(mongoUri);
    const categories = await Category.find({}, 'name _id');
    console.log(JSON.stringify(categories, null, 2));
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

getCit();

function getCit() {
    getCategories();
}
