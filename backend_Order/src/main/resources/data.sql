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
    phone_number VARCHAR(20) NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0 NOT NULL,
    is_account_locked BOOLEAN DEFAULT FALSE,
    lockout_time TIMESTAMP NULL,
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

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    otp VARCHAR(6) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    otp_expiry TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Insert default roles if they do not exist
INSERT INTO roles (name)
SELECT 'ADMIN'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'ADMIN'
);

INSERT INTO roles (name)
SELECT 'CUSTOMER'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'CUSTOMER'
);

INSERT INTO roles (name)
SELECT 'EMPLOYEE'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'EMPLOYEE'
);

-- Insert default admin user if it does not exist
INSERT INTO users (email, username, password, phone_number)
SELECT 'huyhoanglenguyen8@gmail.com', 'huyhoanglenguyen8', '$2a$10$7zVn2qI5f1XQ0b/e.m2.w.JmO2j31eXG0jV1.k1q9O1Y1h1z1c.K', '0765233951'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'huyhoanglenguyen8@gmail.com'
);

-- Assign admin role to admin user
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id
FROM (SELECT id FROM users WHERE email = 'huyhoanglenguyen8@gmail.com' LIMIT 1) u,
     (SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1) r
WHERE NOT EXISTS (
    SELECT 1 FROM users_roles WHERE user_id = u.id AND role_id = r.id
);

-- ========================================================
-- CREATE PRODUCTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500) NULL,
    category VARCHAR(50) NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    unit VARCHAR(50) NOT NULL DEFAULT 'ITEM',
    region VARCHAR(50) NOT NULL DEFAULT 'HA_NOI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Đảm bảo created_at và updated_at có DEFAULT nếu bảng đã được Hibernate tự động tạo trước đó
ALTER TABLE products 
    MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ========================================================
