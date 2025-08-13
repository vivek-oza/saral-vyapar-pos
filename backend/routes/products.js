const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateProduct = [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be 2-100 characters'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
    body('marginInCurrency').optional().isFloat({ min: 0 }).withMessage('Margin must be non-negative'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must be less than 50 characters'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative integer'),
    body('sku').optional().trim().isLength({ max: 50 }).withMessage('SKU must be less than 50 characters')
];

// GET /api/products - Get products with search/filter/pagination
router.get('/', auth, async (req, res) => {
    try {
        const { search, category, stock, sort = 'name', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        let query = supabase
            .from('products')
            .select(`
        id,
        name,
        description,
        base_price,
        margin_in_currency,
        selling_price,
        category,
        stock,
        sku,
        is_active,
        created_at,
        updated_at
      `)
            .eq('shop_id', shops.id)
            .eq('is_active', true);

        // Apply search filter
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Apply category filter
        if (category) {
            query = query.eq('category', category);
        }

        // Apply stock filter
        if (stock) {
            switch (stock) {
                case 'out-of-stock':
                    query = query.eq('stock', 0);
                    break;
                case 'low-stock':
                    query = query.gt('stock', 0).lte('stock', 10);
                    break;
                case 'in-stock':
                    query = query.gt('stock', 10);
                    break;
            }
        }

        // Apply sorting
        switch (sort) {
            case 'price':
                query = query.order('selling_price', { ascending: true });
                break;
            case 'stock':
                query = query.order('stock', { ascending: false });
                break;
            case 'date':
                query = query.order('created_at', { ascending: false });
                break;
            default:
                query = query.order('name', { ascending: true });
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: products, error, count } = await query;

        if (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }

        res.json({
            products: products || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
    } catch (error) {
        console.error('Error in GET /products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        const { data: product, error } = await supabase
            .from('products')
            .select(`
        id,
        name,
        description,
        base_price,
        margin_in_currency,
        selling_price,
        category,
        stock,
        sku,
        is_active,
        created_at,
        updated_at
      `)
            .eq('id', id)
            .eq('shop_id', shops.id)
            .eq('is_active', true)
            .single();

        if (error || !product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        console.error('Error in GET /products/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/products - Create new product
router.post('/', auth, validateProduct, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, basePrice, marginInCurrency = 0, category, stock = 0, sku } = req.body;

        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Check SKU uniqueness within shop if provided
        if (sku) {
            const { data: existingSku } = await supabase
                .from('products')
                .select('id')
                .eq('shop_id', shops.id)
                .eq('sku', sku)
                .single();

            if (existingSku) {
                return res.status(400).json({ error: 'SKU already exists in your shop' });
            }
        }

        const productData = {
            shop_id: shops.id,
            name,
            description,
            base_price: basePrice,
            margin_in_currency: marginInCurrency,
            category,
            stock,
            sku: sku || null
        };

        const { data: product, error } = await supabase
            .from('products')
            .insert([productData])
            .select(`
        id,
        name,
        description,
        base_price,
        margin_in_currency,
        selling_price,
        category,
        stock,
        sku,
        is_active,
        created_at,
        updated_at
      `)
            .single();

        if (error) {
            console.error('Error creating product:', error);
            return res.status(500).json({ error: 'Failed to create product' });
        }

        res.status(201).json({ product });
    } catch (error) {
        console.error('Error in POST /products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/products/:id - Update product
router.put('/:id', auth, validateProduct, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { name, description, basePrice, marginInCurrency, category, stock, sku } = req.body;

        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Check if product exists and belongs to user's shop
        const { data: existingProduct, error: productError } = await supabase
            .from('products')
            .select('id, sku')
            .eq('id', id)
            .eq('shop_id', shops.id)
            .eq('is_active', true)
            .single();

        if (productError || !existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check SKU uniqueness within shop if provided and different from current
        if (sku && sku !== existingProduct.sku) {
            const { data: existingSku } = await supabase
                .from('products')
                .select('id')
                .eq('shop_id', shops.id)
                .eq('sku', sku)
                .neq('id', id)
                .single();

            if (existingSku) {
                return res.status(400).json({ error: 'SKU already exists in your shop' });
            }
        }

        const updateData = {
            name,
            description,
            base_price: basePrice,
            margin_in_currency: marginInCurrency,
            category,
            stock,
            sku: sku || null
        };

        const { data: product, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .eq('shop_id', shops.id)
            .select(`
        id,
        name,
        description,
        base_price,
        margin_in_currency,
        selling_price,
        category,
        stock,
        sku,
        is_active,
        created_at,
        updated_at
      `)
            .single();

        if (error) {
            console.error('Error updating product:', error);
            return res.status(500).json({ error: 'Failed to update product' });
        }

        res.json({ product });
    } catch (error) {
        console.error('Error in PUT /products/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/products/:id - Delete product (soft delete)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Check if product exists and belongs to user's shop
        const { data: existingProduct, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .eq('shop_id', shops.id)
            .eq('is_active', true)
            .single();

        if (productError || !existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Soft delete by setting is_active to false
        const { error } = await supabase
            .from('products')
            .update({ is_active: false })
            .eq('id', id)
            .eq('shop_id', shops.id);

        if (error) {
            console.error('Error deleting product:', error);
            return res.status(500).json({ error: 'Failed to delete product' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /products/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;