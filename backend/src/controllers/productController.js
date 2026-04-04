'use strict';

const Product = require('../models/Product');
const Review = require('../models/Review');
const { paginate, generateSlug } = require('../utils/helpers');
const { getFileUrls } = require('../middleware/upload');

// ─── Get All Products ─────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      size,
      color,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      featured,
      brand,
      isActive,
    } = req.query;

    const { skip, limit: lim, page: pg } = paginate(page, limit);
    const filter = {};

    // Active filter — admins can see inactive
    if (req.user?.role !== 'ADMIN') {
      filter.isActive = true;
    } else if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Category filter - Support multiple IDs
    if (category) {
      const categories = category.split(',').filter(Boolean);
      filter.category = { $in: categories };
    }

    if (featured !== undefined) filter.isFeatured = featured === 'true';
    if (brand) filter.brand = { $regex: brand, $options: 'i' };

    // Size filter - Support multiple sizes
    if (size) {
      const sizes = size.split(',').map((s) => s.trim().toUpperCase());
      filter['variants.size'] = { $in: sizes };
    }

    // Color filter - Support multiple colors & Case-insensitive
    if (color) {
      const colors = color.split(',').map((c) => new RegExp(`^${c.trim()}$`, 'i'));
      filter['variants.color'] = { $in: colors };
    }

    // Price range - Smartly check effective price (salePrice or regular price)
    if (minPrice || maxPrice) {
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || 999999999;
      
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          {
            salePrice: { $ne: null, $exists: true },
            salePrice: { $gte: min, $lte: max }
          },
          {
            $or: [
              { salePrice: null },
              { salePrice: { $exists: false } }
            ],
            price: { $gte: min, $lte: max }
          }
        ]
      });
    }

    // Full-text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const allowedSorts = {
      '-createdAt': { createdAt: -1 },
      createdAt: { createdAt: 1 },
      '-price': { price: -1 },
      price: { price: 1 },
      '-soldCount': { soldCount: -1 },
      '-averageRating': { ratingSum: -1 },
      name: { name: 1 },
    };
    const sortObj = allowedSorts[sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(lim)
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / lim);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: pg,
          limit: lim,
          totalPages,
          hasNext: pg < totalPages,
          hasPrev: pg > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Product ───────────────────────────────────────────────────────
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

    const product = await Product.findOne(filter)
      .populate('category', 'name slug')
      .lean({ virtuals: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (!product.isActive && req.user?.role !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Fetch approved reviews with user info
    const reviews = await Review.find({ product: product._id, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      data: { product, reviews },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Create Product ───────────────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      category,
      variants,
      isFeatured,
      isActive,
      tags,
      material,
      brand,
    } = req.body;

    const images = req.files && req.files.length > 0 ? getFileUrls(req.files) : (req.body.images || []);

    const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : (variants || []);
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);

    const product = await Product.create({
      name,
      description: description || '',
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      category,
      images: Array.isArray(images) ? images : [images],
      variants: parsedVariants,
      isFeatured: isFeatured === true || isFeatured === 'true',
      isActive: isActive !== undefined ? isActive !== 'false' && isActive !== false : true,
      tags: parsedTags,
      material: material || '',
      brand: brand || '',
    });

    const populated = await product.populate('category', 'name slug');

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product: populated },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Product ───────────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      name,
      description,
      price,
      salePrice,
      category,
      variants,
      isFeatured,
      isActive,
      tags,
      material,
      brand,
      images: bodyImages,
    } = req.body;

    if (name !== undefined) { product.name = name; product.slug = ''; } // reset slug
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (salePrice !== undefined) product.salePrice = salePrice ? Number(salePrice) : null;
    if (category !== undefined) product.category = category;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === true || isFeatured === 'true';
    if (isActive !== undefined) product.isActive = isActive !== 'false' && isActive !== false;
    if (material !== undefined) product.material = material;
    if (brand !== undefined) product.brand = brand;

    if (tags !== undefined) {
      product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    if (variants !== undefined) {
      product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    }

    // New uploaded images override; if none, keep bodyImages or current
    if (req.files && req.files.length > 0) {
      product.images = getFileUrls(req.files);
    } else if (bodyImages !== undefined) {
      product.images = Array.isArray(bodyImages) ? bodyImages : [bodyImages];
    }

    await product.save();
    const populated = await product.populate('category', 'name slug');

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product: populated },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Product (soft delete) ─────────────────────────────────────────────
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.isActive = false;
    await product.save();

    return res.status(200).json({ success: true, message: 'Product deactivated (soft deleted) successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Add Product Images (append) ──────────────────────────────────────────────
const addProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const newUrls = getFileUrls(req.files);
    product.images = [...(product.images || []), ...newUrls];
    await product.save();

    return res.status(200).json({
      success: true,
      message: `${newUrls.length} image(s) added successfully.`,
      data: { images: product.images },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Remove Product Image ─────────────────────────────────────────────────────
const removeProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required.' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.images = product.images.filter((img) => img !== imageUrl);
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Image removed successfully.',
      data: { images: product.images },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Standalone Upload Images (No persistence) ────────────────────────────────
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    const urls = getFileUrls(req.files);

    return res.status(200).json({
      success: true,
      message: `${urls.length} image(s) uploaded successfully.`,
      data: { urls },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Featured Products ────────────────────────────────────────────────────
const getFeatured = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);

    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .sort({ soldCount: -1, createdAt: -1 })
      .limit(limit)
      .lean({ virtuals: true });

    return res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Related Products ─────────────────────────────────────────────────────
const getRelated = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 4, 12);

    const product = await Product.findById(id).select('category tags');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const related = await Product.find({
      _id: { $ne: id },
      category: product.category,
      isActive: true,
    })
      .populate('category', 'name slug')
      .sort({ soldCount: -1 })
      .limit(limit)
      .lean({ virtuals: true });

    return res.status(200).json({
      success: true,
      data: { products: related },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  delete: deleteProduct,
  addProductImages,
  removeProductImage,
  uploadImages,
  getFeatured,
  getRelated,
};
