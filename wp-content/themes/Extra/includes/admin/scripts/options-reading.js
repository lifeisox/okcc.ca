(function ($) {

	$(document).ready(function () {
		var $front_static_pages = $('#front-static-pages > fieldset');

		if ($front_static_pages.length > 0) {

			var layouts = EXTRA.layouts;
			layouts = $.parseJSON(layouts);

			$front_static_pages.append(
				'<p>\
					<label>\
						<input id="show_on_front_layout" name="show_on_front" type="radio" value="layout" class="tog" />\
						' + EXTRA.extra_theme_layout_link + '\
					</label>\
				</p>\
				<ul>\
					<li>\
						<label for="layout_home"><select id="home_layout" name="home_layout"></select></label>\
					</li>\
				</ul>'
			);

			for (var layout in layouts) {
				$('#home_layout').append('<option value="' + layouts[layout].id + '">' + layouts[layout].name + '</option>');
			}

			if ("layout" === EXTRA.show_on_front) {
				$('#show_on_front_layout').prop("checked", true);
				$('#home_layout').prop('disabled', false);
			} else {
				$('#home_layout').prop('disabled', true);
			}

			$('#home_layout').val(EXTRA.current_home_layout_id);

			$('input[name=show_on_front]').change(function () {
				if ($(this).val() !== 'page') {
					$("#page_on_front").prop('disabled', true);
					$("#page_for_posts").prop('disabled', true);
				}
				// disable the layouts selector if Layout option is not active
				if ($(this).val() === 'layout') {
					$('#home_layout').prop('disabled', false);
				} else {
					$('#home_layout').prop('disabled', true);
				}
			});
		}

	});

})(jQuery);
