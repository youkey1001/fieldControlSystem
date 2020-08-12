$(function(){
    // モーダルウィンドウ表示
    $('.js-modal-open').on('click',function(){
        $('.js-modal').fadeIn();
        hideContextMenu();  // コンテキストメニュー非表示
        return false;
    });
    // モーダルウィンドウ非表示
    $('.js-modal-close').on('click',function(){
        $('.js-modal').fadeOut();
        return false;
    });
});