require('dotenv').config();
const { supabase } = require('../config/supabase');

async function listProducts() {
    try {
        console.log('📋 Listing all products...\n');

        const { data: products, error } = await supabase
            .from('products')
            .select(`
        id,
        name,
        category,
        base_price,
        margin_in_currency,
        selling_price,
        stock,
        sku,
        shops(name)
      `)
            .eq('is_active', true)
            .order('stock', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            return;
        }

        if (!products || products.length === 0) {
            console.log('No products found.');
            return;
        }

        // Group by stock status
        const outOfStock = products.filter(p => p.stock === 0);
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10);
        const goodStock = products.filter(p => p.stock > 10);

        console.log('🔴 OUT OF STOCK:');
        outOfStock.forEach(p => {
            console.log(`   ${p.name} (${p.shops.name}) - ₹${p.selling_price} - SKU: ${p.sku}`);
        });

        console.log('\n🟡 LOW STOCK (1-10):');
        lowStock.forEach(p => {
            console.log(`   ${p.name} (${p.shops.name}) - Stock: ${p.stock} - ₹${p.selling_price} - SKU: ${p.sku}`);
        });

        console.log('\n🟢 GOOD STOCK (11+):');
        goodStock.forEach(p => {
            console.log(`   ${p.name} (${p.shops.name}) - Stock: ${p.stock} - ₹${p.selling_price} - SKU: ${p.sku}`);
        });

        console.log(`\n📊 SUMMARY:`);
        console.log(`   Total Products: ${products.length}`);
        console.log(`   Out of Stock: ${outOfStock.length}`);
        console.log(`   Low Stock: ${lowStock.length}`);
        console.log(`   Good Stock: ${goodStock.length}`);

        const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.selling_price) * p.stock), 0);
        const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);

        console.log(`   Total Inventory Value: ₹${totalValue.toFixed(2)}`);
        console.log(`   Total Stock Units: ${totalUnits}`);

    } catch (error) {
        console.error('Error in listProducts:', error);
    }
}

if (require.main === module) {
    listProducts()
        .then(() => {
            console.log('\n✨ Listing completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { listProducts };