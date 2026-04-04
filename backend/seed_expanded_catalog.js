
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
require('dotenv').config();

const seedExpandedCatalog = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mens-fashion-store';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Define categories
    const categoryData = [
      { name: 'Áo Vest', description: 'Blazers and Suits for professional and formal occasions.' },
      { name: 'Quần Âu', description: 'Tailored dress pants and trousers.' },
      { name: 'Quần Bò', description: 'Premium denim jeans in various fits.' },
      { name: 'Phụ Kiện Nam', description: 'Belts, wallets, and essential men\'s accessories.' },
      { name: 'Đồng Hồ', description: 'Timeless timepieces and luxury watches.' }
    ];

    const categories = {};
    for (const cat of categoryData) {
      let existingCat = await Category.findOne({ name: cat.name });
      if (!existingCat) {
        existingCat = new Category(cat);
        await existingCat.save();
        console.log(`Created category: ${cat.name}`);
      }
      categories[cat.name] = existingCat._id;
    }

    const products = [
      // Áo Vest
      {
        name: 'Áo Vest Navy Wool Premium',
        description: 'Áo vest len màu xanh navy cao cấp, form dáng hiện đại, lót lụa mềm mại.',
        price: 3200000,
        category: categories['Áo Vest'],
        images: ['/uploads/products/blazer_navy_wool.png'],
        brand: 'Men Studio',
        isFeatured: true,
        variants: [
          { size: '48', color: 'Navy', colorCode: '#000080', stock: 10 },
          { size: '50', color: 'Navy', colorCode: '#000080', stock: 15 },
          { size: '52', color: 'Navy', colorCode: '#000080', stock: 8 }
        ]
      },
      {
        name: 'Blazer Casual Màu Xám Ghi',
        description: 'Blazer phong cách casual, chất liệu cotton pha bền bỉ, dễ phối đồ.',
        price: 1850000,
        category: categories['Áo Vest'],
        images: ['/uploads/products/blazer_navy_wool.png'],
        brand: 'Men Studio',
        variants: [{ size: 'M', color: 'Grey', colorCode: '#808080', stock: 20 }]
      },
      {
        name: 'Áo Vest Đen Classic Fit',
        description: 'Sự lựa chọn hoàn hảo cho các buổi tiệc tối và sự kiện quan trọng.',
        price: 2900000,
        category: categories['Áo Vest'],
        images: ['/uploads/products/blazer_navy_wool.png'],
        brand: 'Men Studio',
        variants: [{ size: 'L', color: 'Black', colorCode: '#000000', stock: 12 }]
      },
      {
        name: 'Áo Vest Kẻ Caro Tan',
        description: 'Họa tiết kẻ caro cổ điển trên nền màu tan sang trọng.',
        price: 3500000,
        category: categories['Áo Vest'],
        images: ['/uploads/products/blazer_navy_wool.png'],
        brand: 'Men Studio',
        variants: [{ size: 'XL', color: 'Tan', colorCode: '#D2B48C', stock: 5 }]
      },
      {
        name: 'Blazer Linen Mùa Hè',
        description: 'Thoáng mát, nhẹ tênh cho các buổi dạo chơi cuối tuần.',
        price: 1600000,
        category: categories['Áo Vest'],
        images: ['/uploads/products/blazer_navy_wool.png'],
        brand: 'Men Studio',
        variants: [{ size: 'M', color: 'White', colorCode: '#FFFFFF', stock: 18 }]
      },

      // Quần Âu
      {
        name: 'Quần Âu Charcoal Tailored',
        description: 'Quần âu may đo màu xám than, kẻ sọc chìm tinh tế.',
        price: 850000,
        category: categories['Quần Âu'],
        images: ['/uploads/products/dress_pants_charcoal.png'],
        brand: 'Men Studio',
        isFeatured: true,
        variants: [
          { size: '30', color: 'Charcoal', colorCode: '#36454F', stock: 25 },
          { size: '32', color: 'Charcoal', colorCode: '#36454F', stock: 30 }
        ]
      },
      {
        name: 'Quần Tây Slim Fit Đen',
        description: 'Form dáng ôm vừa vặn, chất liệu co giãn nhẹ thoải mái.',
        price: 720000,
        category: categories['Quần Âu'],
        images: ['/uploads/products/dress_pants_charcoal.png'],
        brand: 'Men Studio',
        variants: [{ size: '29', color: 'Black', colorCode: '#000000', stock: 40 }]
      },
      {
        name: 'Quần Âu Màu Be Hàn Quốc',
        description: 'Phong cách trẻ trung, lịch lãm phù hợp mọi hoàn cảnh.',
        price: 680000,
        category: categories['Quần Âu'],
        images: ['/uploads/products/dress_pants_charcoal.png'],
        brand: 'Men Studio',
        variants: [{ size: '31', color: 'Beige', colorCode: '#F5F5DC', stock: 20 }]
      },
      {
        name: 'Quần Tây Xanh Navy Sọc',
        description: 'Họa tiết pinstripe mang lại vẻ ngoài quyền lực.',
        price: 920000,
        category: categories['Quần Âu'],
        images: ['/uploads/products/dress_pants_charcoal.png'],
        brand: 'Men Studio',
        variants: [{ size: '32', color: 'Navy', colorCode: '#000080', stock: 15 }]
      },
      {
        name: 'Quần Âu Flanel Ấm Áp',
        description: 'Chất liệu flanel dày dặn cho những ngày chớm lạnh.',
        price: 950000,
        category: categories['Quần Âu'],
        images: ['/uploads/products/dress_pants_charcoal.png'],
        brand: 'Men Studio',
        variants: [{ size: '33', color: 'Grey', colorCode: '#808080', stock: 10 }]
      },

      // Quần Bò
      {
        name: 'Quần Jeans Slim Fit Blue',
        description: 'Quần bò xanh classic, wash nhẹ tự nhiên, cá tính.',
        price: 1200000,
        category: categories['Quần Bò'],
        images: ['/uploads/products/jeans_slim_fit_blue.png'],
        brand: 'Men Studio',
        isFeatured: true,
        variants: [
          { size: '28', color: 'Blue', colorCode: '#0000FF', stock: 15 },
          { size: '30', color: 'Blue', colorCode: '#0000FF', stock: 20 },
          { size: '32', color: 'Blue', colorCode: '#0000FF', stock: 20 }
        ]
      },
      {
        name: 'Jeans Đen Raw Denim',
        description: 'Chất bò thô cực chất, bền bỉ theo thời gian.',
        price: 1450000,
        category: categories['Quần Bò'],
        images: ['/uploads/products/jeans_slim_fit_blue.png'],
        brand: 'Men Studio',
        variants: [{ size: '31', color: 'Black', colorCode: '#000000', stock: 25 }]
      },
      {
        name: 'Quần Bò Rách Gối Cá Tính',
        description: 'Phong cách streetstyle bụi bặm cho giới trẻ.',
        price: 980000,
        category: categories['Quần Bò'],
        images: ['/uploads/products/jeans_slim_fit_blue.png'],
        brand: 'Men Studio',
        variants: [{ size: '30', color: 'Light Blue', colorCode: '#ADD8E6', stock: 30 }]
      },
      {
        name: 'Jeans Regular Fit Classic',
        description: 'Ống đứng thoải mái, dễ phối cùng áo phông và sneakers.',
        price: 850000,
        category: categories['Quần Bò'],
        images: ['/uploads/products/jeans_slim_fit_blue.png'],
        brand: 'Men Studio',
        variants: [{ size: '34', color: 'Dark Blue', colorCode: '#00008B', stock: 12 }]
      },
      {
        name: 'Quần Bò Co Giãn 4 Chiều',
        description: 'Mặc như không mặc, cực kỳ thoải mái khi vận động.',
        price: 1100000,
        category: categories['Quần Bò'],
        images: ['/uploads/products/jeans_slim_fit_blue.png'],
        brand: 'Men Studio',
        variants: [{ size: '32', color: 'Medium Blue', colorCode: '#4682B4', stock: 45 }]
      },

      // Phụ Kiện Nam
      {
        name: 'Bộ Thắt Lưng & Ví Da Premium',
        description: 'Set quà tặng hoàn hảo từ da bò thật 100%, bảo hành 12 tháng.',
        price: 1550000,
        category: categories['Phụ Kiện Nam'],
        images: ['/uploads/products/leather_belt_wallet_set.png'],
        brand: 'Men Studio',
        isFeatured: true,
        variants: [
          { size: 'Free Size', color: 'Black', colorCode: '#000000', stock: 50 },
          { size: 'Free Size', color: 'Brown', colorCode: '#A52A2A', stock: 30 }
        ]
      },
      {
        name: 'Cà Vạt Lụa Handmade',
        description: 'Họa tiết sang trọng cho quý ông công sở.',
        price: 450000,
        category: categories['Phụ Kiện Nam'],
        images: ['/uploads/products/leather_belt_wallet_set.png'],
        brand: 'Men Studio',
        variants: [{ size: 'One Size', color: 'Red Sọc', colorCode: '#FF0000', stock: 100 }]
      },
      {
        name: 'Măng Sét Bạc Đính Đá',
        description: 'Điểm nhấn tinh tế cho tay áo sơ mi.',
        price: 850000,
        category: categories['Phụ Kiện Nam'],
        images: ['/uploads/products/leather_belt_wallet_set.png'],
        brand: 'Men Studio',
        variants: [{ size: 'Small', color: 'Silver', colorCode: '#C0C0C0', stock: 20 }]
      },
      {
        name: 'Kính Râm Aviator Classic',
        description: 'Gọng kim loại mạ vàng, tròng kính chống tia UV.',
        price: 1250000,
        category: categories['Phụ Kiện Nam'],
        images: ['/uploads/products/leather_belt_wallet_set.png'],
        brand: 'Men Studio',
        variants: [{ size: 'M', color: 'Gold', colorCode: '#FFD700', stock: 15 }]
      },
      {
        name: 'Vòng Tay Da Bện Thủ Công',
        description: 'Phụ kiện cá tính cho phong cách dạo phố.',
        price: 320000,
        category: categories['Phụ Kiện Nam'],
        images: ['/uploads/products/leather_belt_wallet_set.png'],
        brand: 'Men Studio',
        variants: [{ size: 'Regular', color: 'Dark Brown', colorCode: '#5D4037', stock: 60 }]
      },

      // Đồng Hồ
      {
        name: 'Đồng Hồ Minimalist Silver Edition',
        description: 'Thiết kế tối giản, dây da đen cao cấp, máy Quartz Nhật Bản.',
        price: 4850000,
        category: categories['Đồng Hồ'],
        images: ['/uploads/products/watch_minimalist_silver.png'],
        brand: 'Men Chrono',
        isFeatured: true,
        variants: [
          { size: '40mm', color: 'Silver/Black', colorCode: '#C0C0C0', stock: 10 },
          { size: '38mm', color: 'Silver/Black', colorCode: '#C0C0C0', stock: 5 }
        ]
      },
      {
        name: 'Watch Chronograph Bold',
        description: 'Mạnh mẽ, cá tính với 6 kim, bấm giờ thể thao.',
        price: 6200000,
        category: categories['Đồng Hồ'],
        images: ['/uploads/products/watch_minimalist_silver.png'],
        brand: 'Men Chrono',
        variants: [{ size: '42mm', color: 'Gunmetal', colorCode: '#2C3E50', stock: 8 }]
      },
      {
        name: 'Đồng Hồ Cơ Automatic Luxury',
        description: 'Lộ máy tinh xảo, năng lượng tự động theo chuyển động cổ tay.',
        price: 15000000,
        category: categories['Đồng Hồ'],
        images: ['/uploads/products/watch_minimalist_silver.png'],
        brand: 'Men Chrono',
        variants: [{ size: '41mm', color: 'Rose Gold', colorCode: '#B76E79', stock: 3 }]
      },
      {
        name: 'Smartwatch Sport Fit',
        description: 'Theo dõi sức khỏe, thông báo thông minh từ smartphone.',
        price: 2500000,
        category: categories['Đồng Hồ'],
        images: ['/uploads/products/watch_minimalist_silver.png'],
        brand: 'Men Chrono',
        variants: [{ size: '44mm', color: 'Ocean Blue', colorCode: '#0077BE', stock: 25 }]
      },
      {
        name: 'Đồng Hồ Dây Thép Không Gỉ',
        description: 'Bền bỉ, lịch lãm cho mọi sự kiện.',
        price: 3900000,
        category: categories['Đồng Hồ'],
        images: ['/uploads/products/watch_minimalist_silver.png'],
        brand: 'Men Chrono',
        variants: [{ size: '40mm', color: 'Space Grey', colorCode: '#34495E', stock: 14 }]
      }
    ];

    for (const prodData of products) {
      const existing = await Product.findOne({ name: prodData.name });
      if (existing) {
        console.log(`Product "${prodData.name}" already exists. Skipping.`);
        continue;
      }
      const product = new Product(prodData);
      await product.save();
      console.log(`Saved product: ${prodData.name}`);
    }

    console.log('Expansion seeding completed successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedExpandedCatalog();