-- SEED DATA: FOOD (12 items)
-- ========================================================
INSERT INTO products (name, description, price, quantity, image_url, category, featured, unit, region, created_at, updated_at)
VALUES 
('Phở bò đặc biệt Hà Nội', 'Phở bò gia truyền Hà Nội với nước dùng xương hầm 12 tiếng đậm đà, thịt bò tái lăn mềm ngọt, bánh phở tươi dẻo thơm.', 65000.00, 50, '/image/food/pho-bo-ha-noi.jpg', 'FOOD', TRUE, 'BOWL', 'HA_NOI', NOW(), NOW()),
('Bánh mì thịt nướng pate Sài Gòn', 'Bánh mì giòn rụm kẹp thịt nướng sốt đậm đà, pate béo ngậy kèm đồ chua và dưa leo tươi mát.', 35000.00, 80, '/image/food/banhmythit.jpg', 'FOOD', TRUE, 'ITEM', 'HO_CHI_MINH', NOW(), NOW()),
('Cơm tấm sườn bì chả đặc biệt', 'Cơm tấm hạt tơi xốp ăn kèm sườn cốt lết nướng mật ong thơm lừng, chả trứng béo mềm, bì heo giòn dai và nước mắm ớt chua ngọt.', 60000.00, 60, '/image/food/comtamSG.jpg', 'FOOD', TRUE, 'PORTION', 'HO_CHI_MINH', NOW(), NOW()),
('Cơm chiên Dương Châu hải sản', 'Cơm chiên hạt vàng ươm cùng tôm sú, lạp xưởng tươi, đậu Hà Lan, ngô ngọt và trứng thơm ngậy.', 55000.00, 45, '/image/food/com-chien-duong-chau.jpg', 'FOOD', FALSE, 'PORTION', 'HO_CHI_MINH', NOW(), NOW()),
('Nem rán truyền thống Hà Nội', 'Nem rán vỏ giòn rụm nhân thịt heo nạc, mộc nhĩ, miến dong, cà rốt chấm nước mắm tỏi ớt chua ngọt.', 70000.00, 40, '/image/food/nem-ran-ha-noi.jpg', 'FOOD', TRUE, 'PORTION', 'HA_NOI', NOW(), NOW()),
('Gà quay lắc thảo mộc giòn bì', 'Nửa con gà ta thả vườn ướp gia vị thảo mộc quay vàng ruộm, da giòn rụm thịt mềm mọng nước.', 120000.00, 30, '/image/food/gaquaylac.jpg', 'FOOD', TRUE, 'PORTION', 'DA_NANG', NOW(), NOW()),
('Cơm gà xé Hội An', 'Cơm vàng óng nấu từ nước luộc gà béo ngọt, thịt gà ta xé phay bóp gỏi hành tây rau răm đậm vị.', 58000.00, 55, '/image/food/comgaHN.jpg', 'FOOD', FALSE, 'PORTION', 'DA_NANG', NOW(), NOW()),
('Bánh mì Pate truyền thống', 'Bánh mì nướng nóng hổi phết lớp pate gan béo bùi thủ công, bơ thơm lừng và ruốc heo thơm ngon.', 25000.00, 90, '/image/food/banh-mi-pate.jpg', 'FOOD', FALSE, 'ITEM', 'HA_NOI', NOW(), NOW()),
('Mì xá xíu thượng hạng Hồng Kông', 'Mì trứng tươi dai ngon kết hợp cùng thịt xá xíu mật ong nướng xém cạnh thơm phức và cải ngọt giòn mát.', 55000.00, 40, '/image/food/myxaxiu.jpg', 'FOOD', FALSE, 'BOWL', 'HO_CHI_MINH', NOW(), NOW()),
('Mì xào giòn sốt hải sản Singapore', 'Mì chiên phồng giòn rụm quyện trong nước sốt hải sản tôm mực rau củ đậm đà phong vị Singapore.', 65000.00, 35, '/image/food/mon-mi-xao-singapore.jpg', 'FOOD', FALSE, 'PORTION', 'DA_NANG', NOW(), NOW()),
('Pizza hải sản phô mai nướng củi', 'Bánh pizza đế tươi thủ công nướng lò củi, ngập tràn phô mai Mozzarella kéo sợi, tôm sú, mực tươi và sốt cà chua Ý.', 139000.00, 25, '/image/food/pizza.jpg', 'FOOD', TRUE, 'ITEM', 'HO_CHI_MINH', NOW(), NOW()),
('Hamburger bò phô mai xông khói', 'Vỏ bánh hạt mè nướng mềm kẹp bò Úc xay nướng than hoa, phô mai Cheddar tan chảy và sốt BBQ đặc trưng.', 49000.00, 50, '/image/food/hamberge.jpg', 'FOOD', FALSE, 'ITEM', 'HA_NOI', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    price = VALUES(price),
    quantity = VALUES(quantity),
    image_url = VALUES(image_url),
    category = VALUES(category),
    featured = VALUES(featured),
    unit = VALUES(unit),
    region = VALUES(region),
    updated_at = NOW();

-- ========================================================
-- SEED DATA: DRINK (12 items)
-- ========================================================
INSERT INTO products (name, description, price, quantity, image_url, category, featured, unit, region, created_at, updated_at)
VALUES 
('Trà sen vàng Macchiato', 'Trà ô long thanh khiết kết hợp hạt sen tươi bùi dẻo, củ năng giòn ngọt và lớp foam kem cheese sánh mịn.', 45000.00, 100, '/image/drink/tra1.jpg', 'DRINK', TRUE, 'CUP', 'HA_NOI', NOW(), NOW()),
('Trà đào cam sả thanh nhiệt', 'Vị đắng nhẹ của trà đen hòa quyện hoàn hảo cùng vị chua ngọt từ đào ngâm giòn và hương cam sả thơm ngát.', 40000.00, 120, '/image/drink/tra2.jpg', 'DRINK', TRUE, 'CUP', 'HO_CHI_MINH', NOW(), NOW()),
('Trà sữa trân châu đường đen', 'Sữa tươi thanh trùng Đà Lạt kết hợp cốt trà hảo hạng và trân châu đường đen Đài Loan mềm dẻo.', 42000.00, 150, '/image/drink/tra3.jpg', 'DRINK', TRUE, 'CUP', 'HO_CHI_MINH', NOW(), NOW()),
('Cà phê sữa đá pha phin Sài Gòn', 'Cà phê Robusta Đắk Lắk nguyên chất pha phin truyền thống hòa quyện cùng sữa đặc béo ngậy.', 29000.00, 110, '/image/drink/drink1.jpg', 'DRINK', TRUE, 'CUP', 'HO_CHI_MINH', NOW(), NOW()),
('Cà phê đen đá mộc', 'Cà phê đen nguyên chất rang mộc đậm đà, thơm nồng đánh thức mọi giác quan.', 25000.00, 80, '/image/drink/drink2.jpg', 'DRINK', FALSE, 'CUP', 'HA_NOI', NOW(), NOW()),
('Nước ép cam sành tươi nguyên chất', 'Nước ép từ 100% cam sành miền Tây mọng nước, giàu Vitamin C, vị chua ngọt tự nhiên không thêm đường.', 35000.00, 70, '/image/drink/drink3.jpg', 'DRINK', FALSE, 'CUP', 'CAN_THO', NOW(), NOW()),
('Sinh tố bơ sáp cốt dừa', 'Bơ sáp Đắk Lắk tuyển chọn xay nhuyễn sánh mịn cùng cốt dừa Bến Tre và sữa tươi béo thơm.', 45000.00, 60, '/image/drink/drink4.jpg', 'DRINK', TRUE, 'CUP', 'DA_NANG', NOW(), NOW()),
('Sinh tố xoài cát nhiệt đới', 'Xoài cát Hoà Lộc chín mọng xay mát lạnh, thơm nức hương vị trái cây nhiệt đới.', 40000.00, 65, '/image/drink/drink5.jpg', 'DRINK', FALSE, 'CUP', 'HO_CHI_MINH', NOW(), NOW()),
('Nước ép dưa hấu mát lạnh', 'Nước ép dưa hấu đỏ ngọt lịm giải nhiệt sảng khoái cho ngày nắng nóng.', 32000.00, 90, '/image/drink/drink6.jpg', 'DRINK', FALSE, 'CUP', 'HO_CHI_MINH', NOW(), NOW()),
('Matcha Nhật Bản đá xay kem tươi', 'Bột trà xanh Uji Nhật Bản nguyên chất xay cùng sữa tươi phủ bông kem tươi whipping béo mịn.', 50000.00, 55, '/image/drink/drink7.jpg', 'DRINK', TRUE, 'CUP', 'HA_NOI', NOW(), NOW()),
('Nước chanh leo tuyết hạt chia', 'Nước cốt chanh leo chua thanh kết hợp hạt chia hữu cơ bổ dưỡng và đá tuyết mát lạnh.', 35000.00, 75, '/image/drink/drink8.jpg', 'DRINK', FALSE, 'CUP', 'DA_NANG', NOW(), NOW()),
('Trà việt quất bạc hà sảng khoái', 'Trà hoa quả thơm mát với mứt việt quất tự nhiên và lá bạc hà the mát cực kỳ kích thích vị giác.', 42000.00, 60, '/image/drink/drink9.jpg', 'DRINK', FALSE, 'CUP', 'HO_CHI_MINH', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    price = VALUES(price),
    quantity = VALUES(quantity),
    image_url = VALUES(image_url),
    category = VALUES(category),
    featured = VALUES(featured),
    unit = VALUES(unit),
    region = VALUES(region),
    updated_at = NOW();

-- ========================================================
-- SEED DATA: DESSERT (12 items)
-- ========================================================
INSERT INTO products (name, description, price, quantity, image_url, category, featured, unit, region, created_at, updated_at)
VALUES 
('Bánh Tiramisu Ý truyền thống', 'Bánh kem Tiramisu chuẩn phong cách Ý với lớp phô mai Mascarpone béo mịn quyện hương rượu rum và cà phê Espresso nồng nàn.', 52000.00, 40, '/image/dessert/Classic Tiramisu.jpg', 'DESSERT', TRUE, 'PIECE', 'HA_NOI', NOW(), NOW()),
('Bánh Brownie Chocolate hạnh nhân', 'Bánh Brownie đẫm vị socola đen nguyên chất 70%, kết cấu ẩm mềm fudgy và hạt hạnh nhân bùi bùi.', 45000.00, 50, '/image/dessert/banhbrownie1.jpg', 'DESSERT', TRUE, 'PIECE', 'HO_CHI_MINH', NOW(), NOW()),
('Bánh Cheesecake dâu tây New York', 'Bánh kem phô mai nướng phong cách New York béo ngậy phủ mứt dâu tây tươi chua ngọt tinh tế.', 55000.00, 35, '/image/dessert/Strawberry Cheesecake.jpg', 'DESSERT', TRUE, 'PIECE', 'HO_CHI_MINH', NOW(), NOW()),
('Bánh Mousse chanh dây nhiệt đới', 'Lớp mousse sánh mịn tan ngay đầu lưỡi với vị chua dịu thanh khiết của chanh dây tươi và cốt bánh bông lan mềm.', 48000.00, 45, '/image/dessert/banhMousse1.jpg', 'DESSERT', FALSE, 'PIECE', 'DA_NANG', NOW(), NOW()),
('Bánh Donut phủ socola giòn', 'Bánh donut nướng phồng xốp nhúng lớp socola Bỉ đậm đà rắc kẹo cốm màu sắc bắt mắt.', 30000.00, 60, '/image/dessert/Chocolate Donuts.jpg', 'DESSERT', FALSE, 'ITEM', 'HO_CHI_MINH', NOW(), NOW()),
('Bánh Donut phủ đường kem tuyết', 'Donut tròn truyền thống tráng men đường mỏng giòn ngọt dịu, thích hợp thưởng thức cùng cà phê nóng.', 28000.00, 70, '/image/dessert/Glazed Donuts.jpg', 'DESSERT', FALSE, 'ITEM', 'HA_NOI', NOW(), NOW()),
('Bánh Tart trứng nướng phô mai Macao', 'Vỏ bánh ngàn lớp giòn tan bao bọc lớp kem trứng sữa nướng caramel vàng óng thơm ngậy mùi bơ Pháp.', 32000.00, 55, '/image/dessert/banhtarrt1.jpg', 'DESSERT', TRUE, 'PIECE', 'HO_CHI_MINH', NOW(), NOW()),
('Pudding xoài cốt dừa tươi', 'Thạch pudding dẻo mềm từ xoài tươi ngọt thơm, chan lớp nước cốt dừa béo bùi thanh mát.', 35000.00, 50, '/image/dessert/Mango Pudding.jpg', 'DESSERT', FALSE, 'CUP', 'DA_NANG', NOW(), NOW()),
('Pudding caramel vani hoàng gia', 'Bánh pudding trứng vani nướng mềm mịn như lụa ăn kèm sốt caramel đắng nhẹ thơm lừng.', 32000.00, 60, '/image/dessert/Vanilla Pudding.jpg', 'DESSERT', FALSE, 'CUP', 'HA_NOI', NOW(), NOW()),
('Bánh quy bơ Chocolate Chip', 'Gói bánh quy bơ vàng ruộm giòn tan đan xen hạt socola chip ngọt ngào hảo hạng.', 38000.00, 80, '/image/dessert/Chocolate Chip Cookies.jpg', 'DESSERT', FALSE, 'PACK', 'HO_CHI_MINH', NOW(), NOW()),
('Bánh Mousse việt quất phô mai', 'Sắc tím quyến rũ từ quả việt quất tự nhiên kết hợp phô mai béo và cốt bánh bông lan mềm mượt.', 50000.00, 35, '/image/dessert/banhMousse2.jpg', 'DESSERT', TRUE, 'PIECE', 'HA_NOI', NOW(), NOW()),
('Bánh kem bắp sữa non thơm béo', 'Chiếc bánh gato kem bắp thơm nức với hạt bắp tươi ngọt giòn cùng lớp kem sữa non tươi mát không hề ngấy.', 52000.00, 40, '/image/dessert/banhkem1.jpg', 'DESSERT', TRUE, 'PIECE', 'HO_CHI_MINH', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    price = VALUES(price),
    quantity = VALUES(quantity),
    image_url = VALUES(image_url),
    category = VALUES(category),
    featured = VALUES(featured),
    unit = VALUES(unit),
    region = VALUES(region),
    updated_at = NOW();

-- ========================================================
-- SEED DATA: FRESH (10 items)
-- ========================================================
INSERT INTO products (name, description, price, quantity, image_url, category, featured, unit, region, created_at, updated_at)
VALUES 
('Cá hồi phi lê tươi Nauy (500g)', 'Cá hồi nhập khẩu trực tiếp từ Nauy, thịt cam tươi vân mỡ đều, giàu Omega-3, đạt chuẩn sashimi.', 260000.00, 30, '/image/fresh/ca-hoi.jpg', 'FRESH', TRUE, 'PACK', 'HO_CHI_MINH', NOW(), NOW()),
('Thịt ba chỉ bò Úc thượng hạng (500g)', 'Ba chỉ bò Úc cuộn khay hút chân không sạch sẽ, thớ thịt mềm ngọt thích hợp nhúng lẩu hoặc nướng BBQ.', 165000.00, 40, '/image/fresh/thitbo.jpg', 'FRESH', TRUE, 'PACK', 'HA_NOI', NOW(), NOW()),
('Tôm sú tươi sống loại 1 (500g)', 'Tôm sú tươi sống vỏ bóng dày, thịt chắc ngọt đậm đà, đóng gói khay bảo quản tươi ngon.', 180000.00, 25, '/image/fresh/tomsu.jpg', 'FRESH', TRUE, 'PACK', 'CAN_THO', NOW(), NOW()),
('Mực ống tươi Cô Tô (500g)', 'Mực ống đánh bắt tự nhiên từ đảo Cô Tô, thân dày giòn ngọt, da sáng bóng tươi rói.', 170000.00, 20, '/image/fresh/muc-ong-tuoi.jpg', 'FRESH', FALSE, 'PACK', 'QUANG_NINH', NOW(), NOW()),
('Thịt nạc dăm heo sạch VietGAP (500g)', 'Thịt heo nạc dăm tươi mới mỗi ngày, mềm ngọt tự nhiên, không chất tạo nạc, đạt chuẩn VietGAP.', 85000.00, 50, '/image/fresh/thit-heo-nac.jpg', 'FRESH', FALSE, 'PACK', 'HO_CHI_MINH', NOW(), NOW()),
('Cà chua Đà Lạt hữu cơ (1kg)', 'Cà chua chín cây tự nhiên tại nông trại Đà Lạt, vỏ căng mọng giàu lycopene và khoáng chất.', 35000.00, 60, '/image/fresh/Ca-chua-Da-Lat.jpg', 'FRESH', FALSE, 'KG', 'LÂMS_DONG', NOW(), NOW()),
('Bó rau cải thìa tươi non (500g)', 'Rau cải thìa trồng thủy canh sạch, lá xanh mướt không thuốc trừ sâu, giòn ngọt thanh mát.', 18000.00, 80, '/image/fresh/bo-rau-cai.jpg', 'FRESH', FALSE, 'BUNDLE', 'HA_NOI', NOW(), NOW()),
('Cà rốt hữu cơ Đà Lạt (1kg)', 'Cà rốt củ cam tươi mới thu hoạch, vị ngọt tự nhiên dùng nấu canh, xào hoặc ép nước uống giải nhiệt.', 30000.00, 70, '/image/fresh/ca-rot-cam.jpg', 'FRESH', FALSE, 'KG', 'LÂMS_DONG', NOW(), NOW()),
('Cam sành Canh mọng nước (1kg)', 'Cam sành loại 1 mọng nước, vỏ mỏng hạt ít, vị ngọt thanh mát nhiều Vitamin C tăng đề kháng.', 45000.00, 50, '/image/fresh/cam-canh.jpg', 'FRESH', FALSE, 'KG', 'CAN_THO', NOW(), NOW()),
('Trứng gà ta thảo mộc (Hộp 10 quả)', 'Trứng gà nuôi thả tự nhiên bằng thảo mộc, lòng đỏ sẫm giàu dưỡng chất, vỏ dày tươi sạch.', 38000.00, 100, '/image/fresh/trunggia.jpg', 'FRESH', TRUE, 'BOX', 'HA_NOI', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    price = VALUES(price),
    quantity = VALUES(quantity),
    image_url = VALUES(image_url),
    category = VALUES(category),
    featured = VALUES(featured),
    unit = VALUES(unit),
    region = VALUES(region),
    updated_at = NOW();


