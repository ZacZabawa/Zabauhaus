<?php
$host = 'localhost';
$db   = 'collusion';
$user = 'Zabauhaus';
$pass = 'Hellohellohell1!';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ATTR_ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $category_name = $_POST['category_name'];
    $category_type = $_POST['category_type'];

    $stmt = $pdo->prepare("INSERT INTO categories (category_name, category_type) VALUES (?, ?)");
    $stmt->execute([$category_name, $category_type]);
}

$categories = $pdo->query("SELECT * FROM categories")->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Manage Categories</title>
</head>
<body>
    <h1>Manage Categories</h1>

    <form action="admin.php" method="post">
        <label for="category_name">Category Name:</label>
        <input type="text" id="category_name" name="category_name" required>

        <label for="category_type">Category Type:</label>
        <select id="category_type" name="category_type">
            <option value="mandatory">Mandatory</option>
            <option value="extraneous">Extraneous</option>
        </select>

        <input type="submit" value="Add Category">
    </form>

    <h2>Existing Categories:</h2>
    <ul>
        <?php foreach ($categories as $category): ?>
            <li><?php echo $category['category_name'] . " (" . $category['category_type'] . ")"; ?></li>
        <?php endforeach; ?>
    </ul>
</body>
</html>
