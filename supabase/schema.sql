-- Pyjama Design (بيجاما ديزاين) ERP Database Schema

-- 1. Store & Security Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    admin_pin_hash VARCHAR(255) NOT NULL DEFAULT '765483', -- Default PIN: 765483
    cashier_pin VARCHAR(50) DEFAULT '123456',
    packaging_pin VARCHAR(50) DEFAULT '654321',
    instagram_url VARCHAR(255) DEFAULT 'https://www.instagram.com/pyjama_dz',
    tiktok_url VARCHAR(255) DEFAULT 'https://www.tiktok.com/@pyjama_dz',
    facebook_url VARCHAR(255) DEFAULT 'https://www.facebook.com/pyjamadz',
    maps_url VARCHAR(500) DEFAULT 'https://maps.google.com/?q=Chlef,Algeria',
    whatsapp_number VARCHAR(50) DEFAULT '+213555000000',
    call_phone_numbers TEXT[] DEFAULT ARRAY['+213 555 11 22 33', '+213 666 44 55 66'],
    store_manager_phone VARCHAR(50) DEFAULT '+213 555 11 22 33',
    delivery_manager_phone VARCHAR(50) DEFAULT '+213 555 22 33 44',
    packaging_staff_phone VARCHAR(50) DEFAULT '+213 555 33 44 55',
    address_wilaya VARCHAR(100) DEFAULT 'الشلف',
    address_commune VARCHAR(100) DEFAULT 'الشلف',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial settings row if not exists
INSERT INTO settings (id, admin_pin_hash, address_wilaya, address_commune)
VALUES (1, '765483', 'الشلف', 'الشلف')
ON CONFLICT (id) DO NOTHING;

-- 2. Store Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Categories
INSERT INTO categories (name_ar, name_fr, slug) VALUES
('بيجامات حريرية', 'Pyjamas Hiver', 'pyjamas-hiver'),
('ملابس النوم', 'Nuisettes & Lingerie', 'nuisettes-lingerie'),
('أحذية داخلية', 'Chaussons & Pantoufles', 'chaussons'),
('روب دو شامبر', 'Peignoirs & Robes', 'peignoirs')
ON CONFLICT (slug) DO NOTHING;

-- 3. Suppliers Management Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    total_orders INT DEFAULT 0,
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Suppliers
INSERT INTO suppliers (name, phone, total_orders, outstanding_balance) VALUES
('مؤسسة الأناقة للمنسوجات', '+213 550 12 34 56', 15, 120000.00),
('ورشه البهجة للبيجاما', '+213 661 98 76 54', 8, 45000.00)
ON CONFLICT DO NOTHING;

-- 4. Customer Database & Scoring System
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    wilaya VARCHAR(100) NOT NULL DEFAULT 'الشلف',
    commune VARCHAR(100) NOT NULL DEFAULT 'الشلف',
    confirmed_orders INT DEFAULT 0,
    cancelled_orders INT DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Customers
INSERT INTO customers (full_name, phone, wilaya, commune, confirmed_orders, cancelled_orders, total_spent) VALUES
('أمينا بن علي', '+213 551 23 45 67', 'الشلف', 'الشلف', 7, 1, 38500.00),
('سارة بودواو', '+213 662 34 56 78', 'الجزائر', 'باب الزوار', 1, 4, 4500.00),
('فاطمة قاسم', '+213 773 45 67 89', 'وهران', 'السانية', 3, 1, 14200.00)
ON CONFLICT (phone) DO NOTHING;

-- 5. Products & Isolated Stock Manager
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name_ar VARCHAR(200) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    delivery_stock INT NOT NULL DEFAULT 0,  -- مخزون التوصيل
    store_stock INT NOT NULL DEFAULT 0,     -- مخزون المحل
    wholesale_stock INT NOT NULL DEFAULT 0, -- مخزون الجملة
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Orders History & Tracking
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequential_id INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    formatted_id VARCHAR(20),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    wilaya VARCHAR(100) NOT NULL,
    commune VARCHAR(100) NOT NULL,
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('HOME', 'STOP_DESK')),
    total_amount_dzd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'UNCONFIRMED' 
        CHECK (status IN ('UNCONFIRMED', 'CONFIRMED', 'PACKAGING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Orders
INSERT INTO orders (customer_name, customer_phone, wilaya, commune, delivery_type, total_amount_dzd, status) VALUES
('أمينا بن علي', '+213 551 23 45 67', 'الشلف', 'الشلف', 'HOME', 5500.00, 'UNCONFIRMED'),
('سارة بودواو', '+213 662 34 56 78', 'الجزائر', 'باب الزوار', 'STOP_DESK', 4200.00, 'CONFIRMED'),
('فاطمة قاسم', '+213 773 45 67 89', 'وهران', 'السانية', 'HOME', 8900.00, 'DELIVERED')
ON CONFLICT DO NOTHING;

-- 7. Expenses & Financial Logs
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    amount_dzd NUMERIC(12, 2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('COGS', 'OPERATING', 'SHIPPING_RETURN', 'OTHER')),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Expenses
INSERT INTO expenses (title, amount_dzd, category, expense_date) VALUES
('شراء قماش حرير شتاء', 150000.00, 'COGS', '2026-08-01'),
('مصاريف الشحن والمرتجعات', 12500.00, 'SHIPPING_RETURN', '2026-08-05'),
('كهرباء وتدفئة المحل', 8500.00, 'OPERATING', '2026-08-07')
ON CONFLICT DO NOTHING;

-- 8. Complaints & Feedback Table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    subject VARCHAR(250) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Complaints
INSERT INTO complaints (customer_name, customer_phone, subject, message, status) VALUES
('سارة بودواو', '+213 662 34 56 78', 'تأخر التوصيل', 'الطلب تأخر يومين عن الموعد المحدد في محطة Stop Desk', 'PENDING');
