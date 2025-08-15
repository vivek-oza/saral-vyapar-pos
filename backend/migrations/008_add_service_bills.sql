-- Add service bills table for Story 3.2

-- Service Bills table
CREATE TABLE IF NOT EXISTS service_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  bill_number TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  service_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Received')),
  payment_mode TEXT DEFAULT 'Pending',
  business_type TEXT DEFAULT 'Service',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bill_number),
  UNIQUE(invoice_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_bills_shop_id ON service_bills(shop_id);
CREATE INDEX IF NOT EXISTS idx_service_bills_bill_number ON service_bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_service_bills_invoice_number ON service_bills(invoice_number);
CREATE INDEX IF NOT EXISTS idx_service_bills_customer_name ON service_bills(customer_name);
CREATE INDEX IF NOT EXISTS idx_service_bills_status ON service_bills(status);
CREATE INDEX IF NOT EXISTS idx_service_bills_created_at ON service_bills(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE service_bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Service Bills
CREATE POLICY "Users can view own shop service bills" ON service_bills 
  FOR SELECT USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own shop service bills" ON service_bills 
  FOR INSERT WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own shop service bills" ON service_bills 
  FOR UPDATE USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own shop service bills" ON service_bills 
  FOR DELETE USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

-- Function to generate sequential bill numbers
CREATE OR REPLACE FUNCTION generate_bill_number(shop_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  bill_count INTEGER;
  bill_number TEXT;
BEGIN
  -- Get count of existing bills for this shop
  SELECT COUNT(*) INTO bill_count 
  FROM service_bills 
  WHERE shop_id = shop_uuid;
  
  -- Generate bill number: SB + shop_id_prefix + sequential_number
  bill_number := 'SB' || UPPER(SUBSTRING(shop_uuid::TEXT, 1, 8)) || LPAD((bill_count + 1)::TEXT, 4, '0');
  
  RETURN bill_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate sequential invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number(shop_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  invoice_count INTEGER;
  invoice_number TEXT;
BEGIN
  -- Get count of existing bills for this shop
  SELECT COUNT(*) INTO invoice_count 
  FROM service_bills 
  WHERE shop_id = shop_uuid;
  
  -- Generate invoice number: INV + year + shop_id_prefix + sequential_number
  invoice_number := 'INV' || EXTRACT(YEAR FROM NOW()) || UPPER(SUBSTRING(shop_uuid::TEXT, 1, 6)) || LPAD((invoice_count + 1)::TEXT, 4, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically generate bill and invoice numbers
CREATE OR REPLACE FUNCTION auto_generate_bill_numbers()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate bill number if not provided
  IF NEW.bill_number IS NULL OR NEW.bill_number = '' THEN
    NEW.bill_number = generate_bill_number(NEW.shop_id);
  END IF;
  
  -- Generate invoice number if not provided
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number = generate_invoice_number(NEW.shop_id);
  END IF;
  
  -- Update timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate bill numbers
CREATE TRIGGER trigger_auto_generate_bill_numbers
  BEFORE INSERT ON service_bills
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_bill_numbers();

-- Trigger to update updated_at timestamp
CREATE TRIGGER trigger_service_bills_updated_at
  BEFORE UPDATE ON service_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for daily statistics
CREATE OR REPLACE VIEW service_bills_daily_stats AS
SELECT 
  shop_id,
  DATE(created_at) as bill_date,
  COUNT(*) as total_bills,
  SUM(CASE WHEN status = 'Received' THEN total_amount ELSE 0 END) as daily_collection,
  SUM(CASE WHEN status = 'Pending' THEN total_amount ELSE 0 END) as daily_pending,
  SUM(total_amount) as daily_total
FROM service_bills
GROUP BY shop_id, DATE(created_at);

-- Create a view for overall statistics
CREATE OR REPLACE VIEW service_bills_stats AS
SELECT 
  shop_id,
  COUNT(*) as total_bills,
  SUM(CASE WHEN status = 'Received' THEN total_amount ELSE 0 END) as total_received,
  SUM(CASE WHEN status = 'Pending' THEN total_amount ELSE 0 END) as total_pending,
  SUM(total_amount) as grand_total,
  MAX(created_at) as last_bill_date
FROM service_bills
GROUP BY shop_id;