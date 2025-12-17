-- Migration: Create crypto_payments table
-- This table stores cryptocurrency payment details for orders

CREATE TABLE IF NOT EXISTS crypto_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  crypto_type ENUM('bitcoin', 'ethereum', 'usdt') NOT NULL,
  crypto_amount DECIMAL(20, 8) NOT NULL,
  usd_amount DECIMAL(10, 2) NOT NULL,
  wallet_address VARCHAR(100) NOT NULL,
  payment_reference VARCHAR(100) NOT NULL UNIQUE,
  transaction_hash VARCHAR(100) NULL,
  status ENUM('pending', 'completed', 'failed', 'expired') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_order_user (order_id, user_id),
  INDEX idx_status (status),
  INDEX idx_payment_reference (payment_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add payment_confirmed_at column to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP NULL AFTER payment_method;

-- Update orders status enum to include 'paid' if not already present
-- Note: MySQL doesn't support easy ALTER ENUM, so we need to modify the column
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending';
