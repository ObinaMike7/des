DO $$
BEGIN
  CREATE TYPE product_status AS ENUM ('active', 'inactive', 'discontinued');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  item_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  price DECIMAL(10, 2),
  status product_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER,
  transaction_type VARCHAR(50) NOT NULL,
  quantity_change INTEGER,
  old_quantity INTEGER,
  new_quantity INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_item_number ON products(item_number);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_user_id ON inventory_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);

INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and accessories'),
  ('Computers', 'Computers and peripherals'),
  ('Accessories', 'Computer accessories')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (item_number, name, description, category_id, quantity, price) VALUES
  ('11111', 'Wireless Mouse', 'Ergonomic wireless mouse', 3, 20, 29.99),
  ('11112', 'Monitor', '24-inch Full HD Monitor', 2, 20, 199.99),
  ('11113', 'Keyboard', 'Mechanical RGB Keyboard', 3, 20, 89.99),
  ('11114', 'Headphone', 'Noise-canceling headphones', 3, 20, 149.99),
  ('11115', 'UPS', 'Uninterruptible Power Supply', 1, 20, 249.99)
ON CONFLICT (item_number) DO NOTHING;
