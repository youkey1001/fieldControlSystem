// ロゴアニメーション終了時の処理
var indexChange = function(){
    var map =document.getElementById('map');
    // z-indexを変更
    map.style.zIndex = '2';
} 
setTimeout(indexChange, 4800);