$(document).ready(function() {

	$('.UserExpertCheck').each(function(index) {
		$(this).on('click', function(e) {
			$('.langButtons').removeClass('active');
			$(this).addClass('active');
		});
	});

});