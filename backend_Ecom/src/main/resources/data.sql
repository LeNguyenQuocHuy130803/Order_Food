-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users_roles junction table
CREATE TABLE IF NOT EXISTS users_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Insert default roles if they do not exist
INSERT INTO roles (name)
SELECT 'Administrators'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'Administrators'
);

INSERT INTO roles (name)
SELECT 'Customers'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'Customers'
);

INSERT INTO roles (name)
SELECT 'Employees'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'Employees'
);

-- Insert default admin user if it does not exist
INSERT INTO users (email, username, password, phone_number)
SELECT 'admin@example.com', 'admin', '191205', '0765233951'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin'
);

-- Assign admin role to admin user
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id
FROM (SELECT id FROM users WHERE username = 'admin' LIMIT 1) u,
     (SELECT id FROM roles WHERE name = 'Administrators' LIMIT 1) r
WHERE NOT EXISTS (
    SELECT 1 FROM users_roles WHERE user_id = u.id AND role_id = r.id
);

