var map;
var markers = [];

// 初期の緯度、経度を指定
var latLng = {
  lat: 34.85729,
  lng: 136.573573
};

// APIコード側でコールバック指定済み => JS側停止
// $(document).ready(function() {
//   initMap();
// });

// エントリーポイント
function initMap() {
  let location; // 右クリック時の座標

  // マップのオプション設定
  var mapOpts = {
    zoom: 15, 
    center: latLng,
    mapTypeId: 'roadmap',   //地図の種類
    mapTypeControl: false,
    streetViewControl: false   
  }

  // グーグルマップを描画
  map = new google.maps.Map(document.getElementById('map'), mapOpts);

  // データベースから地点登録データを取得し、サークルを作成
  select_data(map);

  // コンテキストメニューの設定
  let contextMenu = document.getElementById('contextMenu');
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(contextMenu);
  hideContextMenu();  // コンテキストメニュー非表示

  // マップ上で右クリックイベント
  google.maps.event.addListener(map, "rightclick", function(event) {
    showContextMenu(event);   // コンテキストメニュー表示
    location = event.latLng;  // クリック位置の座標取得
  });
  // マップ上でクリックイベント
  google.maps.event.addListener(map, "click", function(event) {
    hideContextMenu();  // コンテキストメニュー非表示
  });
  // マップ上でズーム変更イベント
  google.maps.event.addListener(map, "zoom_changed", function(event) {
    hideContextMenu();  // コンテキストメニュー非表示
  });
  // マップ上でドラックイベント
  google.maps.event.addListener(map, "drag", function(event) {
    hideContextMenu();  // コンテキストメニュー非表示
  });


  /* 
   * コンテキストメニューコマンド一覧
   * 
   * 1.ポイント登録
   * 2.エリア作成
   * 3.サークル作成
   * 4.
   */

  // 1.ポイント登録
  var addMarkerPoint = document.getElementById('addMarker');
  addMarkerPoint.addEventListener("click", function() {
    addMarker(location, map); // マーカー作成
    hideContextMenu();        // コンテキストメニュー非表示
  });

  // 2.エリア作成
  var addPolygonPath = document.getElementById('addPolygon');
  addPolygonPath.addEventListener("click", function() {
    // ポイント数のチェック　(注)マーカーが３つ以下なら警告を表示
    if(markers.length >= 3) {
      addPolygon(map);    // ポリゴン作成
    } 
    else {
      swal( 'ポリゴン作成失敗', 'ポイントを３つ以上作成して下さい。', 'warning' );
    }
    
    hideContextMenu();  // コンテキストメニュー非表示
  });

  // 3.サークル作成
  var addCirclePath = document.getElementById('addCircle');
  addCirclePath.addEventListener("click", function() {
    addCircle(location, map);;    // サークル作成
    hideContextMenu();  // コンテキストメニュー非表示
  });

}

// コンテキストメニュー表示
function showContextMenu(event) {
  console.log(event.pixel.x);
  $('#contextMenu').css("display", "block");
  $('#contextMenu').css({
    left: event.pixel.x,
    top: event.pixel.y
  })
}
// コンテキストメニュー非表示
function hideContextMenu() {
  $('#contextMenu').css("display", "none");
}


// マーカー作成
function addMarker(location, map) {
  // マーカーのオプション設定
  var markOpts = {
    position: location,
    map: map,
    label: { 
      text: String(markers.length + 1),
      color: 'white',
      fontWeight: 'bold',
      draggable: false
    },
  }
  // マーカーをマップに追加
  const marker = new google.maps.Marker(markOpts);
  // マーカーの中央にマップを移動
  // map.panTo(location);
  markers.push(marker);

  // マーカー上でクリックイベント
  google.maps.event.addListener(marker, 'click', function(e){
    console.log(e);
    var markerNum = Number(marker.getLabel().text);   // マーカー番号を取得　(注)textを指定必須
    markers.splice(markerNum - 1 ,1);                 // 配列から該当番号のマーカー削除
    marker.setMap(null);                              // マーカーをマップ上から削除
    updateMapOnAll();                                 // マーカーラベルをアップデート
  });

}

// サークル
function addCircle(location, map) {
  //* 入力はモーダルウィンドウで実装 */
  // 人数を取得
  const p_count = 1;
  // エリアの範囲(km)を取得
  const area_km = 0.5;
  // キロメートルをメートル変換
  var area_m = area_km * 1000 * p_count;

  var cirOpts = {
    map: map,               // 表示させる地図（google.maps.Map）
    center: location,       // 中心点(google.maps.LatLng)
    radius: 100,         // 半径（ｍ）
    fillColor: '#ff0000',   // 塗りつぶし色
    fillOpacity: 0.5,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
    strokeColor: '#ff0000', // 外周色
    strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
    strokeWeight: 1         // 外周太さ（ピクセル）
  }

  // サークルをマップに追加
  var circle = new google.maps.Circle(cirOpts);

  // 緯度・経度を取得
  var lat = location.lat();
  var lng = location.lng();
  // サークルをデータベースに登録
  insert_data(lat, lng);

}

// ポリゴン作成
function addPolygon(map) {
  // ポリゴンオブジェクト
  var bermudaTriangle;

  // ポイント座標変数
  var polyPoints = '';
  
  // ポリゴンを描画する図形の各頂点の緯度・経度を配列で指定
  // すべてのマーカー座標を配列に格納　(注)ポイント登録順に格納
  var triangleCoords = [];
  for (var i = 0; i < markers.length; i++) {
    
    // ポリゴンの各頂点(ポイント)を「GeomFromText」形式に変換
    // => MySQLへInsertを実装予定 -Y.Tsutsui 2020/7/19 
    polyPoints += markers[i].getPosition().lat();
    polyPoints += ' '
    polyPoints += markers[i].getPosition().lng();
    if((markers.length - 1) != i) {
      polyPoints += ','
    }
    
    // ポリゴンの各頂点(ポイント)を配列に格納
    triangleCoords.push(markers[i].getPosition());
  }

  // ポリゴンのオプション設定
  var polyOpts = {
    paths: triangleCoords,  //パス配列
    strokeColor: '#FF0000', //ストロークの色
    strokeOpacity: 0.8,     //ストロークの透明度
    strokeWeight: 2,        //ストロークの幅
    fillColor: '#FF0000',   //フィルの色
    fillOpacity: 0.35       //フィルの透明度
  }

  // ポリゴン描画
  bermudaTriangle = new google.maps.Polygon(polyOpts);

  // ポリゴンを地図に追加
  bermudaTriangle.setMap(map);

  // ポリゴン作成終了時の処理
  clearMarkers(); // マーカーをすべて削除
  markers =[];    // マーカー配列を初期化
}


// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// マーカーラベルの番号をアップデート
function updateMapOnAll() {
  console.log(markers.length);
  
  // すべてのマーカーラベルに番号を再割り当て
  for (var i = 0; i < markers.length; i++) {
    // ラベルオプション
    var option = {          
      text: String(i + 1),
      color: 'white',
      fontWeight: 'bold'
    }
    // ラベル付与
    markers[i].set('label', option);
  }
}
