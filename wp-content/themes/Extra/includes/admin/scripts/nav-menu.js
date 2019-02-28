(function ($) {
	$(document).ready(function () {
		$('#menu-to-edit').on('click', '.item-edit', function () {
			var item_id = $(this).attr('id').split('-')[1],
				$parent = $('#menu-item-' + item_id),
				$item_description = $parent.find('p.field-description.description'),
				$mega_menu_setting = $('#field-mega-menu-' + item_id + '.unmoved');

			if ($mega_menu_setting.length < 1) {
				return;
			}

			$mega_menu_setting.insertBefore($item_description);
			$mega_menu_setting.removeClass('unmoved').show();
		});
	});

})(jQuery);
