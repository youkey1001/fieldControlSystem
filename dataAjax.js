// データベースら地点登録データを取得
function select_data(map) {
    // ajax通信でデータベースからデータ取得
    $.ajax({
        url: 'select.php',
        type: 'GET',
        dataType: 'json'
    })
    .done(data => {
        console.log(data);
        render(data);
    })
    .fail(e => {
        console.log('error');
        console.log(e.responseText);
    });

    // 地点データからサークル作成
    function render(data) {
        data.forEach(geom => {
            var circle = new google.maps.Circle({
                map: map,
                center: {lat: geom.coordinates[0], lng: geom.coordinates[1]},
                radius: 100,
                id : geom.id
            });

            // サークルのクリックイベント
            google.maps.event.addListener(circle, 'click', function(event){
                // 座標を取得
                console.log(event.latLng.lat());
                console.log(event.latLng.lng());
                console.log(circle.get("id"));
                console.log(event);
            });
        });
    }
}


// データベースへ地点を登録
function insert_data(lat, lng) {
    $.ajax({
        // 送信方法
        type: "POST",
        // 送信先ファイル名
        url: "insert.php",
        // 受け取りデータの種類
        datatype: "json",
        // 送信データ
        data: {
            // locationをセット
            "lat" : lat,
            "lng" : lng
        }
    })
    // 通信が成功した時
    .done( function(data) {
        console.log('通信成功');
        console.log(data);
    })

    // 通信が失敗した時
    .fail( function(data) {
        console.log('通信失敗');
        console.log(data);
    });
}