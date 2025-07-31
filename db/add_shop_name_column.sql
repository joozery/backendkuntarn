-- Add shop_name column to inventory table
-- This script adds a shop_name column to track which shop/vendor the product was purchased from

ALTER TABLE inventory 
ADD COLUMN shop_name VARCHAR(255) AFTER product_name;

-- Add index for better search performance
CREATE INDEX idx_inventory_shop_name ON inventory(shop_name);

-- Update existing records with default value (optional)
-- UPDATE inventory SET shop_name = 'ไม่ระบุ' WHERE shop_name IS NULL;

-- Verify the column was added
DESCRIBE inventory; 