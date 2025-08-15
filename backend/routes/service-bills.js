const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateServiceBill = [
    body('customer.name').trim().isLength({ min: 2, max: 100 }).withMessage('Customer name must be 2-100 characters'),
    body('customer.phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number format'),
    body('customer.address').optional().trim().isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
    body('serviceItems').isArray({ min: 1 }).withMessage('At least one service item is required'),
    body('serviceItems.*.description').trim().isLength({ min: 1, max: 500 }).withMessage('Service description is required and must be less than 500 characters'),
    body('serviceItems.*.amount').isFloat({ min: 0.01 }).withMessage('Service amount must be greater than 0'),
    body('serviceItems.*.date').isISO8601().withMessage('Invalid date format'),
    body('totalAmount').isFloat({ min: 0.01 }).withMessage('Total amount must be greater than 0'),
    body('paymentMode').optional().trim().isLength({ max: 50 }).withMessage('Payment mode must be less than 50 characters')
];

// GET /api/service-bills - Get service bills with search/filter/pagination
router.get('/', auth, async (req, res) => {
    try {
        const {
            search,
            status,
            dateFrom,
            dateTo,
            page = 1,
            limit = 20
        } = req.query;

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
            .from('service_bills')
            .select(`
                id,
                bill_number,
                invoice_number,
                customer_name,
                customer_phone,
                customer_address,
                service_items,
                total_amount,
                status,
                payment_mode,
                created_at,
                updated_at
            `)
            .eq('shop_id', shops.id);

        // Apply search filter
        if (search) {
            query = query.or(`customer_name.ilike.%${search}%,service_items.cs.${JSON.stringify([{ description: search }])}`);
        }

        // Apply status filter
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        // Apply date range filter
        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
            query = query.lte('created_at', dateTo);
        }

        // Apply sorting (newest first)
        query = query.order('created_at', { ascending: false });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: bills, error, count } = await query;

        if (error) {
            console.error('Error fetching service bills:', error);
            return res.status(500).json({ error: 'Failed to fetch service bills' });
        }

        // Transform the data to match frontend expectations
        const transformedBills = bills?.map(bill => ({
            _id: bill.id,
            billNumber: bill.bill_number,
            invoiceNumber: bill.invoice_number,
            customer: {
                name: bill.customer_name,
                phone: bill.customer_phone,
                address: bill.customer_address
            },
            serviceItems: bill.service_items,
            totalAmount: parseFloat(bill.total_amount),
            status: bill.status,
            paymentMode: bill.payment_mode,
            createdAt: bill.created_at,
            updatedAt: bill.updated_at
        })) || [];

        res.json({
            bills: transformedBills,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
    } catch (error) {
        console.error('Error in GET /service-bills:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/service-bills/stats - Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
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

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Get daily collection (today's received bills)
        const { data: dailyData, error: dailyError } = await supabase
            .from('service_bills')
            .select('total_amount')
            .eq('shop_id', shops.id)
            .eq('status', 'Received')
            .gte('created_at', today)
            .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (dailyError) {
            console.error('Error fetching daily stats:', dailyError);
            return res.status(500).json({ error: 'Failed to fetch daily statistics' });
        }

        // Get total pending bills
        const { data: pendingData, error: pendingError } = await supabase
            .from('service_bills')
            .select('total_amount')
            .eq('shop_id', shops.id)
            .eq('status', 'Pending');

        if (pendingError) {
            console.error('Error fetching pending stats:', pendingError);
            return res.status(500).json({ error: 'Failed to fetch pending statistics' });
        }

        const dailyCollection = dailyData?.reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0) || 0;
        const totalPending = pendingData?.reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0) || 0;

        res.json({
            dailyCollection,
            totalPending
        });
    } catch (error) {
        console.error('Error in GET /service-bills/stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/service-bills/:id - Get single service bill
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

        const { data: bill, error } = await supabase
            .from('service_bills')
            .select(`
                id,
                bill_number,
                invoice_number,
                customer_name,
                customer_phone,
                customer_address,
                service_items,
                total_amount,
                status,
                payment_mode,
                created_at,
                updated_at
            `)
            .eq('id', id)
            .eq('shop_id', shops.id)
            .single();

        if (error || !bill) {
            return res.status(404).json({ error: 'Service bill not found' });
        }

        // Transform the data to match frontend expectations
        const transformedBill = {
            _id: bill.id,
            billNumber: bill.bill_number,
            invoiceNumber: bill.invoice_number,
            customer: {
                name: bill.customer_name,
                phone: bill.customer_phone,
                address: bill.customer_address
            },
            serviceItems: bill.service_items,
            totalAmount: parseFloat(bill.total_amount),
            status: bill.status,
            paymentMode: bill.payment_mode,
            createdAt: bill.created_at,
            updatedAt: bill.updated_at
        };

        res.json({ bill: transformedBill });
    } catch (error) {
        console.error('Error in GET /service-bills/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/service-bills - Create new service bill
router.post('/', auth, validateServiceBill, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { customer, serviceItems, totalAmount, paymentMode = 'Pending' } = req.body;

        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        const billData = {
            shop_id: shops.id,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_address: customer.address || null,
            service_items: serviceItems,
            total_amount: totalAmount,
            status: 'Pending',
            payment_mode: paymentMode,
            business_type: 'Service'
        };

        const { data: bill, error } = await supabase
            .from('service_bills')
            .insert([billData])
            .select(`
                id,
                bill_number,
                invoice_number,
                customer_name,
                customer_phone,
                customer_address,
                service_items,
                total_amount,
                status,
                payment_mode,
                created_at,
                updated_at
            `)
            .single();

        if (error) {
            console.error('Error creating service bill:', error);
            return res.status(500).json({ error: 'Failed to create service bill' });
        }

        // Transform the data to match frontend expectations
        const transformedBill = {
            _id: bill.id,
            billNumber: bill.bill_number,
            invoiceNumber: bill.invoice_number,
            customer: {
                name: bill.customer_name,
                phone: bill.customer_phone,
                address: bill.customer_address
            },
            serviceItems: bill.service_items,
            totalAmount: parseFloat(bill.total_amount),
            status: bill.status,
            paymentMode: bill.payment_mode,
            createdAt: bill.created_at,
            updatedAt: bill.updated_at
        };

        res.status(201).json({ bill: transformedBill });
    } catch (error) {
        console.error('Error in POST /service-bills:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/service-bills/:id - Update service bill
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentMode, customer, serviceItems, totalAmount } = req.body;

        // Get user's shop
        const { data: shops, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (shopError || !shops) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Check if bill exists and belongs to user's shop
        const { data: existingBill, error: billError } = await supabase
            .from('service_bills')
            .select('id')
            .eq('id', id)
            .eq('shop_id', shops.id)
            .single();

        if (billError || !existingBill) {
            return res.status(404).json({ error: 'Service bill not found' });
        }

        // Prepare update data
        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (paymentMode !== undefined) updateData.payment_mode = paymentMode;
        if (customer !== undefined) {
            updateData.customer_name = customer.name;
            updateData.customer_phone = customer.phone;
            updateData.customer_address = customer.address;
        }
        if (serviceItems !== undefined) updateData.service_items = serviceItems;
        if (totalAmount !== undefined) updateData.total_amount = totalAmount;

        const { data: bill, error } = await supabase
            .from('service_bills')
            .update(updateData)
            .eq('id', id)
            .eq('shop_id', shops.id)
            .select(`
                id,
                bill_number,
                invoice_number,
                customer_name,
                customer_phone,
                customer_address,
                service_items,
                total_amount,
                status,
                payment_mode,
                created_at,
                updated_at
            `)
            .single();

        if (error) {
            console.error('Error updating service bill:', error);
            return res.status(500).json({ error: 'Failed to update service bill' });
        }

        // Transform the data to match frontend expectations
        const transformedBill = {
            _id: bill.id,
            billNumber: bill.bill_number,
            invoiceNumber: bill.invoice_number,
            customer: {
                name: bill.customer_name,
                phone: bill.customer_phone,
                address: bill.customer_address
            },
            serviceItems: bill.service_items,
            totalAmount: parseFloat(bill.total_amount),
            status: bill.status,
            paymentMode: bill.payment_mode,
            createdAt: bill.created_at,
            updatedAt: bill.updated_at
        };

        res.json({ bill: transformedBill });
    } catch (error) {
        console.error('Error in PUT /service-bills/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/service-bills/:id - Delete service bill
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

        // Check if bill exists and belongs to user's shop
        const { data: existingBill, error: billError } = await supabase
            .from('service_bills')
            .select('id')
            .eq('id', id)
            .eq('shop_id', shops.id)
            .single();

        if (billError || !existingBill) {
            return res.status(404).json({ error: 'Service bill not found' });
        }

        // Delete the bill
        const { error } = await supabase
            .from('service_bills')
            .delete()
            .eq('id', id)
            .eq('shop_id', shops.id);

        if (error) {
            console.error('Error deleting service bill:', error);
            return res.status(500).json({ error: 'Failed to delete service bill' });
        }

        res.json({ message: 'Service bill deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /service-bills/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;