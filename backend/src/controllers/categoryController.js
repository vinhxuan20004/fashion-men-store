'use strict';

const Category = require('../models/Category');
const Product = require('../models/Product');
const { generateSlug } = require('../utils/helpers');

// ─── Get All Categories ───────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};

    // Non-admin users only see active categories
    if (req.user?.role !== 'ADMIN') {
      filter.isActive = true;
    } else if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 });

    return res.status(200).json({
      success: true,
      data: { categories, total: categories.length },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get One Category ─────────────────────────────────────────────────────────
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support lookup by either _id or slug
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const category = await Category.findOne(filter);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (!category.isActive && req.user?.role !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
};

// ─── Create Category ──────────────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const { name, description, order, isActive } = req.body;

    const slug = generateSlug(name);
    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }

    const imageUrl = req.file
      ? `/uploads/products/${req.file.filename}`
      : req.body.image || '';

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: imageUrl,
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Category ──────────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, order, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name && name !== category.name) {
      const slug = generateSlug(name);
      const existing = await Category.findOne({
        $or: [{ name }, { slug }],
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
      }
      category.name = name;
      category.slug = slug;
    }

    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = Number(order);
    if (isActive !== undefined) category.isActive = isActive;

    if (req.file) {
      category.image = `/uploads/products/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      category.image = req.body.image;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Category ──────────────────────────────────────────────────────────
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if any products reference this category
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete: ${productCount} product(s) are assigned to this category. Reassign or delete them first.`,
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  delete: deleteCategory,
};
