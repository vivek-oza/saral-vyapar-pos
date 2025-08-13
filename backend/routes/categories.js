const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateCategory = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Category name must be 2-50 characters'),
    body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color code')
];

// GET /api/categories - Get shop categories
router.get('/', auth, async (req, res) => {
    try {
        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, name, description, color, is_active, created_at, updated_at')
            .eq('shop_id', shops.id)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }

        res.json({ categories: categories || [] });
    } catch (error) {
        console.error('Error in GET /categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/categories/:id - Get single category
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

        const { data: category, error } = await supabase
            .from('categories')
            .select('id, name, description, color, is_active, created_at, updated_at')
            .eq('id', id)
            .eq('shop_id', shops.id)
            .eq('is_active', true)
            .single();

        if (error || !category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ category });
    } catch (error) {
        console.error('Error in GET /categories/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/categories - Create new category
router.post('/', auth, validateCategory, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, color = '#3B82F6' } = req.body;

        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Check if category name already exists in shop
        const { data: existingCategory } = await supabase
            .from('categories')
            .select('id')
            .eq('shop_id', shops.id)
            .eq('name', name)
            .eq('is_active', true)
            .single();

        if (existingCategory) {
            return res.status(400).json({ error: 'Category name already exists in your shop' });
        }

        const categoryData = {
            shop_id: shops.id,
            name,
            description,
            color
        };

        const { data: category, error } = await supabase
            .from('categories')
            .insert([categoryData])
            .select('id, name, description, color, is_active, created_at, updated_at')
            .single();

        if (error) {
            console.error('Error creating category:', error);
            return res.status(500).json({ error: 'Failed to create category' });
        }

        res.status(201).json({ category });
    } catch (error) {
        console.error('Error in POST /categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/categories/:id - Update category
router.put('/:id', auth, validateCategory, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { name, description, color } = req.body;

        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Check if category exists and belongs to user's shop
        const { data: existingCategory, error: categoryError } = await supabase
            .from('categories')
            .select('id, name')
            .eq('id', id)
            .eq('shop_id', shops.id)
            .eq('is_active', true)
            .single();

        if (categoryError || !existingCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if new name conflicts with existing category (if name is being changed)
        if (name && name !== existingCategory.name) {
            const { data: nameConflict } = await supabase
                .from('categories')
                .select('id')
                .eq('shop_id', shops.id)
                .eq('name', name)
                .eq('is_active', true)
                .neq('id', id)
                .single();

            if (nameConflict) {
                return res.status(400).json({ error: 'Category name already exists in your shop' });
            }
        }

        const updateData = {
            name,
            description,
            color
        };

        const { data: category, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .eq('shop_id', shops.id)
            .select('id, name, description, color, is_active, created_at, updated_at')
            .single();

        if (error) {
            console.error('Error updating category:', error);
            return res.status(500).json({ error: 'Failed to update category' });
        }

        res.json({ category });
    } catch (error) {
        console.error('Error in PUT /categories/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/categories/:id - Delete category (soft delete)
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

        // Check if category exists and belongs to user's shop
        const { data: existingCategory, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('id', id)
            .eq('shop_id', shops.id)
            .eq('is_active', true)
            .single();

        if (categoryError || !existingCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if category is being used by any products
        const { data: productsUsingCategory, error: productsError } = await supabase
            .from('products')
            .select('id')
            .eq('category_id', id)
            .eq('is_active', true)
            .limit(1);

        if (productsError) {
            console.error('Error checking category usage:', productsError);
            return res.status(500).json({ error: 'Failed to check category usage' });
        }

        if (productsUsingCategory && productsUsingCategory.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete category that is being used by products. Please reassign products first.'
            });
        }

        // Soft delete by setting is_active to false
        const { error } = await supabase
            .from('categories')
            .update({ is_active: false })
            .eq('id', id)
            .eq('shop_id', shops.id);

        if (error) {
            console.error('Error deleting category:', error);
            return res.status(500).json({ error: 'Failed to delete category' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /categories/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;