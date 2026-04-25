-- Drop old table if it exists
DROP TABLE IF EXISTS payment_transactions;

-- Create payment_transactions table with PayPal fields
CREATE TABLE payment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    txn_ref VARCHAR(100) NOT NULL UNIQUE COMMENT 'Mã giao dịch (PayPal OrderId)',
    user_id BIGINT NOT NULL COMMENT 'User ID',
    amount BIGINT NOT NULL COMMENT 'Số tiền (VND)',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, SUCCESS, FAILED',
    provider VARCHAR(50) NOT NULL COMMENT 'PAYPAL hoặc VNPAY',
    response_code VARCHAR(50) COMMENT 'Response code từ PayPal',
    order_info VARCHAR(500) COMMENT 'Thông tin đơn hàng',
    paypal_data LONGTEXT COMMENT 'JSON response data từ PayPal',
    paypal_order_id VARCHAR(100) COMMENT 'PayPal Order ID',
    payer_id VARCHAR(100) COMMENT 'PayPal Payer ID',
    capture_id VARCHAR(100) COMMENT 'PayPal Capture ID',
    transaction_no VARCHAR(100) COMMENT 'Mã giao dịch tại PayPal',
    bank_code VARCHAR(50) COMMENT 'Mã ngân hàng',
    ip_address VARCHAR(50) COMMENT 'IP người thanh toán',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_txn_ref (txn_ref),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_paypal_order_id (paypal_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ giao dịch thanh toán PayPal';

-- Add foreign key to users table
ALTER TABLE payment_transactions 
ADD CONSTRAINT fk_payment_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
