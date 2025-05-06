-- Add tax_rate_id column to sales_orders table
ALTER TABLE sales_orders
ADD COLUMN tax_rate_id UUID NULL;

-- Add foreign key constraint
ALTER TABLE sales_orders
ADD CONSTRAINT sales_orders_tax_rate_id_fkey
FOREIGN KEY (tax_rate_id)
REFERENCES tax_rates(id)
ON DELETE SET NULL; -- Or ON DELETE RESTRICT, depending on desired behavior. SET NULL seems reasonable.

-- Optional: Add index for performance
CREATE INDEX sales_orders_tax_rate_id_idx ON sales_orders (tax_rate_id);
