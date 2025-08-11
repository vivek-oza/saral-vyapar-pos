const express = require("express");
const { runQuery, getQuery, allQuery, supabase } = require("../config/database");
const { auth } = require("../middleware/auth");
const { validateShopCreation } = require("../middleware/validation");
const { body, validationResult } = require('express-validator');
const emailService = require("../services/emailService");

const router = express.Router();

// Validation middleware for shop setup
const validateShopSetup = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Shop name is required and must be less than 100 characters'),
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('address').trim().isLength({ min: 1, max: 500 }).withMessage('Address is required and must be less than 500 characters'),
  body('gstNumber').optional().trim().custom((value) => {
    if (value && value.length > 0) {
      // More lenient GST validation - just check if it's 15 characters with right pattern
      if (!/^[0-9]{2}[A-Z0-9]{13}$/.test(value)) {
        throw new Error('GST number should be 15 characters (2 digits + 13 alphanumeric characters)');
      }
    }
    return true;
  }),
  body('phone').optional().trim().custom((value) => {
    if (value && value.length > 0) {
      // More lenient phone validation
      if (!/^[6-9]\d{9}$/.test(value)) {
        throw new Error('Phone number should be 10 digits starting with 6-9');
      }
    }
    return true;
  })
];

// Shop setup endpoint (protected route)
router.post("/setup", auth, validateShopSetup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Shop setup validation errors:', errors.array());
      console.log('Request body:', req.body);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, username, address, gstNumber, phone, businessType } = req.body;
    const userId = req.user.id;

    // Check if username is already taken
    const existingUsername = await getQuery("shops", { username });
    if (existingUsername) {
      return res.status(400).json({ error: 'This username is already taken. Please choose a different one.' });
    }

    // Check if shop already exists for this user
    const existingShop = await getQuery("shops", { user_id: userId });

    let shop;
    if (existingShop) {
      // Update existing shop
      const result = await runQuery("shops", "update", {
        name,
        username,
        address,
        gst_number: gstNumber || null,
        phone: phone || null,
        business_type: businessType || null,
        updated_at: new Date().toISOString()
      }, { user_id: userId });
      shop = result.data;
    } else {
      // Create new shop
      const result = await runQuery("shops", "insert", {
        user_id: userId,
        name,
        username,
        address,
        gst_number: gstNumber || null,
        phone: phone || null,
        business_type: businessType || null
      });
      shop = result.data;
    }

    res.json({
      success: true,
      message: existingShop ? 'Shop updated successfully' : 'Shop created successfully',
      shop
    });

  } catch (error) {
    console.error('Shop setup error:', error);
    res.status(500).json({ error: 'Failed to set up shop' });
  }
});

// Create shop (protected route)
router.post("/", auth, validateShopCreation, async (req, res) => {
  try {
    const { name, address, gstNumber, phone, businessType } = req.body;
    const userId = req.user.id;

    // Check if user already has a shop
    const existingShop = await getQuery("shops", { user_id: userId }, "id");
    if (existingShop) {
      return res.status(400).json({
        error: "User already has a shop. Only one shop per user is allowed.",
      });
    }

    // Create shop
    const result = await runQuery("shops", "insert", {
      user_id: userId,
      name,
      address,
      gst_number: gstNumber || null,
      phone: phone || null,
      business_type: businessType || null,
    });

    const shop = result.data;

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(req.user.email, "", name);
    } catch (emailError) {
      console.warn("⚠️ Failed to send welcome email:", emailError);
      // Don't fail the shop creation if email fails
    }

    res.status(201).json({
      success: true,
      message: "Shop created successfully!",
      shop,
    });
  } catch (error) {
    console.error("Shop creation error:", error);
    res.status(500).json({ error: "Failed to create shop" });
  }
});

// Get user's shop (protected route)
router.get("/my-shop", auth, async (req, res) => {
  try {
    const shop = await getQuery("shops", { user_id: req.user.id });

    if (!shop) {
      return res.status(404).json({ error: "No shop found for this user" });
    }

    res.json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("Get shop error:", error);
    res.status(500).json({ error: "Failed to get shop information" });
  }
});

// Update shop (protected route)
router.put("/my-shop", auth, validateShopCreation, async (req, res) => {
  try {
    const { name, address, gstNumber, phone, businessType } = req.body;
    const userId = req.user.id;

    // Check if user has a shop
    const existingShop = await getQuery("shops", { user_id: userId }, "id");
    if (!existingShop) {
      return res.status(404).json({ error: "No shop found for this user" });
    }

    // Update shop
    await runQuery("shops", "update", {
      name,
      address,
      gst_number: gstNumber || null,
      phone: phone || null,
      business_type: businessType || null,
      updated_at: new Date().toISOString()
    }, { user_id: userId });

    // Get updated shop
    const updatedShop = await getQuery("shops", { user_id: userId });

    res.json({
      success: true,
      message: "Shop updated successfully",
      shop: updatedShop,
    });
  } catch (error) {
    console.error("Shop update error:", error);
    res.status(500).json({ error: "Failed to update shop" });
  }
});

// Delete shop (protected route)
router.delete("/my-shop", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has a shop
    const existingShop = await getQuery("shops", { user_id: userId }, "id");
    if (!existingShop) {
      return res.status(404).json({ error: "No shop found for this user" });
    }

    // Delete shop (this will cascade to related data due to foreign key constraints)
    await runQuery("shops", "delete", null, { user_id: userId });

    res.json({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (error) {
    console.error("Shop deletion error:", error);
    res.status(500).json({ error: "Failed to delete shop" });
  }
});

// Get shop by ID (public route, but with optional auth for additional info)
router.get("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;

    // Get shop details
    const shop = await getQuery("shops", { id: shopId });

    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    // If user is authenticated and owns the shop, return full details
    if (req.user && req.user.id === shop.user_id) {
      return res.json({
        success: true,
        shop,
        isOwner: true,
      });
    }

    // For public access, return limited shop information
    const publicShopInfo = {
      id: shop.id,
      name: shop.name,
      address: shop.address,
      businessType: shop.business_type,
      createdAt: shop.created_at,
    };

    res.json({
      success: true,
      shop: publicShopInfo,
      isOwner: false,
    });
  } catch (error) {
    console.error("Get shop by ID error:", error);
    res.status(500).json({ error: "Failed to get shop information" });
  }
});

// Get all shops (public route, paginated)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    // Build query for Supabase
    let query = supabase.from('shops').select('id, name, address, business_type, created_at', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,business_type.ilike.%${search}%`);
    }

    // Get total count and data
    const { data: shops, error, count: total } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      shops,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all shops error:", error);
    res.status(500).json({ error: "Failed to get shops" });
  }
});

// Get shop statistics (protected route, owner only)
router.get("/my-shop/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has a shop
    const shop = await getQuery("shops", { user_id: userId }, "id");
    if (!shop) {
      return res.status(404).json({ error: "No shop found for this user" });
    }

    // Get basic shop info
    const shopInfo = await getQuery("shops", { user_id: userId });

    // TODO: Add more statistics as features are implemented
    // For now, return basic shop information
    const stats = {
      shop: shopInfo,
      // Placeholder for future statistics
      totalProducts: 0,
      totalSales: 0,
      totalCustomers: 0,
      monthlyRevenue: 0,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get shop stats error:", error);
    res.status(500).json({ error: "Failed to get shop statistics" });
  }
});

module.exports = router;
