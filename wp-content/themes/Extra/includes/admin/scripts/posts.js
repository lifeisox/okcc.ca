(function ($) {

	$(document).ready(function () {

		var $post_review_box = $('#post-review-box');

		function review_box_setup() {
			var $breakdowns_container = $post_review_box.find('.breakdowns_container'),
				$breakdowns_count = $post_review_box.find('.breakdowns_count'),
				$add_breakdown = $post_review_box.find('.add_breakdown');

			$post_review_box.on('click', '.delete_breakdown', function () {
				var $parent = $(this).parents('.breakdown');

				$parent.slideUp('fast', function () {
					$parent.remove();

					var $breakdowns = $post_review_box.find('.breakdown');

					if ($breakdowns.length <= 1) {
						$breakdowns.find('.delete_breakdown').hide();
					} else {
						$breakdowns.find('.delete_breakdown').show();
					}
				});

			});

			$add_breakdown.on('click', function (e) {
				e.preventDefault();

				var breakdown_number = $breakdowns_count.val();

				$breakdowns_container.append(
					'<div class="breakdown group" data-breakdown_id="' + breakdown_number + '">\
						<div class="header">' + EXTRA.label_breakdown_number + breakdown_number + '</div>\
						<div class="content">\
							<div class="delete_breakdown">X</div>\
							<p class="field_wrap">\
								<label for="_post_review_box_breakdowns[' + breakdown_number + '][title]">' + EXTRA.label_breakdown_title + '</label>\
								<input class="widefat" id="_post_review_box_breakdowns[' + breakdown_number + '][title]" name="_post_review_box_breakdowns[' + breakdown_number + '][title]" type="text" value="">\
							</p>\
							<p class="field_wrap">\
								<label for="_post_review_box_breakdowns[' + breakdown_number + '][rating]">' + EXTRA.label_breakdown_rating + '</label>\
								<input class="widefat" id="_post_review_box_breakdowns[' + breakdown_number + '][rating]" name="_post_review_box_breakdowns[' + breakdown_number + '][rating]" type="text" value="">\
							</p>\
						</div>\
					</div>'
				);

				$breakdowns_container = $post_review_box.find('.breakdowns_container');
				$breakdowns_container.accordion("refresh");

				$breakdowns_container.find('.group').last().find('.header').click();

				$post_review_box.find('.delete_breakdown').show();
				$breakdowns_count.val(parseInt(breakdown_number) + 1);
			});
		}

		function breakdowns_container_accordion() {
			$post_review_box.find('.breakdowns_container').accordion({
				header: '> div > .header',
				heightStyle: "content",
				collapsible: true
			});
		}

		if ($post_review_box.length > 0) {
			review_box_setup();
			breakdowns_container_accordion();
		}

	});

})(jQuery);
