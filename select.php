<?php

$server = 'mysql6015.xserver.jp';
$db_name = 'youking_field';
$encode = 'utf8';
$db_user = 'youking_idlabo';
$db_pass = 'youkey1001';

$dsn = "mysql:host=${server};dbname=${db_name};charset=${encode}";

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $driver_options);

    $stmt = $pdo->query("SELECT id, ST_AsGeoJson((geom)) AS geojson FROM field_data");
    $stmt->execute();

    $geojson;
    $json = [];
    // while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    while($row = $stmt->fetch()){
        $geojson = json_decode($row['geojson']);
        $geojson->id = $row['id'];
        $json[] = $geojson;
    }

} catch (PDOException $e) {
    exit('データベース接続失敗' . $e->getMessage());
}

// ヘッダーを指定することによりjsonの動作を安定させる
header('Content-type: application/json');
// jsへ渡す配列$jsonをjsonに変換する
echo json_encode($json);
exit;