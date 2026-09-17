<?php
// Disable error displaying to prevent HTML warnings breaking JSON output
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Secure headers & CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Session management
session_start();

// Database folder and file paths
$dbFolder = __DIR__ . '/database';
$dbFile = $dbFolder . '/oms_store.sqlite';
$uploadsFolder = __DIR__ . '/uploads';
$uploadsProductsFolder = $uploadsFolder . '/products';
$uploadsGeneratedFolder = $uploadsProductsFolder . '/generated';
$uploadsTempFolder = $uploadsFolder . '/temp';
$uploadsBackgroundsFolder = $uploadsFolder . '/backgrounds';

// Ensure directories exist with proper permissions
if (!file_exists($dbFolder)) {
    mkdir($dbFolder, 0755, true);
    // Write .htaccess to block direct download of the SQLite database
    file_put_contents($dbFolder . '/.htaccess', "Deny from all\n");
}

$dirs = [$uploadsFolder, $uploadsProductsFolder, $uploadsGeneratedFolder, $uploadsTempFolder, $uploadsBackgroundsFolder];
foreach ($dirs as $dir) {
    if (!file_exists($dir)) {
        if (!mkdir($dir, 0755, true)) {
            error_log("Failed to create directory: " . $dir);
        }
    }
    if (file_exists($dir) && !is_writable($dir)) {
        chmod($dir, 0755);
    }
}

