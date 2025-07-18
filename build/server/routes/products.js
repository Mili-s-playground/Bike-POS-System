const express = require('express');
const router = express.Router();
const { HarigalaProduct, ArandaraProduct } = require('../models/Product');
const Joi = require('joi');

// Validation schema
const productSchema = Joi.object({
    name: Joi.string().required().trim(),
    brand: Joi.string().required().trim(),
    category: Joi.string().valid('Bicycle', 'Accessories', 'Parts', 'Clothing', 'Tools').required(),
    sku: Joi.string().required().trim(),
    purchasePrice: Joi.number().min(0).required(),
    sellingPrice: Joi.number().min(0).required(),
    quantity: Joi.number().min(0).required(),
    minStockLevel: Joi.number().min(0).default(10),
    description: Joi.string().allow('').default(''),
    outlet: Joi.string().valid('harigala', 'arandara').required()
});

// Get model based on outlet
const getProductModel = (outlet) => {
    return outlet === 'harigala' ? HarigalaProduct : ArandaraProduct;
};

// GET all products for an outlet
router.get('/:outlet', async (req, res) => {
    try {
        const { outlet } = req.params;

        if (!['harigala', 'arandara'].includes(outlet)) {
            return res.status(400).json({ error: 'Invalid outlet' });
        }

        const ProductModel = getProductModel(outlet);
        const products = await ProductModel.find({ isActive: true }).sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET single product
router.get('/:outlet/:id', async (req, res) => {
    try {
        const { outlet, id } = req.params;

        if (!['harigala', 'arandara'].includes(outlet)) {
            return res.status(400).json({ error: 'Invalid outlet' });
        }

        const ProductModel = getProductModel(outlet);
        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST new product
router.post('/', async (req, res) => {
    try {
        console.log('Received product data:', req.body);

        const { error, value } = productSchema.validate(req.body);
        if (error) {
            console.error('Validation error:', error.details[0].message);
            return res.status(400).json({ error: error.details[0].message });
        }

        const ProductModel = getProductModel(value.outlet);

        // Check if SKU already exists
        const existingProduct = await ProductModel.findOne({ sku: value.sku });
        if (existingProduct) {
            return res.status(400).json({ error: 'SKU already exists' });
        }

        const product = new ProductModel(value);
        const savedProduct = await product.save();

        console.log('Product saved successfully:', savedProduct._id);
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT update product
router.put('/:outlet/:id', async (req, res) => {
    try {
        const { outlet, id } = req.params;

        if (!['harigala', 'arandara'].includes(outlet)) {
            return res.status(400).json({ error: 'Invalid outlet' });
        }

        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const ProductModel = getProductModel(outlet);

        // Check if SKU already exists for different product
        const existingProduct = await ProductModel.findOne({
            sku: value.sku,
            _id: { $ne: id }
        });

        if (existingProduct) {
            return res.status(400).json({ error: 'SKU already exists' });
        }

        const product = await ProductModel.findByIdAndUpdate(id, value, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT update product quantity
router.put('/:outlet/:id/quantity', async (req, res) => {
    try {
        const { outlet, id } = req.params;
        const { quantity } = req.body;

        if (!['harigala', 'arandara'].includes(outlet)) {
            return res.status(400).json({ error: 'Invalid outlet' });
        }

        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        const ProductModel = getProductModel(outlet);

        const product = await ProductModel.findByIdAndUpdate(
            id,
            { quantity },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE product (soft delete)
router.delete('/:outlet/:id', async (req, res) => {
    try {
        const { outlet, id } = req.params;

        if (!['harigala', 'arandara'].includes(outlet)) {
            return res.status(400).json({ error: 'Invalid outlet' });
        }

        const ProductModel = getProductModel(outlet);

        const product = await ProductModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;