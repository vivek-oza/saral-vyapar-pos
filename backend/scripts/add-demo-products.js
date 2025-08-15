require('dotenv').config();
const { supabase } = require('../config/supabase');

const demoProducts = [
    {
        name: "Asian Paints Royale Luxury Emulsion - White",
        description: "Premium interior wall paint with silk finish. Washable and durable.",
        base_price: 850.00,
        margin_in_currency: 150.00,
        category: "Interior Paint",
        stock: 25,
        sku: "AP-RLE-WHT-001"
    },
    {
        name: "Berger Silk Glamour - Ivory",
        description: "Smooth silk finish paint for living rooms and bedrooms.",
        base_price: 720.00,
        margin_in_currency: 130.00,
        category: "Interior Paint",
        stock: 0,
        sku: "BG-SG-IVY-002"
    },
    {
        name: "Nerolac Excel Anti Dust - Magnolia",
        description: "Anti-dust technology paint that repels dust and dirt.",
        base_price: 680.00,
        margin_in_currency: 120.00,
        category: "Interior Paint",
        stock: 8,
        sku: "NR-EAD-MAG-003"
    },
    {
        name: "Asian Paints Apex Ultima - Storm Grey",
        description: "Weather resistant exterior paint with 12-year warranty.",
        base_price: 950.00,
        margin_in_currency: 200.00,
        category: "Exterior Paint",
        stock: 15,
        sku: "AP-AU-SGR-004"
    },
    {
        name: "Dulux Weathershield Max - Terracotta",
        description: "Maximum weather protection for exterior walls.",
        base_price: 890.00,
        margin_in_currency: 180.00,
        category: "Exterior Paint",
        stock: 3,
        sku: "DX-WSM-TER-005"
    },
    {
        name: "Berger Walmasta - Pure White",
        description: "Cement-based wall putty for smooth wall finish.",
        base_price: 320.00,
        margin_in_currency: 80.00,
        category: "Wall Putty",
        stock: 45,
        sku: "BG-WM-PWH-006"
    },
    {
        name: "Asian Paints Wall Care Putty",
        description: "Acrylic wall putty for interior and exterior walls.",
        base_price: 380.00,
        margin_in_currency: 70.00,
        category: "Wall Putty",
        stock: 22,
        sku: "AP-WCP-007"
    },
    {
        name: "Fevicol Marine - Waterproof Adhesive",
        description: "Waterproof wood adhesive for marine applications.",
        base_price: 145.00,
        margin_in_currency: 35.00,
        category: "Adhesives",
        stock: 12,
        sku: "FC-MAR-008"
    },
    {
        name: "Asian Paints Primer - Universal",
        description: "Multi-surface primer for better paint adhesion.",
        base_price: 420.00,
        margin_in_currency: 80.00,
        category: "Primer",
        stock: 18,
        sku: "AP-PRM-UNI-009"
    },
    {
        name: "Berger Bison Acrylic Distemper - Sky Blue",
        description: "Water-based distemper for interior walls and ceilings.",
        base_price: 280.00,
        margin_in_currency: 60.00,
        category: "Distemper",
        stock: 0,
        sku: "BG-BAD-SKB-010"
    },
    {
        name: "Nerolac Suraksha Plus - Red Oxide",
        description: "Anti-corrosive primer for metal surfaces.",
        base_price: 340.00,
        margin_in_currency: 70.00,
        category: "Metal Paint",
        stock: 6,
        sku: "NR-SP-ROX-011"
    },
    {
        name: "Asian Paints Tractor Emulsion - Cream",
        description: "Economy emulsion paint for budget-conscious customers.",
        base_price: 480.00,
        margin_in_currency: 90.00,
        category: "Economy Paint",
        stock: 35,
        sku: "AP-TE-CRM-012"
    }
];

async function addDemoProducts() {
    try {
        console.log('🎨 Adding demo paint shop products...');

        // First, let's get all shops to add products to
        const { data: shops, error: shopsError } = await supabase
            .from('shops')
            .select('id, name, user_id');

        if (shopsError) {
            console.error('Error fetching shops:', shopsError);
            return;
        }

        if (!shops || shops.length === 0) {
            console.log('No shops found. Please create a shop first.');
            return;
        }

        console.log(`Found ${shops.length} shop(s). Adding products to each...`);

        for (const shop of shops) {
            console.log(`\n📦 Adding products to shop: ${shop.name}`);

            // Prepare products with shop_id
            const productsWithShopId = demoProducts.map(product => ({
                ...product,
                shop_id: shop.id
            }));

            // Insert products
            const { data: insertedProducts, error: insertError } = await supabase
                .from('products')
                .insert(productsWithShopId)
                .select('id, name, stock, selling_price');

            if (insertError) {
                console.error(`Error adding products to shop ${shop.name}:`, insertError);
                continue;
            }

            console.log(`✅ Successfully added ${insertedProducts.length} products to ${shop.name}`);

            // Show summary
            const totalValue = insertedProducts.reduce((sum, p) => sum + parseFloat(p.selling_price), 0);
            const totalStock = insertedProducts.reduce((sum, p) => sum + p.stock, 0);
            const outOfStock = insertedProducts.filter(p => p.stock === 0).length;
            const lowStock = insertedProducts.filter(p => p.stock > 0 && p.stock <= 10).length;

            console.log(`   📊 Total inventory value: ₹${totalValue.toFixed(2)}`);
            console.log(`   📦 Total stock units: ${totalStock}`);
            console.log(`   ❌ Out of stock: ${outOfStock} products`);
            console.log(`   ⚠️  Low stock (≤10): ${lowStock} products`);
        }

        console.log('\n🎉 Demo products added successfully!');
        console.log('\nStock Level Summary:');
        console.log('• Out of Stock (0): Berger Silk Glamour, Berger Bison Acrylic Distemper');
        console.log('• Low Stock (1-10): Dulux Weathershield Max (3), Nerolac Suraksha Plus (6), Nerolac Excel Anti Dust (8)');
        console.log('• Good Stock (11+): All other products');

    } catch (error) {
        console.error('Error in addDemoProducts:', error);
    }
}

// Run the script
if (require.main === module) {
    addDemoProducts()
        .then(() => {
            console.log('\n✨ Script completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { addDemoProducts, demoProducts };