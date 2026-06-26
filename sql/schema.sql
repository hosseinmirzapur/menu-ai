-- Digital Cafe (کافه دیجیتال) — Multi-tenant Schema
-- Run this once in the Supabase SQL Editor to set up the database.

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name_fa VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_fa TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    cover_url TEXT DEFAULT '',
    theme_config JSONB DEFAULT '{}',
    business_hours JSONB DEFAULT '{}',
    phone VARCHAR(20) DEFAULT '',
    cafe_password VARCHAR(100) DEFAULT '',
    address JSONB DEFAULT '{"text": ""}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name_fa VARCHAR(255) DEFAULT '',
    full_name_en VARCHAR(255) DEFAULT '',
    role VARCHAR(20) NOT NULL DEFAULT 'staff',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email, restaurant_id)
);

-- Menu categories table
CREATE TABLE IF NOT EXISTS menu_categories (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name_fa VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES menu_categories(id) ON DELETE SET NULL,
    name_fa VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_fa TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    price INTEGER NOT NULL,
    cost INTEGER DEFAULT 0,
    image_url TEXT DEFAULT '',
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    preparation_time INTEGER DEFAULT 0,
    ingredients JSONB DEFAULT '[]',
    allergens JSONB DEFAULT '[]',
    modifiers JSONB DEFAULT '[]',
    dietary_tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) DEFAULT '',
    customer_name VARCHAR(255) DEFAULT '',
    table_number VARCHAR(50) DEFAULT '',
    items JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    order_type VARCHAR(20) NOT NULL DEFAULT 'dine_in',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(20) NOT NULL,
    provider VARCHAR(100) DEFAULT '',
    transaction_id VARCHAR(255) DEFAULT '',
    amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) DEFAULT '',
    customer_name VARCHAR(255) DEFAULT '',
    rating INTEGER NOT NULL,
    comment TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_users_restaurant_id ON users(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON menu_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(timestamp);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
