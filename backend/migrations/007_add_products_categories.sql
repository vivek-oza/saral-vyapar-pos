-- Add products and categories tables for Story 2.1

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, name)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  margin_in_currency DECIMAL(10,2) DEFAULT 0 CHECK (margin_in_currency >= 0),
  selling_price DECIMAL(10,2) NOT NULL CHECK (selling_price >= 0),
  category TEXT, -- For backward compatibility and simple categorization
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  sku TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, sku) -- SKU unique within shop
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_shop_id ON categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories
CREATE POLICY "Users can view own shop categories" ON categories 
  FOR SELECT USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own shop categories" ON categories 
  FOR INSERT WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own shop categories" ON categories 
  FOR UPDATE USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own shop categories" ON categories 
  FOR DELETE USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

-- RLS Policies for Products
CREATE POLICY "Users can view own shop products" ON products 
  FOR SELECT USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own shop products" ON products 
  FOR INSERT WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own shop products" ON products 
  FOR UPDATE USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own shop products" ON products 
  FOR DELETE USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

-- Function to automatically update selling_price when base_price or margin changes
CREATE OR REPLACE FUNCTION update_selling_price()
RETURNS TRIGGER AS $$
BEGIN
  NEW.selling_price = NEW.base_price + COALESCE(NEW.margin_in_currency, 0);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate selling price
CREATE TRIGGER trigger_update_selling_price
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_selling_price();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at timestamp
CREATE TRIGGER trigger_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();