// Establish SQLite Database Connection
try {
    $db = new PDO("sqlite:" . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Initialise Database Tables if they do not exist
try {
    // Check if migration is needed
    $migrationNeeded = false;
    try {
        $db->query("SELECT 1 FROM sub_categories LIMIT 1");
    } catch (PDOException $e) {
        $migrationNeeded = true;
    }

    if ($migrationNeeded) {
        // Safe rename of existing tables
        try {
            $db->exec("ALTER TABLE categories RENAME TO categories_old");
        } catch (PDOException $e) {}
        try {
            $db->exec("ALTER TABLE products RENAME TO products_old");
        } catch (PDOException $e) {}

        // Create new normalized tables
        $db->exec("CREATE TABLE categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            navbar_tab TEXT DEFAULT 'all',
            icon TEXT DEFAULT 'Sparkles',
            sort_order INTEGER DEFAULT 0
        )");

        $db->exec("CREATE TABLE sub_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            icon TEXT DEFAULT 'Sparkles',
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
        )");

        $db->exec("CREATE TABLE item_names (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subcategory_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            icon TEXT DEFAULT 'Sparkles',
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY(subcategory_id) REFERENCES sub_categories(id) ON DELETE CASCADE
        )");

        $db->exec("CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            subcategory_id INTEGER,
            item_name_id INTEGER,
            title_en TEXT DEFAULT '',
            title_ta TEXT,
            title_hi TEXT,
            title_te TEXT,
            description_en TEXT,
            description_ta TEXT,
            description_hi TEXT,
            description_te TEXT,
            weight REAL DEFAULT 0.0,
            making_charges REAL DEFAULT 0.0,
            waste_charges REAL DEFAULT 0.0,
            image_url TEXT,
            is_featured INTEGER DEFAULT 0,
            is_new_arrival INTEGER DEFAULT 0,
            metal_type TEXT DEFAULT 'gold',
            purity TEXT DEFAULT '22K',
            sku TEXT,
            gender TEXT DEFAULT 'Unisex',
            occasion TEXT DEFAULT 'Casual Wear',
            price_formula TEXT DEFAULT NULL,
            FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL,
            FOREIGN KEY(subcategory_id) REFERENCES sub_categories(id) ON DELETE SET NULL,
            FOREIGN KEY(item_name_id) REFERENCES item_names(id) ON DELETE SET NULL
        )");

        // Check if we have old categories to migrate
        $hasOldCats = false;
        try {
            $db->query("SELECT 1 FROM categories_old LIMIT 1");
            $hasOldCats = true;
        } catch (PDOException $e) {}

        if ($hasOldCats) {
            $oldCats = $db->query("SELECT * FROM categories_old")->fetchAll();
            $catMap = [];
            $subcatMap = [];

            // Migrate top level categories
            foreach ($oldCats as $oc) {
                if (empty($oc['parent_id'])) {
                    $stmt = $db->prepare("INSERT INTO categories (id, name, slug, navbar_tab, icon, sort_order) VALUES (:id, :name, :slug, :navbar_tab, :icon, :sort_order)");
                    $stmt->execute([
                        ':id' => $oc['id'],
                        ':name' => !empty($oc['name_en']) ? $oc['name_en'] : 'Category',
                        ':slug' => $oc['slug'],
                        ':navbar_tab' => $oc['navbar_tab'],
                        ':icon' => $oc['icon'],
                        ':sort_order' => $oc['sort_order']
                    ]);
                    $catMap[$oc['id']] = $oc['id'];
                }
            }

            // Migrate second level categories (subcategories)
            foreach ($oldCats as $oc) {
                if (!empty($oc['parent_id'])) {
                    $parentId = $oc['parent_id'];
                    if (isset($catMap[$parentId])) {
                        $stmt = $db->prepare("INSERT INTO sub_categories (id, category_id, name, slug, icon, sort_order) VALUES (:id, :category_id, :name, :slug, :icon, :sort_order)");
                        $stmt->execute([
                            ':id' => $oc['id'],
                            ':category_id' => $parentId,
                            ':name' => !empty($oc['name_en']) ? $oc['name_en'] : 'Sub Category',
                            ':slug' => $oc['slug'],
                            ':icon' => $oc['icon'],
                            ':sort_order' => $oc['sort_order']
                        ]);
                        $subcatMap[$oc['id']] = $oc['id'];
                    }
                }
            }

            // Create default Item Names for subcategories
            $defaultItemNames = [];
            foreach ($subcatMap as $oldSubcatId => $newSubcatId) {
                $stmt = $db->prepare("INSERT INTO item_names (subcategory_id, name, slug, sort_order) VALUES (:sub_id, :name, :slug, 0)");
                $stmt->execute([
                    ':sub_id' => $newSubcatId,
                    ':name' => 'General',
                    ':slug' => 'general'
                ]);
                $defaultItemNames[$newSubcatId] = $db->lastInsertId();
            }

            // Migrate products
            $hasOldProds = false;
            try {
                $db->query("SELECT 1 FROM products_old LIMIT 1");
                $hasOldProds = true;
            } catch (PDOException $e) {}

            if ($hasOldProds) {
                $oldProds = $db->query("SELECT * FROM products_old")->fetchAll();
                foreach ($oldProds as $op) {
                    $oldCatId = $op['category_id'];
                    $newCatId = null;
                    $newSubcatId = null;
                    $newItemNameId = null;

                    if (isset($catMap[$oldCatId])) {
                        $newCatId = $catMap[$oldCatId];
                    } else if (isset($subcatMap[$oldCatId])) {
                        $newSubcatId = $subcatMap[$oldCatId];
                        $subRecord = $db->query("SELECT category_id FROM sub_categories WHERE id = $newSubcatId")->fetch();
                        if ($subRecord) {
                            $newCatId = $subRecord['category_id'];
                        }
                        $newItemNameId = isset($defaultItemNames[$newSubcatId]) ? $defaultItemNames[$newSubcatId] : null;
                    }

                    $stmt = $db->prepare("INSERT INTO products (
                        id, category_id, subcategory_id, item_name_id, title_en, title_ta, title_hi, title_te,
                        description_en, description_ta, description_hi, description_te, weight, making_charges,
                        waste_charges, image_url, is_featured, is_new_arrival, metal_type, purity, sku, gender, occasion, price_formula
                    ) VALUES (
                        :id, :category_id, :subcategory_id, :item_name_id, :title_en, :title_ta, :title_hi, :title_te,
                        :description_en, :description_ta, :description_hi, :description_te, :weight, :making_charges,
                        :waste_charges, :image_url, :is_featured, :is_new_arrival, :metal_type, :purity, :sku, :gender, :occasion, :price_formula
                    )");

                    $stmt->execute([
                        ':id' => $op['id'],
                        ':category_id' => $newCatId,
                        ':subcategory_id' => $newSubcatId,
                        ':item_name_id' => $newItemNameId,
                        ':title_en' => $op['title_en'],
                        ':title_ta' => $op['title_ta'],
                        ':title_hi' => $op['title_hi'],
                        ':title_te' => $op['title_te'],
                        ':description_en' => $op['description_en'],
                        ':description_ta' => $op['description_ta'],
                        ':description_hi' => $op['description_hi'],
                        ':description_te' => $op['description_te'],
                        ':weight' => $op['weight'],
                        ':making_charges' => $op['making_charges'],
                        ':waste_charges' => $op['waste_charges'],
                        ':image_url' => $op['image_url'],
                        ':is_featured' => $op['is_featured'],
                        ':is_new_arrival' => $op['is_new_arrival'],
                        ':metal_type' => $op['metal_type'],
                        ':purity' => $op['purity'],
                        ':sku' => $op['sku'],
                        ':gender' => $op['gender'],
                        ':occasion' => $op['occasion'],
                        ':price_formula' => $op['price_formula']
                    ]);
                }
            }

            try {
                $db->exec("DROP TABLE categories_old");
            } catch (PDOException $e) {}
            try {
                $db->exec("DROP TABLE products_old");
            } catch (PDOException $e) {}
        }
    } else {
        // Enforce new products table exists in non-migration path
        $db->exec("CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            navbar_tab TEXT DEFAULT 'all',
            icon TEXT DEFAULT 'Sparkles',
            sort_order INTEGER DEFAULT 0
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS sub_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            icon TEXT DEFAULT 'Sparkles',
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS item_names (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subcategory_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            icon TEXT DEFAULT 'Sparkles',
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY(subcategory_id) REFERENCES sub_categories(id) ON DELETE CASCADE
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            subcategory_id INTEGER,
            item_name_id INTEGER,
            title_en TEXT DEFAULT '',
            title_ta TEXT,
            title_hi TEXT,
            title_te TEXT,
            description_en TEXT,
            description_ta TEXT,
            description_hi TEXT,
            description_te TEXT,
            weight REAL DEFAULT 0.0,
            making_charges REAL DEFAULT 0.0,
            waste_charges REAL DEFAULT 0.0,
            image_url TEXT,
            is_featured INTEGER DEFAULT 0,
            is_new_arrival INTEGER DEFAULT 0,
            metal_type TEXT DEFAULT 'gold',
            purity TEXT DEFAULT '22K',
            sku TEXT,
            gender TEXT DEFAULT 'Unisex',
            occasion TEXT DEFAULT 'Casual Wear',
            price_formula TEXT DEFAULT NULL,
            FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL,
            FOREIGN KEY(subcategory_id) REFERENCES sub_categories(id) ON DELETE SET NULL,
            FOREIGN KEY(item_name_id) REFERENCES item_names(id) ON DELETE SET NULL
        )");
    }

    // Pre-seed default 3-level hierarchy if categories table is empty
    $count = (int)$db->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    if ($count === 0) {
        $defaultHierarchy = [
            'Gold' => [
                'navbar_tab' => 'gold',
                'subcategories' => [
                    'Earrings' => ['Studs', 'Hangings', 'Drops', 'Jhumkas', 'Hoops & Bali'],
                    'Rings' => ['Engagement Rings', 'Casual Rings', 'Adjustable Rings'],
                    'Necklace' => ['Short Necklace', 'Long Necklace', 'Choker'],
                    'Bangles & Bracelets' => ['Bangles', 'Chain Bracelets', 'Cuff Bracelets', 'Adjustable Bracelets'],
                    'Pendants' => ['General'],
                    'Chains' => ['General'],
                    'Mangalsutra' => ['General'],
                    'Nosepin' => ['General'],
                    'Anklets' => ['General'],
                    'Toe Rings' => ['General'],
                    'Watch Charm' => ['General'],
                    'Gold Articles' => ['General']
                ]
            ],
            'Diamond' => [
                'navbar_tab' => 'diamond',
                'subcategories' => [
                    'Earrings' => ['Studs', 'Hangings', 'Drops'],
                    'Rings' => ['Engagement Rings', 'Casual Rings'],
                    'Necklace' => ['Short Necklace', 'Choker'],
                    'Pendants' => ['General']
                ]
            ],
            'Silver' => [
                'navbar_tab' => 'silver',
                'subcategories' => [
                    'Earrings' => ['Studs', 'Hangings', 'Hoops & Bali'],
                    'Rings' => ['Casual Rings', 'Adjustable Rings'],
                    'Necklace' => ['Short Necklace', 'Long Necklace'],
                    'Anklets' => ['General']
                ]
            ],
            'Platinum' => [
                'navbar_tab' => 'platinum',
                'subcategories' => [
                    'Rings' => ['Engagement Rings', 'Casual Rings'],
                    'Chains' => ['General']
                ]
            ],
            'Coins & Bars' => [
                'navbar_tab' => 'coins',
                'subcategories' => [
                    'Gold Coins' => ['General'],
                    'Silver Coins' => ['General']
                ]
            ],
            'Gift Store' => [
                'navbar_tab' => 'gift',
                'subcategories' => [
                    'Corporate Gifts' => ['General'],
                    'Wedding Gifts' => ['General']
                ]
            ]
        ];

        foreach ($defaultHierarchy as $catName => $catData) {
            $catSlug = strtolower(str_replace(' & ', '-', str_replace(' ', '-', $catName)));
            $stmt = $db->prepare("INSERT INTO categories (name, slug, navbar_tab, icon, sort_order) VALUES (:name, :slug, :navbar_tab, 'Sparkles', 0)");
            $stmt->execute([
                ':name' => $catName,
                ':slug' => $catSlug,
                ':navbar_tab' => $catData['navbar_tab']
            ]);
            $catId = $db->lastInsertId();

            foreach ($catData['subcategories'] as $subcatName => $itemNames) {
                $subcatSlug = strtolower(str_replace(' & ', '-', str_replace(' ', '-', $subcatName)));
                $stmtSub = $db->prepare("INSERT INTO sub_categories (category_id, name, slug, icon, sort_order) VALUES (:cat_id, :name, :slug, 'Sparkles', 0)");
                $stmtSub->execute([
                    ':cat_id' => $catId,
                    ':name' => $subcatName,
                    ':slug' => $subcatSlug
                ]);
                $subcatId = $db->lastInsertId();

                foreach ($itemNames as $itemName) {
                    $itemSlug = strtolower(str_replace(' & ', '-', str_replace(' ', '-', $itemName)));
                    $stmtItem = $db->prepare("INSERT INTO item_names (subcategory_id, name, slug, icon, sort_order) VALUES (:subcat_id, :name, :slug, 'Sparkles', 0)");
                    $stmtItem->execute([
                        ':subcat_id' => $subcatId,
                        ':name' => $itemName,
                        ':slug' => $itemSlug
                    ]);
                }
            }
        }
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database initialization or migration failed: " . $e->getMessage()]);
    exit();
}
try {
    $db->exec("CREATE TABLE IF NOT EXISTS carousel_banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title_en TEXT,
        title_ta TEXT,
        title_hi TEXT,
        title_te TEXT,
        subtitle_en TEXT,
        subtitle_ta TEXT,
        subtitle_hi TEXT,
        subtitle_te TEXT,
        media_type TEXT DEFAULT 'image',
        image_url TEXT,
        video_url TEXT,
        link_url TEXT,
        sort_order INTEGER DEFAULT 0,
        media_fit TEXT,
        content_position TEXT,
        content_width INTEGER,
        image_zoom INTEGER,
        image_offset_x INTEGER,
        image_offset_y INTEGER,
        image_rotation INTEGER,
        overlay_style TEXT,
        overlay_opacity INTEGER,
        title_max_width INTEGER,
        button_alignment TEXT,
        text_color TEXT,
        text_shadow INTEGER,
        gradient_preset TEXT,
        badge_text TEXT,
        cta_text TEXT,
        description_en TEXT,
        description_ta TEXT,
        description_hi TEXT,
        description_te TEXT
    )");

    // Auto-migrate schema: dynamically add new columns if they do not exist
    $bannerColsToCheck = [
        'media_fit' => 'TEXT',
        'content_position' => 'TEXT',
        'content_width' => 'INTEGER',
        'image_zoom' => 'INTEGER',
        'image_offset_x' => 'INTEGER',
        'image_offset_y' => 'INTEGER',
        'image_rotation' => 'INTEGER',
        'overlay_style' => 'TEXT',
        'overlay_opacity' => 'INTEGER',
        'title_max_width' => 'INTEGER',
        'button_alignment' => 'TEXT',
        'text_color' => 'TEXT',
        'text_shadow' => 'INTEGER',
        'gradient_preset' => 'TEXT',
        'badge_text' => 'TEXT',
        'cta_text' => 'TEXT',
        'description_en' => 'TEXT',
        'description_ta' => 'TEXT',
        'description_hi' => 'TEXT',
        'description_te' => 'TEXT'
    ];
    foreach ($bannerColsToCheck as $colName => $colType) {
        try {
            $db->query("SELECT $colName FROM carousel_banners LIMIT 1");
        } catch (PDOException $e) {
            $db->exec("ALTER TABLE carousel_banners ADD COLUMN $colName $colType");
        }
    }

    // Seed default carousel banners if empty
    $bannersCount = $db->query("SELECT COUNT(*) FROM carousel_banners")->fetchColumn();
    if ($bannersCount == 0) {
        $defaultBanners = [
            [
                'title_en' => 'Chola Dynasty Heritage Harams',
                'title_ta' => 'சோழ வம்ச பாரம்பரிய ஹாரங்கள்',
                'title_hi' => 'चोल राजवंश विरासत हारम',
                'title_te' => 'చోళ రాజవంశం హారాలు',
                'subtitle_en' => 'Pure BIS 916 Temple Jewellery Masterpieces',
                'subtitle_ta' => 'சுத்தமான BIS 916 கோவில் நகை படைப்புகள்',
                'subtitle_hi' => 'शुद्ध बीआईएस 916 मंदिर आभूषण मास्टरपीस',
                'subtitle_te' => 'స్వచ్ఛమైన BIS 916 టెంపుల్ జ్యువెలరీ',
                'media_type' => 'video',
                'image_url' => '/assets/ai_actor.jpeg',
                'video_url' => '/assets/ai_actor_video2.mp4',
                'link_url' => '#/category/gold',
                'sort_order' => 1
            ],
            [
                'title_en' => 'Royal Bridal Collections',
                'title_ta' => 'இளவரசி திருமண சேகரிப்புகள்',
                'title_hi' => 'शाही दुल्हन संग्रह',
                'title_te' => 'రాయల్ బ్రైడల్ కలెక్షన్స్',
                'subtitle_en' => 'Sparkling VVS EF Certified Solitaire Diamonds',
                'subtitle_ta' => 'ஒளிரும் VVS EF சான்றளிக்கப்பட்ட வைரங்கள்',
                'subtitle_hi' => 'चमकदार वीवीएस ईएफ प्रमाणित सॉलिटेयर हीरे',
                'subtitle_te' => 'మెరిసే VVS EF సర్టిఫైడ్ సాలిటైర్ డైమండ్స్',
                'media_type' => 'video',
                'image_url' => '/assets/ai_actor1.jpeg',
                'video_url' => '/assets/ai_actor_video.mp4',
                'link_url' => '#/category/diamond',
                'sort_order' => 2
            ],
            [
                'title_en' => 'Timeless Platinum Couple Bands',
                'title_ta' => 'காலமற்ற பிளாட்டினம் ஜோடி வளையங்கள்',
                'title_hi' => 'कालातीत प्लैटिनम युगल बैंड',
                'title_te' => 'టైమ్‌లెస్ ప్లాటినం కపుల్ బ్యాండ్స్',
                'subtitle_en' => 'Celebrate Eternal Love with Pt950 Certified Platinum',
                'subtitle_ta' => 'Pt950 சான்றளிக்கப்பட்ட பிளாட்டினத்துடன் நித்திய அன்பை கொண்டாடுங்கள்',
                'subtitle_hi' => 'Pt950 प्रमाणित प्लैटिनम के साथ शाश्वत प्रेम का जश्न मनाएं',
                'subtitle_te' => 'Pt950 సర్టిఫైడ్ ప్లాటినంతో ప్రేమను జరుపుకోండి',
                'media_type' => 'image',
                'image_url' => '/assets/ai_actor2.jpeg',
                'video_url' => '',
                'link_url' => '#/category/platinum',
                'sort_order' => 3
            ]
        ];

        $bannerStmt = $db->prepare("INSERT INTO carousel_banners (
            title_en, title_ta, title_hi, title_te,
            subtitle_en, subtitle_ta, subtitle_hi, subtitle_te,
            media_type, image_url, video_url, link_url, sort_order
        ) VALUES (
            :title_en, :title_ta, :title_hi, :title_te,
            :subtitle_en, :subtitle_ta, :subtitle_hi, :subtitle_te,
            :media_type, :image_url, :video_url, :link_url, :sort_order
        )");

        foreach ($defaultBanners as $b) {
            $bannerStmt->execute([
                ':title_en' => $b['title_en'],
                ':title_ta' => $b['title_ta'],
                ':title_hi' => $b['title_hi'],
                ':title_te' => $b['title_te'],
                ':subtitle_en' => $b['subtitle_en'],
                ':subtitle_ta' => $b['subtitle_ta'],
                ':subtitle_hi' => $b['subtitle_hi'],
                ':subtitle_te' => $b['subtitle_te'],
                ':media_type' => $b['media_type'],
                ':image_url' => $b['image_url'],
                ':video_url' => $b['video_url'],
                ':link_url' => $b['link_url'],
                ':sort_order' => $b['sort_order']
            ]);
        }
    }


    $db->exec("CREATE TABLE IF NOT EXISTS rates (
        metal TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rate REAL NOT NULL,
        change_val TEXT,
        is_up INTEGER DEFAULT 1
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS settings (
        key_name TEXT PRIMARY KEY,
        value_val TEXT
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS product_generated_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        original_image TEXT,
        transparent_image TEXT,
        website_image TEXT,
        website_image_png TEXT,
        thumbnail_image TEXT,
        banner_image TEXT,
        social_image TEXT,
        background_style TEXT,
        logo_position TEXT,
        watermark_enabled INTEGER,
        watermark_text TEXT,
        watermark_phone TEXT,
        processing_settings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    $db->exec("CREATE TABLE IF NOT EXISTS background_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        resolution TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_default INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS watermark_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_name TEXT NOT NULL,
        logo_position TEXT,
        logo_size INTEGER,
        logo_opacity INTEGER,
        logo_margin_top INTEGER,
        logo_margin_bottom INTEGER,
        logo_margin_left INTEGER,
        logo_margin_right INTEGER,
        logo_margin INTEGER,
        logo_shadow TEXT,
        logo_background TEXT,
        website_enabled INTEGER,
        phone_enabled INTEGER,
        layout TEXT,
        website_text TEXT,
        phone_text TEXT,
        website_font TEXT,
        phone_font TEXT,
        website_size TEXT,
        phone_size TEXT,
        website_weight TEXT,
        phone_weight TEXT,
        website_color TEXT,
        phone_color TEXT,
        line_spacing REAL,
        letter_spacing REAL,
        opacity INTEGER,
        rotation INTEGER,
        density TEXT,
        spacing_x INTEGER,
        spacing_y INTEGER,
        safe_margin INTEGER,
        avoid_product INTEGER,
        blend_mode TEXT,
        watermark_scale REAL,
        text_shadow TEXT,
        text_outline TEXT,
        website_color_hex TEXT,
        phone_color_hex TEXT,
        website_size_px INTEGER,
        phone_size_px INTEGER,
        logo_border TEXT,
        logo_corner_radius INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Auto-migrate schema: dynamically add new columns if they do not exist
    $colsToCheck = [
        'website_color_hex' => 'TEXT',
        'phone_color_hex' => 'TEXT',
        'website_size_px' => 'INTEGER',
        'phone_size_px' => 'INTEGER',
        'logo_border' => 'TEXT',
        'logo_corner_radius' => 'INTEGER'
    ];
    foreach ($colsToCheck as $colName => $colType) {
        try {
            $db->query("SELECT $colName FROM watermark_profiles LIMIT 1");
        } catch (PDOException $e) {
            $db->exec("ALTER TABLE watermark_profiles ADD COLUMN $colName $colType");
        }
    }

    // Seed default backgrounds if empty
    $bgCount = (int)$db->query("SELECT COUNT(*) FROM background_templates")->fetchColumn();
    if ($bgCount === 0) {
        $defaults = [
            ['name' => 'Luxury Black Studio', 'url' => 'default:Luxury Black Studio', 'cat' => 'Studio', 'is_default' => 1, 'order' => 1],
            ['name' => 'Grey Studio', 'url' => 'default:Grey Studio', 'cat' => 'Studio', 'is_default' => 0, 'order' => 2],
            ['name' => 'White Marble', 'url' => 'default:White Marble', 'cat' => 'Minimal', 'is_default' => 0, 'order' => 3],
            ['name' => 'Black Marble', 'url' => 'default:Black Marble', 'cat' => 'Luxury', 'is_default' => 0, 'order' => 4],
            ['name' => 'Temple Red', 'url' => 'default:Temple Red', 'cat' => 'Temple', 'is_default' => 0, 'order' => 5],
            ['name' => 'Royal Gold', 'url' => 'default:Royal Gold', 'cat' => 'Premium', 'is_default' => 0, 'order' => 6],
            ['name' => 'Velvet Burgundy', 'url' => 'default:Velvet Burgundy', 'cat' => 'Festive', 'is_default' => 0, 'order' => 7]
        ];
        $stmt = $db->prepare("INSERT INTO background_templates (name, image_url, category, is_default, sort_order, resolution) VALUES (:name, :url, :cat, :is_default, :order, 'Procedural')");
        foreach ($defaults as $d) {
            $stmt->execute([
                ':name' => $d['name'],
                ':url' => $d['url'],
                ':cat' => $d['cat'],
                ':is_default' => $d['is_default'],
                ':order' => $d['order']
            ]);
        }
    }

    try {
        $db->exec("ALTER TABLE product_generated_images ADD COLUMN website_image_png TEXT");
    } catch (PDOException $e) {
        // Ignored if column already exists
    }
    try {
        $db->exec("ALTER TABLE product_generated_images ADD COLUMN background_id INTEGER");
    } catch (PDOException $e) {
        // Ignored if column already exists
    }

    // Gender Master table
    $db->exec("CREATE TABLE IF NOT EXISTS gender_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Occasion Master table
    $db->exec("CREATE TABLE IF NOT EXISTS occasion_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Seed default Gender values if empty
    $genderCount = (int)$db->query("SELECT COUNT(*) FROM gender_master")->fetchColumn();
    if ($genderCount === 0) {
        $defaultGenders = ['Female', 'Male', 'Unisex', 'Kids & Teens', 'Boys', 'Girls', 'Couple'];
        $gStmt = $db->prepare("INSERT INTO gender_master (name, display_order) VALUES (:name, :order)");
        foreach ($defaultGenders as $i => $g) {
            $gStmt->execute([':name' => $g, ':order' => $i + 1]);
        }
    }

    // Seed default Occasion values if empty
    $occasionCount = (int)$db->query("SELECT COUNT(*) FROM occasion_master")->fetchColumn();
    if ($occasionCount === 0) {
        $defaultOccasions = ['Casual Wear', 'Traditional Wear', 'Party Wear', 'Wedding', 'Engagement', 'Office Wear', 'Daily Wear', 'Festival', 'Temple Wear', 'Anniversary', 'Gift', 'Bridal', 'Kids'];
        $oStmt = $db->prepare("INSERT INTO occasion_master (name, display_order) VALUES (:name, :order)");
        foreach ($defaultOccasions as $i => $o) {
            $oStmt->execute([':name' => $o, ':order' => $i + 1]);
        }
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Table initialisation failed: " . $e->getMessage()]);
    exit();
}

// Seed Initial Data if Database is completely empty
$settingsCount = $db->query("SELECT COUNT(*) FROM settings")->fetchColumn();
if ($settingsCount == 0) {
    try {
        $db->beginTransaction();

        // 1. Seed Settings
        $settingsToSeed = [
            'admin_password' => password_hash('admin123', PASSWORD_DEFAULT),
            'session_token' => '',
            'notice_text_en' => '★ OM SAKTHI JEWELLERY ROYAL CLUB OFFER ★ Welcome! Register a secure DigiGold or Super Gold savings scheme today to secure making charges at FLAT 0% up to 18% on all wedding ornaments. Tap help to consult.',
            'notice_text_ta' => '★ ஓம் சக்தி ஜூவல்லரி ராயல் கிளப் சலுகை ★ வணக்கம்! திருமண நகைகளின் செய்கூலி மற்றும் சேதாரத்தை 0% முதல் 18% வரை சேமிக்க, இன்றே எங்களின் பாதுகாப்பான டிஜிகோல்டு அல்லது சூப்பர் கோல்டு திட்டத்தில் பதிவு செய்யுங்கள்.',
            'notice_text_hi' => '★ ओम शक्ति ज्वेलरी रॉयल क्लब ऑफर ★ नमस्ते! सभी विवाह आभूषणों पर मेकिंग चार्ज को 0% से 18% तक सुरक्षित रखने के लिए आज ही डिजीगोल्ड या सुपर गोल्ड बचत योजना में पंजीकरण करें।',
            'notice_text_te' => '★ ఓం శక్తి జ్యువెలరీ రాయల్ క్లబ్ ఆఫర్ ★ నమస్కారం! పెళ్లి ఆభరణాలపై తరుగు, మజూరీ ఛార్జీలను 0% నుండి 18% వరకు ఆదా చేయడానికి ఈరోజే మా సురక్షిత డిజిగోల్డ్ లేదా సూపర్ గోల్డ్ సేవింగ్స్ స్కీమ్‌లో నమోదు చేసుకోండి.'
        ];
        
        $setStmt = $db->prepare("INSERT OR REPLACE INTO settings (key_name, value_val) VALUES (:key, :val)");
        foreach ($settingsToSeed as $k => $v) {
            $setStmt->execute([':key' => $k, ':val' => $v]);
        }

        // 2. Seed Metal Rates
        $ratesToSeed = [
            ['metal' => 'g22k', 'name' => '1 Gm Gold 22Kt', 'rate' => 13200, 'change' => '-100', 'is_up' => 0],
            ['metal' => 'g18k', 'name' => '1 Gm Gold 18Kt', 'rate' => 11020, 'change' => '-100', 'is_up' => 0],
            ['metal' => 'silver', 'name' => '1 Gm Silver', 'rate' => 240, 'change' => '0.00', 'is_up' => 1],
            ['metal' => 'platinum', 'name' => 'Platinum (per gm)', 'rate' => 4900, 'change' => '0.00', 'is_up' => 1],
        ];
        $rateStmt = $db->prepare("INSERT OR REPLACE INTO rates (metal, name, rate, change_val, is_up) VALUES (:metal, :name, :rate, :change, :is_up)");
        foreach ($ratesToSeed as $r) {
            $rateStmt->execute([
                ':metal' => $r['metal'],
                ':name' => $r['name'],
                ':rate' => $r['rate'],
                ':change' => $r['change'],
                ':is_up' => $r['is_up']
            ]);
        }

        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Database seeding failed: " . $e->getMessage()]);
        exit();
    }
}

// Verification helper function
function verifyAuth($db) {
    $headers = getallheaders();
    
    // Case-insensitive lookup for Authorization and X-Authorization headers
    $authHeader = '';
    $xAuthHeader = '';
    if (is_array($headers)) {
        foreach ($headers as $key => $val) {
            $lowerKey = strtolower($key);
            if ($lowerKey === 'authorization') {
                $authHeader = $val;
            } elseif ($lowerKey === 'x-authorization') {
                $xAuthHeader = $val;
            }
        }
    }
    
    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (empty($authHeader) && !empty($xAuthHeader)) {
        $authHeader = $xAuthHeader;
    }
    if (empty($authHeader) && isset($_SERVER['HTTP_X_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_X_AUTHORIZATION'];
    }
    
    $token = '';
    if (!empty($authHeader)) {
        $token = trim(str_replace('Bearer', '', $authHeader));
    }
    
    // Validate token against database settings
    $stmt = $db->prepare("SELECT value_val FROM settings WHERE key_name = 'session_token'");
    $stmt->execute();
    $savedToken = $stmt->fetchColumn();
    
    return (!empty($savedToken) && $savedToken === $token);
}

// Router actions
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($action) {
    case 'load_all':
        // Load categories
        $categories = $db->query("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")->fetchAll();
        foreach ($categories as &$c) {
            $c['name_en'] = $c['name'];
            $c['name_ta'] = $c['name'];
            $c['name_hi'] = $c['name'];
            $c['name_te'] = $c['name'];
        }
        
        $subCategories = $db->query("SELECT * FROM sub_categories ORDER BY sort_order ASC, name ASC")->fetchAll();
        foreach ($subCategories as &$sc) {
            $sc['name_en'] = $sc['name'];
            $sc['name_ta'] = $sc['name'];
            $sc['name_hi'] = $sc['name'];
            $sc['name_te'] = $sc['name'];
        }
        
        $itemNames = $db->query("SELECT * FROM item_names ORDER BY sort_order ASC, name ASC")->fetchAll();
        foreach ($itemNames as &$it) {
            $it['name_en'] = $it['name'];
            $it['name_ta'] = $it['name'];
            $it['name_hi'] = $it['name'];
            $it['name_te'] = $it['name'];
        }
        
        // Load products with item_name resolved
        $products = $db->query("SELECT p.*, COALESCE(i.name, '') as item_name FROM products p LEFT JOIN item_names i ON p.item_name_id = i.id ORDER BY p.id DESC")->fetchAll();
        
        // Load rates
        $rates = $db->query("SELECT * FROM rates")->fetchAll();
        
        // Load banners
        $banners = $db->query("SELECT * FROM carousel_banners ORDER BY sort_order ASC")->fetchAll();
        
        // Load settings
        $settingsRows = $db->query("SELECT key_name, value_val FROM settings WHERE key_name != 'admin_password'")->fetchAll();
        $settings = [];
        foreach ($settingsRows as $row) {
            $settings[$row['key_name']] = $row['value_val'];
        }

        // Load generated images
        $generatedImages = $db->query("SELECT * FROM product_generated_images")->fetchAll();

        // Load background templates
        $bgTemplates = $db->query("SELECT * FROM background_templates ORDER BY sort_order ASC, name ASC")->fetchAll();
        foreach ($bgTemplates as &$t) {
            $t['id'] = (int)$t['id'];
            $t['is_default'] = (int)$t['is_default'] === 1;
            $t['is_active'] = (int)$t['is_active'] === 1;
            $t['sort_order'] = (int)$t['sort_order'];
        }
        
        // Load gender master
        $genderMaster = $db->query("SELECT * FROM gender_master ORDER BY display_order ASC, name ASC")->fetchAll();
        foreach ($genderMaster as &$gm) {
            $gm['id'] = (int)$gm['id'];
            $gm['display_order'] = (int)$gm['display_order'];
            $gm['is_active'] = (int)$gm['is_active'];
        }

        // Load occasion master
        $occasionMaster = $db->query("SELECT * FROM occasion_master ORDER BY display_order ASC, name ASC")->fetchAll();
        foreach ($occasionMaster as &$om) {
            $om['id'] = (int)$om['id'];
            $om['display_order'] = (int)$om['display_order'];
            $om['is_active'] = (int)$om['is_active'];
        }

        echo json_encode([
            "success" => true,
            "categories" => $categories,
            "sub_categories" => $subCategories,
            "item_names" => $itemNames,
            "products" => $products,
            "rates" => $rates,
            "banners" => $banners,
            "settings" => $settings,
            "generated_images" => $generatedImages,
            "background_templates" => $bgTemplates,
            "gender_master" => $genderMaster,
            "occasion_master" => $occasionMaster
        ]);
        break;

    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        $password = isset($data['password']) ? $data['password'] : '';
        
        // Fetch current password hash
        $stmt = $db->prepare("SELECT value_val FROM settings WHERE key_name = 'admin_password'");
        $stmt->execute();
        $hash = $stmt->fetchColumn();
        
        if (password_verify($password, $hash)) {
            // Generate a secure session token
            $token = bin2hex(random_bytes(32));
            
            // Save token
            $upStmt = $db->prepare("UPDATE settings SET value_val = :token WHERE key_name = 'session_token'");
            $upStmt->execute([':token' => $token]);
            
            echo json_encode(["success" => true, "token" => $token]);
        } else {
            echo json_encode(["success" => false, "message" => "Incorrect admin password"]);
        }
        break;

    case 'save_product':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        
        if ($id > 0) {
            // Update product
            $stmt = $db->prepare("UPDATE products SET 
                category_id = :category_id,
                subcategory_id = :subcategory_id,
                item_name_id = :item_name_id,
                title_en = :title_en, title_ta = :title_ta, title_hi = :title_hi, title_te = :title_te,
                description_en = :description_en, description_ta = :description_ta, description_hi = :description_hi, description_te = :description_te,
                weight = :weight, making_charges = :making_charges, waste_charges = :waste_charges,
                image_url = :image_url, is_featured = :is_featured, is_new_arrival = :is_new_arrival,
                metal_type = :metal_type, purity = :purity, sku = :sku, gender = :gender, occasion = :occasion,
                price_formula = :price_formula WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        } else {
            // Insert product
            $stmt = $db->prepare("INSERT INTO products (
                category_id, subcategory_id, item_name_id, title_en, title_ta, title_hi, title_te,
                description_en, description_ta, description_hi, description_te,
                weight, making_charges, waste_charges, image_url, is_featured, is_new_arrival,
                metal_type, purity, sku, gender, occasion, price_formula
            ) VALUES (
                :category_id, :subcategory_id, :item_name_id, :title_en, :title_ta, :title_hi, :title_te,
                :description_en, :description_ta, :description_hi, :description_te,
                :weight, :making_charges, :waste_charges, :image_url, :is_featured, :is_new_arrival,
                :metal_type, :purity, :sku, :gender, :occasion, :price_formula
            )");
        }
        
        $stmt->bindValue(':category_id', empty($data['category_id']) ? null : (int)$data['category_id'], PDO::PARAM_INT);
        $stmt->bindValue(':subcategory_id', empty($data['subcategory_id']) ? null : (int)$data['subcategory_id'], PDO::PARAM_INT);
        $stmt->bindValue(':item_name_id', empty($data['item_name_id']) ? null : (int)$data['item_name_id'], PDO::PARAM_INT);
        $stmt->bindValue(':title_en', isset($data['title_en']) ? $data['title_en'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':title_ta', isset($data['title_ta']) && $data['title_ta'] !== null ? $data['title_ta'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':title_hi', isset($data['title_hi']) && $data['title_hi'] !== null ? $data['title_hi'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':title_te', isset($data['title_te']) && $data['title_te'] !== null ? $data['title_te'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':description_en', isset($data['description_en']) && $data['description_en'] !== null ? $data['description_en'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':description_ta', isset($data['description_ta']) && $data['description_ta'] !== null ? $data['description_ta'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':description_hi', isset($data['description_hi']) && $data['description_hi'] !== null ? $data['description_hi'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':description_te', isset($data['description_te']) && $data['description_te'] !== null ? $data['description_te'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':weight', (float)$data['weight'], PDO::PARAM_STR);
        $stmt->bindValue(':making_charges', (float)$data['making_charges'], PDO::PARAM_STR);
        $stmt->bindValue(':waste_charges', (float)$data['waste_charges'], PDO::PARAM_STR);
        $stmt->bindValue(':image_url', $data['image_url'], PDO::PARAM_STR);
        $stmt->bindValue(':is_featured', (int)$data['is_featured'], PDO::PARAM_INT);
        $stmt->bindValue(':is_new_arrival', (int)$data['is_new_arrival'], PDO::PARAM_INT);
        $stmt->bindValue(':metal_type', $data['metal_type'], PDO::PARAM_STR);
        $stmt->bindValue(':purity', $data['purity'], PDO::PARAM_STR);
        $stmt->bindValue(':sku', $data['sku'], PDO::PARAM_STR);
        $stmt->bindValue(':gender', !empty($data['gender']) ? $data['gender'] : null, PDO::PARAM_STR);
        $stmt->bindValue(':occasion', !empty($data['occasion']) ? $data['occasion'] : null, PDO::PARAM_STR);
        $stmt->bindValue(':price_formula', isset($data['price_formula']) ? $data['price_formula'] : null, PDO::PARAM_STR);
        
        $stmt->execute();
        $productId = $id > 0 ? $id : $db->lastInsertId();
        
        // If we have a temporary generated image session/ID, associate it!
        if (isset($data['generated_image_id']) && (int)$data['generated_image_id'] > 0) {
            $upGen = $db->prepare("UPDATE product_generated_images SET product_id = :prod_id WHERE id = :gen_id");
            $upGen->execute([':prod_id' => $productId, ':gen_id' => (int)$data['generated_image_id']]);
        }
        
        echo json_encode(["success" => true, "productId" => $productId]);
        break;

    case 'delete_product':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        
        $stmt = $db->prepare("DELETE FROM products WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    case 'save_category':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        
        $name = trim($data['name']);
        $slug = empty($data['slug']) ? strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name)) : trim($data['slug']);
        
        // Prevent duplicate category names or slugs
        $dup = $db->prepare("SELECT COUNT(*) FROM categories WHERE (LOWER(name) = LOWER(:name) OR LOWER(slug) = LOWER(:slug)) AND id != :id");
        $dup->execute([':name' => $name, ':slug' => $slug, ':id' => $id]);
        if ($dup->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Duplicate entry: A category with this name or slug already exists."]);
            break;
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE categories SET 
                name = :name,
                slug = :slug,
                navbar_tab = :navbar_tab,
                icon = :icon,
                sort_order = :sort_order
                WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        } else {
            $stmt = $db->prepare("INSERT INTO categories (name, slug, navbar_tab, icon, sort_order) VALUES (:name, :slug, :navbar_tab, :icon, :sort_order)");
        }
        
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
        $stmt->bindValue(':navbar_tab', empty($data['navbar_tab']) ? 'all' : $data['navbar_tab'], PDO::PARAM_STR);
        $stmt->bindValue(':icon', empty($data['icon']) ? 'Sparkles' : $data['icon'], PDO::PARAM_STR);
        $stmt->bindValue(':sort_order', (int)$data['sort_order'], PDO::PARAM_INT);
        
        $stmt->execute();
        echo json_encode(["success" => true, "id" => $id > 0 ? $id : $db->lastInsertId()]);
        break;

    case 'delete_category':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        
        $stmt = $db->prepare("DELETE FROM categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    case 'save_sub_category':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $categoryId = (int)$data['category_id'];
        
        $name = trim($data['name']);
        $slug = empty($data['slug']) ? strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name)) : trim($data['slug']);
        
        // Prevent duplicate subcategories under this category
        $dup = $db->prepare("SELECT COUNT(*) FROM sub_categories WHERE category_id = :category_id AND (LOWER(name) = LOWER(:name) OR LOWER(slug) = LOWER(:slug)) AND id != :id");
        $dup->execute([':category_id' => $categoryId, ':name' => $name, ':slug' => $slug, ':id' => $id]);
        if ($dup->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Duplicate entry: A subcategory with this name or slug already exists under this category."]);
            break;
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE sub_categories SET 
                category_id = :category_id,
                name = :name,
                slug = :slug,
                icon = :icon,
                sort_order = :sort_order
                WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        } else {
            $stmt = $db->prepare("INSERT INTO sub_categories (category_id, name, slug, icon, sort_order) VALUES (:category_id, :name, :slug, :icon, :sort_order)");
        }
        
        $stmt->bindValue(':category_id', $categoryId, PDO::PARAM_INT);
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
        $stmt->bindValue(':icon', empty($data['icon']) ? 'Sparkles' : $data['icon'], PDO::PARAM_STR);
        $stmt->bindValue(':sort_order', (int)$data['sort_order'], PDO::PARAM_INT);
        
        $stmt->execute();
        echo json_encode(["success" => true, "id" => $id > 0 ? $id : $db->lastInsertId()]);
        break;

    case 'delete_sub_category':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        
        $stmt = $db->prepare("DELETE FROM sub_categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    case 'save_item_name':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $subcategoryId = (int)$data['subcategory_id'];
        
        $name = trim($data['name']);
        $slug = empty($data['slug']) ? strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name)) : trim($data['slug']);
        
        // Prevent duplicate item names under this subcategory
        $dup = $db->prepare("SELECT COUNT(*) FROM item_names WHERE subcategory_id = :subcategory_id AND (LOWER(name) = LOWER(:name) OR LOWER(slug) = LOWER(:slug)) AND id != :id");
        $dup->execute([':subcategory_id' => $subcategoryId, ':name' => $name, ':slug' => $slug, ':id' => $id]);
        if ($dup->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Duplicate entry: An item name with this name or slug already exists under this subcategory."]);
            break;
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE item_names SET 
                subcategory_id = :subcategory_id,
                name = :name,
                slug = :slug,
                icon = :icon,
                sort_order = :sort_order
                WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        } else {
            $stmt = $db->prepare("INSERT INTO item_names (subcategory_id, name, slug, icon, sort_order) VALUES (:subcategory_id, :name, :slug, :icon, :sort_order)");
        }
        
        $stmt->bindValue(':subcategory_id', $subcategoryId, PDO::PARAM_INT);
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
        $stmt->bindValue(':icon', empty($data['icon']) ? 'Sparkles' : $data['icon'], PDO::PARAM_STR);
        $stmt->bindValue(':sort_order', (int)$data['sort_order'], PDO::PARAM_INT);
        
        $stmt->execute();
        echo json_encode(["success" => true, "id" => $id > 0 ? $id : $db->lastInsertId()]);
        break;

    case 'delete_item_name':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        
        $stmt = $db->prepare("DELETE FROM item_names WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    case 'save_setting':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $key = isset($data['key']) ? $data['key'] : '';
        $value = isset($data['value']) ? $data['value'] : '';
        
        if ($key === 'admin_password') {
            // Hash the password
            $value = password_hash($value, PASSWORD_DEFAULT);
        }
        
        $stmt = $db->prepare("INSERT OR REPLACE INTO settings (key_name, value_val) VALUES (:key, :val)");
        $stmt->execute([':key' => $key, ':val' => $value]);
        echo json_encode(["success" => true]);
        break;

    case 'save_banner':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        
        $fields = [
            'title_en', 'title_ta', 'title_hi', 'title_te',
            'subtitle_en', 'subtitle_ta', 'subtitle_hi', 'subtitle_te',
            'media_type', 'image_url', 'video_url', 'link_url', 'sort_order',
            'media_fit', 'content_position', 'content_width', 'image_zoom',
            'image_offset_x', 'image_offset_y', 'image_rotation', 'overlay_style',
            'overlay_opacity', 'title_max_width', 'button_alignment', 'text_color',
            'text_shadow', 'gradient_preset', 'badge_text', 'cta_text',
            'description_en', 'description_ta', 'description_hi', 'description_te'
        ];

        if ($id > 0) {
            $setSql = [];
            foreach ($fields as $f) {
                $setSql[] = "$f = :$f";
            }
            $sql = "UPDATE carousel_banners SET " . implode(", ", $setSql) . " WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        } else {
            $cols = implode(", ", $fields);
            $placeholders = ":" . implode(", :", $fields);
            $sql = "INSERT INTO carousel_banners ($cols) VALUES ($placeholders)";
            $stmt = $db->prepare($sql);
        }
        
        foreach ($fields as $f) {
            $val = isset($data[$f]) ? $data[$f] : null;
            if ($val === null) {
                $stmt->bindValue(":$f", null, PDO::PARAM_NULL);
            } elseif (is_int($val)) {
                $stmt->bindValue(":$f", $val, PDO::PARAM_INT);
            } elseif (is_float($val) || is_numeric($val)) {
                $stmt->bindValue(":$f", $val, PDO::PARAM_STR);
            } else {
                $stmt->bindValue(":$f", $val, PDO::PARAM_STR);
            }
        }
        
        $stmt->execute();
        echo json_encode(["success" => true, "bannerId" => $id > 0 ? $id : $db->lastInsertId()]);
        break;

    case 'delete_banner':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        
        $stmt = $db->prepare("DELETE FROM carousel_banners WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    case 'save_rates':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $db->prepare("INSERT OR REPLACE INTO rates (metal, name, rate, change_val, is_up) VALUES (:metal, :name, :rate, :change, :is_up)");
        foreach ($data['rates'] as $r) {
            $stmt->execute([
                ':metal' => $r['metal'],
                ':name' => $r['name'],
                ':rate' => (float)$r['rate'],
                ':change' => $r['change'],
                ':is_up' => (int)$r['is_up']
            ]);
        }
        echo json_encode(["success" => true]);
        break;

    case 'save_generated_images':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !is_array($data)) {
            echo json_encode(["success" => false, "message" => "Empty or invalid JSON payload. Note: Large image sizes might exceed the server post_max_size limit."]);
            break;
        }
        $productId = isset($data['product_id']) ? (int)$data['product_id'] : 0;
        
        if (!function_exists('saveBase64Image')) {
            function saveBase64Image($base64Data, $uploadsFolder, $webSubPath = '/uploads') {
                if (empty($base64Data)) return null;
                if (strpos($base64Data, 'data:') !== 0) {
                    return $base64Data; // Already a URL
                }
                
                preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type);
                $ext = isset($type[1]) ? strtolower($type[1]) : 'png';
                if ($ext === 'jpeg') $ext = 'jpg';
                
                $data = substr($base64Data, strpos($base64Data, ',') + 1);
                $data = base64_decode($data);
                if ($data === false) return null;
                
                $filename = bin2hex(random_bytes(16)) . '.' . $ext;
                $filepath = $uploadsFolder . '/' . $filename;
                
                if (file_put_contents($filepath, $data)) {
                    return $webSubPath . '/' . $filename;
                }
                return null;
            }
        }
        
        $original = saveBase64Image(isset($data['original_image']) ? $data['original_image'] : null, $uploadsTempFolder, '/uploads/temp');
        $transparent = saveBase64Image(isset($data['transparent_image']) ? $data['transparent_image'] : null, $uploadsGeneratedFolder, '/uploads/products/generated');
        $website = saveBase64Image(isset($data['website_image']) ? $data['website_image'] : null, $uploadsGeneratedFolder, '/uploads/products/generated');
        $websitePng = saveBase64Image(isset($data['website_image_png']) ? $data['website_image_png'] : null, $uploadsGeneratedFolder, '/uploads/products/generated');
        $thumbnail = saveBase64Image(isset($data['thumbnail_image']) ? $data['thumbnail_image'] : null, $uploadsGeneratedFolder, '/uploads/products/generated');
        $banner = saveBase64Image(isset($data['banner_image']) ? $data['banner_image'] : null, $uploadsGeneratedFolder, '/uploads/products/generated');
        $social = saveBase64Image(isset($data['social_image']) ? $data['social_image'] : null, $uploadsGeneratedFolder, '/uploads/products/generated');
        
        $existing = false;
        if ($productId > 0) {
            $stmt = $db->prepare("SELECT id FROM product_generated_images WHERE product_id = :product_id");
            $stmt->execute([':product_id' => $productId]);
            $existing = $stmt->fetchColumn();
        }
        
        if ($existing) {
            $stmt = $db->prepare("UPDATE product_generated_images SET
                original_image = COALESCE(:original, original_image),
                transparent_image = COALESCE(:transparent, transparent_image),
                website_image = COALESCE(:website, website_image),
                website_image_png = COALESCE(:website_png, website_image_png),
                thumbnail_image = COALESCE(:thumbnail, thumbnail_image),
                banner_image = COALESCE(:banner, banner_image),
                social_image = COALESCE(:social, social_image),
                background_style = :background_style,
                background_id = :background_id,
                logo_position = :logo_position,
                watermark_enabled = :watermark_enabled,
                watermark_text = :watermark_text,
                watermark_phone = :watermark_phone,
                processing_settings = :processing_settings,
                updated_at = CURRENT_TIMESTAMP
                WHERE product_id = :product_id");
        } else {
            $stmt = $db->prepare("INSERT INTO product_generated_images (
                product_id, original_image, transparent_image, website_image, website_image_png,
                thumbnail_image, banner_image, social_image, background_style, background_id,
                logo_position, watermark_enabled, watermark_text, watermark_phone,
                processing_settings
            ) VALUES (
                :product_id, :original, :transparent, :website, :website_png,
                :thumbnail, :banner, :social, :background_style, :background_id,
                :logo_position, :watermark_enabled, :watermark_text, :watermark_phone,
                :processing_settings
            )");
        }
        
        $stmt->bindValue(':product_id', $productId > 0 ? $productId : null, PDO::PARAM_INT);
        $stmt->bindValue(':original', $original, PDO::PARAM_STR);
        $stmt->bindValue(':transparent', $transparent, PDO::PARAM_STR);
        $stmt->bindValue(':website', $website, PDO::PARAM_STR);
        $stmt->bindValue(':website_png', $websitePng, PDO::PARAM_STR);
        $stmt->bindValue(':thumbnail', $thumbnail, PDO::PARAM_STR);
        $stmt->bindValue(':banner', $banner, PDO::PARAM_STR);
        $stmt->bindValue(':social', $social, PDO::PARAM_STR);
        $stmt->bindValue(':background_style', isset($data['background_style']) ? $data['background_style'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':background_id', isset($data['background_id']) && $data['background_id'] !== '' ? (int)$data['background_id'] : null, PDO::PARAM_INT);
        $stmt->bindValue(':logo_position', isset($data['logo_position']) ? $data['logo_position'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':watermark_enabled', isset($data['watermark_enabled']) ? (int)$data['watermark_enabled'] : 0, PDO::PARAM_INT);
        $stmt->bindValue(':watermark_text', isset($data['watermark_text']) ? $data['watermark_text'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':watermark_phone', isset($data['watermark_phone']) ? $data['watermark_phone'] : '', PDO::PARAM_STR);
        $stmt->bindValue(':processing_settings', isset($data['processing_settings']) ? $data['processing_settings'] : '', PDO::PARAM_STR);
        
        $stmt->execute();
        $generatedId = $existing ? (int)$existing : (int)$db->lastInsertId();
        
        if ($productId > 0 && $website) {
            $upProd = $db->prepare("UPDATE products SET image_url = :image WHERE id = :id");
            $upProd->execute([':image' => $website, ':id' => $productId]);
        }
        
        echo json_encode(["success" => true, "id" => $generatedId, "website_image" => $website]);
        break;

    case 'upload_file':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        
        $uploadType = isset($_GET['type']) ? $_GET['type'] : 'product';
        
        // Handle BOTH 'image' and 'file' payload field names
        $fileKey = isset($_FILES['image']) ? 'image' : (isset($_FILES['file']) ? 'file' : null);
        
        if (!$fileKey) {
            $msg = "No file uploaded - 'image' key is missing from $_FILES.";
            error_log($msg);
            echo json_encode(["success" => false, "message" => $msg]);
            break;
        }
        
        $file = $_FILES[$fileKey];
        
        // PHP File Upload Errors Verification
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errCode = $file['error'];
            $phpErrors = [
                UPLOAD_ERR_INI_SIZE   => 'The uploaded file exceeds the upload_max_filesize directive in php.ini.',
                UPLOAD_ERR_FORM_SIZE  => 'The uploaded file exceeds the MAX_FILE_SIZE directive specified in the HTML form.',
                UPLOAD_ERR_PARTIAL    => 'The uploaded file was only partially uploaded.',
                UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary directory.',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
                UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the file upload.'
            ];
            $errorMessage = isset($phpErrors[$errCode]) ? $phpErrors[$errCode] : 'Unknown file upload error.';
            
            error_log("Upload Failure Log: PHP Error Code $errCode ($errorMessage). Name: " . $file['name'] . ", Size: " . $file['size'] . " bytes, Type: " . $file['type']);
            echo json_encode(["success" => false, "message" => "PHP upload failed: " . $errorMessage]);
            break;
        }
        
        // File Size Validation: Max 20 MB
        $maxSize = 20 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            $msg = "File exceeds the maximum allowable size of 20 MB (Size: " . round($file['size'] / (1024 * 1024), 2) . " MB).";
            error_log($msg . " Name: " . $file['name'] . ", Size: " . $file['size']);
            echo json_encode(["success" => false, "message" => $msg]);
            break;
        }
        
        if ($file['size'] == 0) {
            $msg = "Uploaded file is empty (0 bytes).";
            error_log($msg . " Name: " . $file['name']);
            echo json_encode(["success" => false, "message" => $msg]);
            break;
        }
        
        // File Type Validation
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'];
        if (!in_array($ext, $allowedExtensions)) {
            $msg = "Unsupported file type: ." . $ext . ". Allowed file types: " . implode(', ', $allowedExtensions);
            error_log($msg . " Name: " . $file['name']);
            echo json_encode(["success" => false, "message" => $msg]);
            break;
        }
        
        // Destination Folder Determination
        $destDir = $uploadsProductsFolder;
        $webSubPath = '/uploads/products';
        
        if ($uploadType === 'temp') {
            $destDir = $uploadsTempFolder;
            $webSubPath = '/uploads/temp';
        } else if ($uploadType === 'banner') {
            $destDir = $uploadsFolder;
            $webSubPath = '/uploads';
        } else if ($uploadType === 'background') {
            $destDir = $uploadsFolder . '/backgrounds';
            $webSubPath = '/uploads/backgrounds';
        }
        
        if (!file_exists($destDir)) {
            $msg = "Upload directory does not exist: " . $destDir;
            error_log($msg);
            echo json_encode(["success" => false, "message" => $msg]);
            break;
        }
        
        if (!is_writable($destDir)) {
            $msg = "Upload directory is not writable: " . $destDir;
            error_log($msg);
            echo json_encode(["success" => false, "message" => $msg]);
            break;
        }
        
        // Write File
        $name = bin2hex(random_bytes(16)) . '.' . $ext;
        $destination = $destDir . '/' . $name;
        
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            $webUrl = $webSubPath . '/' . $name;
            echo json_encode(["success" => true, "url" => $webUrl]);
        } else {
            $msg = "Failed to move uploaded file to destination directory: " . $destination;
            error_log($msg);
            echo json_encode(["success" => false, "message" => $msg]);
        }
        break;

    case 'load_background_templates':
        $templates = $db->query("SELECT * FROM background_templates ORDER BY sort_order ASC, name ASC")->fetchAll();
        // Convert is_default and is_active to booleans/integers properly
        foreach ($templates as &$t) {
            $t['id'] = (int)$t['id'];
            $t['is_default'] = (int)$t['is_default'] === 1;
            $t['is_active'] = (int)$t['is_active'] === 1;
            $t['sort_order'] = (int)$t['sort_order'];
        }
        echo json_encode(["success" => true, "templates" => $templates]);
        break;

    case 'save_background_template':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['name']) || empty($data['image_url'])) {
            echo json_encode(["success" => false, "message" => "Invalid template data"]);
            break;
        }
        
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $name = $data['name'];
        $imageUrl = $data['image_url'];
        $category = isset($data['category']) ? $data['category'] : 'Studio';
        $resolution = isset($data['resolution']) ? $data['resolution'] : '1920x1920';
        $isDefault = isset($data['is_default']) && $data['is_default'] ? 1 : 0;
        $sortOrder = isset($data['sort_order']) ? (int)$data['sort_order'] : 0;
        $isActive = isset($data['is_active']) && $data['is_active'] ? 1 : 0;
        
        if ($isDefault === 1) {
            // Reset defaults
            $db->exec("UPDATE background_templates SET is_default = 0");
        }
        
        if ($id > 0) {
            $stmt = $db->prepare("UPDATE background_templates SET name = :name, image_url = :url, category = :cat, resolution = :res, is_default = :is_def, sort_order = :ord, is_active = :is_act, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
            $stmt->execute([
                ':id' => $id,
                ':name' => $name,
                ':url' => $imageUrl,
                ':cat' => $category,
                ':res' => $resolution,
                ':is_def' => $isDefault,
                ':ord' => $sortOrder,
                ':is_act' => $isActive
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO background_templates (name, image_url, category, resolution, is_default, sort_order, is_active) VALUES (:name, :url, :cat, :res, :is_def, :ord, :is_act)");
            $stmt->execute([
                ':name' => $name,
                ':url' => $imageUrl,
                ':cat' => $category,
                ':res' => $resolution,
                ':is_def' => $isDefault,
                ':ord' => $sortOrder,
                ':is_act' => $isActive
            ]);
            $id = (int)$db->lastInsertId();
        }
        
        echo json_encode(["success" => true, "id" => $id]);
        break;

    case 'delete_background_template':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            echo json_encode(["success" => false, "message" => "Invalid ID"]);
            break;
        }
        
        // Retrieve image_url to delete file if it starts with '/uploads/'
        $stmt = $db->prepare("SELECT image_url FROM background_templates WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $imageUrl = $stmt->fetchColumn();
        
        if ($imageUrl && strpos($imageUrl, '/uploads/') === 0) {
            $filePath = __DIR__ . $imageUrl;
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }
        
        $stmtDel = $db->prepare("DELETE FROM background_templates WHERE id = :id");
        $stmtDel->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    case 'set_default_background_template':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            echo json_encode(["success" => false, "message" => "Invalid ID"]);
            break;
        }
        
        $db->exec("UPDATE background_templates SET is_default = 0");
        $stmt = $db->prepare("UPDATE background_templates SET is_default = 1 WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    case 'load_watermark_profiles':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $profiles = $db->query("SELECT * FROM watermark_profiles ORDER BY profile_name ASC")->fetchAll();
        foreach ($profiles as &$p) {
            $p['id'] = (int)$p['id'];
            $p['logo_size'] = isset($p['logo_size']) ? (int)$p['logo_size'] : null;
            $p['logo_opacity'] = isset($p['logo_opacity']) ? (int)$p['logo_opacity'] : null;
            $p['logo_margin_top'] = isset($p['logo_margin_top']) ? (int)$p['logo_margin_top'] : null;
            $p['logo_margin_bottom'] = isset($p['logo_margin_bottom']) ? (int)$p['logo_margin_bottom'] : null;
            $p['logo_margin_left'] = isset($p['logo_margin_left']) ? (int)$p['logo_margin_left'] : null;
            $p['logo_margin_right'] = isset($p['logo_margin_right']) ? (int)$p['logo_margin_right'] : null;
            $p['logo_margin'] = isset($p['logo_margin']) ? (int)$p['logo_margin'] : null;
            $p['logo_corner_radius'] = isset($p['logo_corner_radius']) ? (int)$p['logo_corner_radius'] : null;
            $p['website_enabled'] = isset($p['website_enabled']) ? (int)$p['website_enabled'] : null;
            $p['phone_enabled'] = isset($p['phone_enabled']) ? (int)$p['phone_enabled'] : null;
            $p['website_size_px'] = isset($p['website_size_px']) ? (int)$p['website_size_px'] : null;
            $p['phone_size_px'] = isset($p['phone_size_px']) ? (int)$p['phone_size_px'] : null;
            $p['letter_spacing'] = isset($p['letter_spacing']) ? (float)$p['letter_spacing'] : null;
            $p['line_spacing'] = isset($p['line_spacing']) ? (float)$p['line_spacing'] : null;
            $p['opacity'] = isset($p['opacity']) ? (int)$p['opacity'] : null;
            $p['rotation'] = isset($p['rotation']) ? (int)$p['rotation'] : null;
            $p['spacing_x'] = isset($p['spacing_x']) ? (int)$p['spacing_x'] : null;
            $p['spacing_y'] = isset($p['spacing_y']) ? (int)$p['spacing_y'] : null;
            $p['safe_margin'] = isset($p['safe_margin']) ? (int)$p['safe_margin'] : null;
            $p['avoid_product'] = isset($p['avoid_product']) ? (int)$p['avoid_product'] : null;
            $p['watermark_scale'] = isset($p['watermark_scale']) ? (float)$p['watermark_scale'] : null;
        }
        echo json_encode(["success" => true, "profiles" => $profiles]);
        break;

    case 'save_watermark_profile':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['profile_name'])) {
            echo json_encode(["success" => false, "message" => "Invalid profile name"]);
            break;
        }
        
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        
        $fields = [
            'profile_name', 'logo_position', 'logo_size', 'logo_opacity',
            'logo_margin_top', 'logo_margin_bottom', 'logo_margin_left', 'logo_margin_right',
            'logo_margin', 'logo_shadow', 'logo_background', 'website_enabled', 'phone_enabled',
            'layout', 'website_text', 'phone_text', 'website_font', 'phone_font',
            'website_size', 'phone_size', 'website_weight', 'phone_weight',
            'website_color', 'phone_color', 'line_spacing', 'letter_spacing', 'opacity',
            'rotation', 'density', 'spacing_x', 'spacing_y', 'safe_margin', 'avoid_product',
            'blend_mode', 'watermark_scale', 'text_shadow', 'text_outline',
            'website_color_hex', 'phone_color_hex', 'website_size_px', 'phone_size_px',
            'logo_border', 'logo_corner_radius'
        ];
        
        if ($id > 0) {
            $setSql = [];
            foreach ($fields as $f) {
                $setSql[] = "$f = :$f";
            }
            $sql = "UPDATE watermark_profiles SET " . implode(", ", $setSql) . ", updated_at = CURRENT_TIMESTAMP WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        } else {
            $cols = implode(", ", $fields);
            $placeholders = ":" . implode(", :", $fields);
            $sql = "INSERT INTO watermark_profiles ($cols) VALUES ($placeholders)";
            $stmt = $db->prepare($sql);
        }
        
        foreach ($fields as $f) {
            $val = isset($data[$f]) ? $data[$f] : null;
            if ($val === null) {
                $stmt->bindValue(":$f", null, PDO::PARAM_NULL);
            } elseif (is_int($val)) {
                $stmt->bindValue(":$f", $val, PDO::PARAM_INT);
            } elseif (is_float($val) || is_numeric($val)) {
                $stmt->bindValue(":$f", $val, PDO::PARAM_STR);
            } else {
                $stmt->bindValue(":$f", $val, PDO::PARAM_STR);
            }
        }
        
        $stmt->execute();
        $profileId = $id > 0 ? $id : (int)$db->lastInsertId();
        echo json_encode(["success" => true, "id" => $profileId]);
        break;

    case 'delete_watermark_profile':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            echo json_encode(["success" => false, "message" => "Invalid ID"]);
            break;
        }
        $stmt = $db->prepare("DELETE FROM watermark_profiles WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    // =========== GENDER MASTER CRUD ===========
    case 'save_gender':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $name = trim($data['name'] ?? '');
        if (empty($name)) {
            echo json_encode(["success" => false, "message" => "Name is required"]);
            break;
        }
        if ($id > 0) {
            $stmt = $db->prepare("UPDATE gender_master SET name = :name, display_order = :display_order, is_active = :is_active, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        } else {
            $stmt = $db->prepare("INSERT INTO gender_master (name, display_order, is_active) VALUES (:name, :display_order, :is_active)");
        }
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':display_order', (int)($data['display_order'] ?? 0), PDO::PARAM_INT);
        $stmt->bindValue(':is_active', isset($data['is_active']) ? (int)$data['is_active'] : 1, PDO::PARAM_INT);
        $stmt->execute();
        echo json_encode(["success" => true, "id" => $id > 0 ? $id : $db->lastInsertId()]);
        break;

    case 'delete_gender':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $stmt = $db->prepare("DELETE FROM gender_master WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    // =========== OCCASION MASTER CRUD ===========
    case 'save_occasion':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $name = trim($data['name'] ?? '');
        if (empty($name)) {
            echo json_encode(["success" => false, "message" => "Name is required"]);
            break;
        }
        if ($id > 0) {
            $stmt = $db->prepare("UPDATE occasion_master SET name = :name, display_order = :display_order, is_active = :is_active, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        } else {
            $stmt = $db->prepare("INSERT INTO occasion_master (name, display_order, is_active) VALUES (:name, :display_order, :is_active)");
        }
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':display_order', (int)($data['display_order'] ?? 0), PDO::PARAM_INT);
        $stmt->bindValue(':is_active', isset($data['is_active']) ? (int)$data['is_active'] : 1, PDO::PARAM_INT);
        $stmt->execute();
        echo json_encode(["success" => true, "id" => $id > 0 ? $id : $db->lastInsertId()]);
        break;

    case 'delete_occasion':
        if (!verifyAuth($db)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $stmt = $db->prepare("DELETE FROM occasion_master WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
        break;

    default:
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Unknown action"]);
        break;
}
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}
