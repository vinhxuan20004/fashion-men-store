
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
require('dotenv').config();

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mens-fashion-store';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const category = await Category.findOne({ name: 'Áo Sơ Mi' });
    if (!category) {
      console.error('Category "Áo Sơ Mi" not found. Please create it first.');
      process.exit(1);
    }

    const newProducts = [
      {
        name: 'Áo Sơ Mi Trắng Oxford',
        description: 'Áo sơ mi oxford trắng tinh khôi, chất liệu cotton cao cấp, phù hợp cho môi trường công sở và dạo phố.',
        price: 450000,
        category: category._id,
        images: ['/uploads/products/shirt_oxford_white.png'],
        brand: 'Men Fashion',
        isFeatured: true,
        variants: [
          { size: 'S', color: 'Trắng', colorCode: '#FFFFFF', stock: 20 },
          { size: 'M', color: 'Trắng', colorCode: '#FFFFFF', stock: 30 },
          { size: 'L', color: 'Trắng', colorCode: '#FFFFFF', stock: 25 },
          { size: 'XL', color: 'Trắng', colorCode: '#FFFFFF', stock: 15 }
        ]
      },
      {
        name: 'Áo Sơ Mi Kẻ Caro Xanh',
        description: 'Họa tiết kẻ caro hiện đại, phối màu xanh navy và trắng cá tính, chất vải flanel mềm mại.',
        price: 380000,
        category: category._id,
        images: ['/uploads/products/shirt_navy_check.png'],
        brand: 'Men Fashion',
        isFeatured: true,
        variants: [
          { size: 'M', color: 'Navy Check', colorCode: '#000080', stock: 40 },
          { size: 'L', color: 'Navy Check', colorCode: '#000080', stock: 35 }
        ]
      },
      {
        name: 'Áo Sơ Mi Linen Cổ Trụ',
        description: 'Phong cách minimalist với chất vải linen thoáng mát, cổ trụ thanh lịch, màu beige tự nhiên.',
        price: 520000,
        category: category._id,
        images: ['/uploads/products/shirt_linen_beige.png'],
        brand: 'Men Fashion',
        isFeatured: true,
        variants: [
          { size: 'S', color: 'Beige', colorCode: '#F5F5DC', stock: 15 },
          { size: 'M', color: 'Beige', colorCode: '#F5F5DC', stock: 25 },
          { size: 'L', color: 'Beige', colorCode: '#F5F5DC', stock: 20 }
        ]
      },
      {
        name: 'Áo Sơ Mi Jean Denim',
        description: 'Chất liệu denim bền bỉ, phong cách bụi bặm, nam tính, phù hợp khoác ngoài hoặc mặc đơn.',
        price: 650000,
        category: category._id,
        images: ['/uploads/products/shirt_denim_classic.png'],
        brand: 'Men Fashion',
        isFeatured: true,
        variants: [
          { size: 'M', color: 'Denim Blue', colorCode: '#1560BD', stock: 30 },
          { size: 'L', color: 'Denim Blue', colorCode: '#1560BD', stock: 25 },
          { size: 'XL', color: 'Denim Blue', colorCode: '#1560BD', stock: 10 }
        ]
      },
      {
        name: 'Áo Sơ Mi Họa Tiết Tropical',
        description: 'Đậm chất mùa hè với họa tiết nhiệt đới rực rỡ, vải rayon mềm mại, thoáng mát.',
        price: 420000,
        category: category._id,
        images: ['/uploads/products/shirt_tropical_summer.png'],
        brand: 'Men Fashion',
        isFeatured: true,
        variants: [
          { size: 'M', color: 'Tropical', colorCode: '#FF6347', stock: 50 },
          { size: 'L', color: 'Tropical', colorCode: '#FF6347', stock: 40 }
        ]
      }
    ];

    for (const prodData of newProducts) {
      const existing = await Product.findOne({ name: prodData.name });
      if (existing) {
        console.log(`Product "${prodData.name}" already exists. Skipping.`);
        continue;
      }
      const product = new Product(prodData);
      await product.save();
      console.log(`Saved product: ${prodData.name}`);
    }

    console.log('Seeding completed successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedProducts();
