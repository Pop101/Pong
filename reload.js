$('#reload').on('click', function() {
    $.ajax({
        url: $(location).attr('href'),
        success: function(data) {
            $('#container').html(data).delay(500);
        }
    });
});