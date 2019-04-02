(function ($) {

	// Append category description as soon as possible
	var category_description = $('<p />', {
		class: 'description'
	}).text(EXTRA.category_description);

	$('#taxonomy-category').append(category_description);

})(jQuery);
