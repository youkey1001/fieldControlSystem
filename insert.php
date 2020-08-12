<?php

// POSTメソッドでリクエストした値を取得
$lat= $_POST['lat'];
$lng = $_POST['lng'];
// locationを作成
$location = 'POINT(' . $lat . ' ' . $lng . ')';

$server = 'mysql6015.xserver.jp';
$db_name = 'youking_field';
$encode = 'utf8';
$db_user = 'youking_idlabo';
$db_pass = 'youkey1001';

$dsn = "mysql:host=${server};dbname=${db_name};charset=${encode}";

// データベース接続クラスPDOのインスタンス$dbhを作成する
try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $driver_options);

// PDOExceptionクラスのインスタンス$eからエラーメッセージを取得 
} catch (PDOException $e) {
    // 接続できなかったらvar_dumpの後に処理を終了する
    var_dump($e->getMessage());
    exit;
}

// データ追加用SQL
$sql = "INSERT INTO field_data(geom) VALUES(ST_GeomFromText(?, 4326))";
// SQLをセット
$stmt = $pdo->prepare($sql);
// SQLを実行
$stmt->execute(array($location));


// // ヘッダーを指定することによりjsonの動作を安定させる
// header('Content-type: application/json');
// // jsへ渡す配列$jsonをjsonに変換する
// echo json_encode($json);
// exit;