/* Toggle FAQ */
$('.faq-a').hide();

$('.faq-q').click(function() {
    var item = $(this).parent('.faq-item');
    if (item.hasClass('open')) {
        item.removeClass('open');
        item.find('.faq-a').slideUp(200);
    } else {
        $('.faq-item').removeClass('open');
        $('.faq-a').slideUp(200);
        item.addClass('open');
        item.find('.faq-a').slideDown(200);
    }
});

/* Popup Layer */
$('.open-modal').click(function() {
    var target = $(this).data('target');
    $('#' + target).show();
});

$('.close-modal').click(function() {
    $(this).closest('.modal').hide();
});

$('.modal').click(function(e) {
    if ($(e.target).hasClass('modal')) {
        $(this).hide();
    }
});
