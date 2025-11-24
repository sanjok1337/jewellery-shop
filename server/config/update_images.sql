-- Оновлення зображень продуктів для ювелірного магазину

-- Очищаємо старі зображення
DELETE FROM product_images;

-- Сережки з діамантами (Gold Diamond Earrings)
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(1, '/images/products/gold-earrings-with-diamonds-isolated-transparent-background_191095-13254.avif', TRUE),
(1, '/images/products/gold-earrings-with-diamonds-isolated-transparent-background_191095-13254.avif', FALSE);

-- Срібний браслет (Silver Bracelet)
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(2, '/images/products/silver-colored-bracelet-png-clipart.jpg', TRUE),
(2, '/images/products/silver-colored-bracelet-png-clipart.jpg', FALSE);

-- Обручка з діамантами (Diamond Wedding Ring)
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(3, '/images/products/png-transparent-wedding-ring-carat-diamond-gold-jewelry-love-gemstone-ring-thumbnail.png', TRUE),
(3, '/images/products/png-transparent-wedding-ring-carat-diamond-gold-jewelry-love-gemstone-ring-thumbnail.png', FALSE);

-- Смарагдове намисто (Emerald Necklace)
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(4, '/images/products/pngtree-green-emerald-necklace-png-image_16563776.png', TRUE),
(4, '/images/products/pngtree-green-emerald-necklace-png-image_16563776.png', FALSE);

-- Сапфірова каблучка (Sapphire Ring)
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(5, '/images/products/saphire ring.jpg', TRUE),
(5, '/images/products/saphire ring.jpg', FALSE);

-- Платиновий годинник (Platinum Watch)
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(6, '/images/products/png-clipart-watch-strap-metal-titan-company-platinum-watch-watch-accessory-fashion.png', TRUE),
(6, '/images/products/png-clipart-watch-strap-metal-titan-company-platinum-watch-watch-accessory-fashion.png', FALSE);

-- Для решти продуктів використовуємо ці ж зображення по черзі
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(7, '/images/products/gold-earrings-with-diamonds-isolated-transparent-background_191095-13254.avif', TRUE),
(7, '/images/products/gold-earrings-with-diamonds-isolated-transparent-background_191095-13254.avif', FALSE);

INSERT INTO product_images (product_id, image_url, is_main) VALUES
(8, '/images/products/png-transparent-wedding-ring-carat-diamond-gold-jewelry-love-gemstone-ring-thumbnail.png', TRUE),
(8, '/images/products/png-transparent-wedding-ring-carat-diamond-gold-jewelry-love-gemstone-ring-thumbnail.png', FALSE);
