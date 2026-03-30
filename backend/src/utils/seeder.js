'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Voucher = require('../models/Voucher');
const { generateSlug } = require('./helpers');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mens-fashion-store';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const users = [
  {
    name: 'Antigravity Admin',
    email: 'admin@antigravity.com',
    password: 'Admin@123456',
    role: 'ADMIN',
    phone: '0901234567',
    address: { street: '123 Luxury Ave', district: 'District 1', city: 'HCMC' },
    isActive: true,
  },
  {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'User@123456',
    role: 'USER',
    phone: '0912345678',
    address: { street: '456 Fashion St', district: 'District 3', city: 'HCMC' },
    isActive: true,
  },
];

const categoryData = [
  { 
    name: 'Áo thun', 
    description: 'Bộ sưu tập áo thun nam cao cấp với chất liệu cotton 100% thoáng mát, form dáng chuẩn.', 
    order: 1,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'
  },
  { 
    name: 'Áo sơ mi', 
    description: 'Sơ mi nam công sở và dạo phố tinh tế. Sự kết hợp hoàn hảo giữa phong cách cổ điển và hiện đại.', 
    order: 2,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800'
  },
  { 
    name: 'Quần jean', 
    description: 'Quần jean nam bền bỉ, thời thượng với các kiểu dáng Slim Fit, Regular Fit và Baggy.', 
    order: 3,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800'
  },
  { 
    name: 'Quần kaki', 
    description: 'Quần kaki nam thanh lịch, đa dụng cho mọi hoàn cảnh từ đi làm đến đi chơi.', 
    order: 4,
    image: 'https://images.unsplash.com/photo-1473960104312-bf9e1812327d?auto=format&fit=crop&q=80&w=800'
  },
  { 
    name: 'Phụ kiện', 
    description: 'Những món đồ hoàn thiện phong cách phái mạnh: Thắt lưng, ví da, mũ nón và trang sức.', 
    order: 5,
    image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&q=80&w=800'
  },
];

