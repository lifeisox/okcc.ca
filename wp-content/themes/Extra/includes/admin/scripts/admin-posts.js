(function ($) {

	$(document).ready(function () {
		var $project_details_location_chooser = $('#_extra_project_details_location'),
			$extra_page_post_settings = $('#extra-page-post-settings'),
			$sidebar_control_field = $extra_page_post_settings.find('.extra-sidebar-control-field'),
			$sidebar_control_field_location = $extra_page_post_settings.find('.extra-sidebar-control-field.sidebar-location'),
			$sidebar_control_field_area = $extra_page_post_settings.find('.extra-sidebar-control-field.sidebar-area'),
			$sidebar_location_chooser = $extra_page_post_settings.find('select[name="_extra_sidebar_location"]');

		if ($sidebar_location_chooser.length > 0) {

			$sidebar_location_chooser.change(function () {
				if ('none' === $sidebar_location_chooser.val() || $sidebar_location_chooser.val() === '' && $sidebar_location_chooser.data('location') === 'none') {
					$sidebar_control_field_area.stop().slideUp();
				} else {
					if (!$project_details_location_chooser.length || 'sidebar' === $project_details_location_chooser.val()) {
						$sidebar_control_field_area.stop().slideDown();
					}
				}
			}).trigger('change');
		}

		if ($project_details_location_chooser.length > 0) {
			$project_details_location_chooser.change(function () {
				if ('sidebar' === $(this).val()) {
					$sidebar_control_field.stop().slideDown();
				} else if ('single_col' === $(this).val()) {
					$sidebar_control_field.stop().slideUp();
				} else if ('split' === $(this).val()) {
					$sidebar_control_field_location.stop().slideDown();
					$sidebar_control_field_area.stop().slideUp();
				} else {
					$sidebar_control_field.stop().slideUp();
				}

				// If location is set to no sidebar, keep hiding sidebar area
				if ('none' === $sidebar_location_chooser.val()) {
					$sidebar_control_field_area.stop().slideUp();
				}
			}).trigger('change');
		}
	});

})(jQuery);
