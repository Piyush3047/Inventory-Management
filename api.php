<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database file path
$dataFile = __DIR__ . '/data.json';

// Initialize data file if it doesn't exist
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

// Get request method and action
$request_method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($request_method) {
        case 'GET':
            handleGet($action, $dataFile);
            break;
        case 'POST':
            handlePost($action, $dataFile);
            break;
        case 'PUT':
            handlePut($action, $dataFile);
            break;
        case 'DELETE':
            handleDelete($action, $dataFile);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleGet($action, $dataFile) {
    if ($action === 'getProducts') {
        $products = json_decode(file_get_contents($dataFile), true);
        echo json_encode(['success' => true, 'products' => $products]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
}

function handlePost($action, $dataFile) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'addProduct') {
        $products = json_decode(file_get_contents($dataFile), true);
        
        // Validate SKU uniqueness
        foreach ($products as $product) {
            if ($product['sku'] === $data['sku']) {
                http_response_code(400);
                echo json_encode(['error' => 'SKU already exists']);
                return;
            }
        }
        
        // Add new product
        $newProduct = [
            'id' => $data['id'],
            'name' => $data['name'],
            'category' => $data['category'],
            'sku' => $data['sku'],
            'price' => (float)$data['price'],
            'quantity' => (int)$data['quantity'],
            'minStock' => (int)$data['minStock'],
            'description' => $data['description'] ?? '',
            'supplier' => $data['supplier'] ?? '',
            'dateAdded' => $data['dateAdded']
        ];
        
        $products[] = $newProduct;
        
        if (file_put_contents($dataFile, json_encode($products, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'product' => $newProduct]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save product']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
}

function handlePut($action, $dataFile) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'updateProduct') {
        $products = json_decode(file_get_contents($dataFile), true);
        $found = false;
        
        foreach ($products as &$product) {
            if ($product['id'] == $data['id']) {
                $product['name'] = $data['name'];
                $product['category'] = $data['category'];
                $product['sku'] = $data['sku'];
                $product['price'] = (float)$data['price'];
                $product['quantity'] = (int)$data['quantity'];
                $product['minStock'] = (int)$data['minStock'];
                $product['description'] = $data['description'] ?? '';
                $product['supplier'] = $data['supplier'] ?? '';
                $found = true;
                break;
            }
        }
        
        if ($found) {
            if (file_put_contents($dataFile, json_encode($products, JSON_PRETTY_PRINT))) {
                echo json_encode(['success' => true, 'product' => $product]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update product']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
}

function handleDelete($action, $dataFile) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'deleteProduct') {
        $products = json_decode(file_get_contents($dataFile), true);
        $productId = $data['id'] ?? null;
        
        $filtered = array_filter($products, function($p) use ($productId) {
            return $p['id'] != $productId;
        });
        
        if (count($filtered) < count($products)) {
            $filtered = array_values($filtered);
            if (file_put_contents($dataFile, json_encode($filtered, JSON_PRETTY_PRINT))) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete product']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
}
?>