const generateVariants = (colors) => {
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const variants = [];
  colors.forEach(({ color, colorCode }) => {
    sizes.forEach((size) => {
      variants.push({
        size,
        color,
        colorCode,
        stock: Math.floor(Math.random() * 50) + 10,
        sku: `AG-${color.substring(0,2).toUpperCase()}-${size}-${Math.floor(Math.random() * 1000)}`,
      });
    });
  });
  return variants;
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
      Voucher.deleteMany({}),
    ]);

    // Create Users
    const createdUsers = await User.create(users);
    const adminId = createdUsers[0]._id;
    const userId = createdUsers[1]._id;

    // Create Categories
    const categoriesWithSlugs = categoryData.map((cat) => ({
      ...cat,
      slug: generateSlug(cat.name),
      isActive: true,
    }));
    const createdCategories = await Category.create(categoriesWithSlugs);
    const catMap = {};
    createdCategories.forEach((cat) => { catMap[cat.name] = cat._id; });

    // Create Products
    const productData = [
      // Áo thun
      {
        name: 'Áo Thun Nam Premium Pima Cotton',
        description: 'Chất liệu Pima Cotton cao cấp nhất thế giới, siêu mềm mại, bền màu và thoáng khí tuyệt đối. Form dáng Regular Fit tôn dáng phái mạnh.',
        price: 450000,
        salePrice: 390000,
        category: catMap['Áo thun'],
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800'
        ],
        variants: generateVariants([
          { color: 'Trắng tinh khôi', colorCode: '#FFFFFF' },
          { color: 'Đen sang trọng', colorCode: '#000000' },
          { color: 'Xanh Navy', colorCode: '#000080' }
        ]),
        isFeatured: true,
        tags: ['premium', 'pima cotton', 'áo thun'],
        brand: 'ANTIGRAVITY',
        material: '100% Pima Cotton',
        soldCount: 45
      },
      {
        name: 'Áo Polo Nam Performance Knit',
        description: 'Sự kết hợp giữa phong cách lịch lãm và sự thoải mái của dòng Performance. Phù hợp cho cả môi trường công sở lẫn các hoạt động ngoài trời.',
        price: 580000,
        salePrice: null,
        category: catMap['Áo thun'],
        images: [
          'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800'
        ],
        variants: generateVariants([
          { color: 'Xám Melange', colorCode: '#808080' },
          { color: 'Xanh Rêu', colorCode: '#4B5320' }
        ]),
        isFeatured: true,
        tags: ['polo', 'performance', 'lịch lãm'],
        brand: 'ANTIGRAVITY LUXURIES',
        material: 'Cotton & Spandex Blend',
        soldCount: 28
      },
      // Áo sơ mi
      {
        name: 'Áo Sơ Mi Trắng Oxford Essential',
        description: 'Chiếc sơ mi trắng kinh điển không thể thiếu trong tủ đồ. Chất liệu vải Oxford dày dặn nhưng vẫn cực kỳ thoáng mát.',
        price: 650000,
        salePrice: 590000,
        category: catMap['Áo sơ mi'],
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=800'
        ],
        variants: generateVariants([
          { color: 'Trắng', colorCode: '#FFFFFF' }
        ]),
        isFeatured: true,
        tags: ['oxford', 'essential', 'sơ mi trắng'],
        brand: 'ANTIGRAVITY ESSENTIALS',
        material: 'Premium Oxford Cotton',
        soldCount: 62
      },
      // Quần Jean
      {
        name: 'Quần Jean Selvedge Denim Dark Wash',
        description: 'Được dệt từ những khung dệt cổ điển, mang lại sự bền bỉ và vẻ đẹp càng mặc càng đẹp theo thời gian.',
        price: 1250000,
        salePrice: null,
        category: catMap['Quần jean'],
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1602167683933-7e500b396e95?auto=format&fit=crop&q=80&w=800'
        ],
        variants: generateVariants([
          { color: 'Xanh Đậm Indigo', colorCode: '#00008B' }
        ]),
        isFeatured: true,
        tags: ['selvedge', 'denim', 'raw'],
        brand: 'AG DENIM WORKSHOP',
        material: '14oz Raw Denim',
        soldCount: 15
      },
      // Phụ kiện
      {
        name: 'Thắt Lưng Da Full-Grain Leather',
        description: 'Được chế tác thủ công từ da bò nguyên miếng cao cấp. Khóa cài bằng đồng thau nguyên khối mạ niken mờ.',
        price: 850000,
        salePrice: 750000,
        category: catMap['Phụ kiện'],
        images: [
          'https://images.unsplash.com/photo-1624222247344-550fbadfd946?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800'
        ],
        variants: [
          { size: '90', color: 'Nâu Walnut', colorCode: '#5C4033', stock: 20, sku: 'AG-BELT-90' },
          { size: '95', color: 'Nâu Walnut', colorCode: '#5C4033', stock: 15, sku: 'AG-BELT-95' },
          { size: '100', color: 'Nâu Walnut', colorCode: '#5C4033', stock: 10, sku: 'AG-BELT-100' }
        ],
        isFeatured: true,
        tags: ['da thật', 'thắt lưng', 'handmade'],
        brand: 'AG LEATHER GOODS',
        material: 'Full-Grain Italian Cowhide',
        soldCount: 34
      }
    ];

    const createdProducts = await Product.create(productData);

    // Create some Reviews
    await Review.create([
      {
        user: userId,
        product: createdProducts[0]._id,
        rating: 5,
        comment: 'Chất vải thun cực kỳ sướng, mặc mát và rất tôn dáng. Giao hàng nhanh!',
        isApproved: true
      },
      {
        user: userId,
        product: createdProducts[2]._id,
        rating: 4,
        comment: 'Sơ mi đẹp, nhưng hơi khó ủi một chút. Tuy nhiên chất lượng vải vẫn rất tuyệt vời.',
        isApproved: true
      }
    ]);

    // Create some Vouchers
    await Voucher.create([
      {
        code: 'WELCOMEAG',
        type: 'PERCENTAGE',
        value: 10,
        minOrderValue: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: 'LUXURYX',
        type: 'FIXED',
        value: 100000,
        minOrderValue: 1000000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
