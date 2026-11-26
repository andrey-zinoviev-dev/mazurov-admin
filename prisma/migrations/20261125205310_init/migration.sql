-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER UNSIGNED NULL,
    `slug` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `categories_parent_id_idx`(`parent_id`),
    UNIQUE INDEX `categories_parent_slug_key`(`parent_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `category_id` INTEGER UNSIGNED NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `image` VARCHAR(1024) NULL,
    `item_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `products_category_id_idx`(`category_id`),
    INDEX `products_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_number` INTEGER NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `user_name` VARCHAR(255) NULL,
    `client_name` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `dates` VARCHAR(100) NULL,
    `days` INTEGER NULL DEFAULT 1,
    `total` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NULL,
    `status` VARCHAR(50) NULL DEFAULT 'PENDING',
    `status_code` VARCHAR(50) NULL DEFAULT 'PENDING',
    `hidden` BOOLEAN NULL DEFAULT false,
    `delivery_method` VARCHAR(20) NULL DEFAULT 'pickup',
    `delivery_address` TEXT NULL,
    `promo_code` VARCHAR(50) NULL,
    `promo_discount_percent` INTEGER NULL,
    `promo_discount_amount` DECIMAL(10, 2) NULL,
    `promo_rejected` BOOLEAN NULL DEFAULT false,
    `promo_reject_reason` TEXT NULL,
    `raw_data` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `orders_order_number_idx`(`order_number`),
    INDEX `orders_user_id_idx`(`user_id`),
    INDEX `orders_status_code_idx`(`status_code`),
    INDEX `orders_hidden_idx`(`hidden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `product_id` INTEGER NOT NULL,
    `product_name` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price_per_day` DECIMAL(10, 2) NOT NULL,
    `days_count` INTEGER NULL DEFAULT 1,
    `total_price` DECIMAL(10, 2) NOT NULL,

    INDEX `order_items_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_counter` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `last_number` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `comment` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `order_status_history_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promo_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `discount_percent_old` INTEGER NULL,
    `discount_type` ENUM('percent', 'fixed') NULL DEFAULT 'percent',
    `discount_value` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `usage_type` ENUM('one_time', 'multi') NULL DEFAULT 'one_time',
    `order_limit` ENUM('first_only', 'any') NULL DEFAULT 'first_only',
    `expiry_date` DATE NULL,
    `max_uses` INTEGER NULL DEFAULT 0,
    `max_uses_per_user` INTEGER NULL DEFAULT 0,
    `times_used` INTEGER NULL DEFAULT 0,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `promo_codes_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promo_usage_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `promo_code` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `order_id` BIGINT NULL,
    `used_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `promo_usage_history_promo_code_idx`(`promo_code`),
    INDEX `promo_usage_history_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `used_promocodes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(50) NOT NULL,
    `promo_code` VARCHAR(50) NOT NULL,
    `used_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `used_promocodes_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventarizations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `inspector` VARCHAR(255) NOT NULL,
    `status` ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `comment` TEXT NULL,

    INDEX `inventarizations_status_idx`(`status`),
    INDEX `inventarizations_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventarization_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `inventarization_id` BIGINT NOT NULL,
    `product_id` INTEGER NOT NULL,
    `actual_qty` INTEGER NULL,
    `comment` TEXT NULL,

    INDEX `inventarization_items_product_id_idx`(`product_id`),
    UNIQUE INDEX `inventarization_items_inventarization_id_product_id_key`(`inventarization_id`, `product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventarization_items` ADD CONSTRAINT `inventarization_items_inventarization_id_fkey` FOREIGN KEY (`inventarization_id`) REFERENCES `inventarizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventarization_items` ADD CONSTRAINT `inventarization_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
