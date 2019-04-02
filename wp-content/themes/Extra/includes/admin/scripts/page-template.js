(function ($) {

	$(document).ready(function () {
		var $page_template_meta_boxes = $('.page-template-options').closest('.postbox'),
			$map = $('.contact-map'),
			$sitemap_sections = $('#sitemap-sections');

		$page_template_meta_boxes.each(function () {
			var this_id = $(this).attr('id');
			$('#' + this_id + '-hide').closest('label').hide();
		});

		$('#page_template').change(function () {
			var current_page_template = $(this).val();

			$page_template_meta_boxes.each(function () {
				var this_page_template = $(this).find(".page-template-options").val();

				if (this_page_template === current_page_template) {
					if (!$(this).is(':visible')) {
						$(this).effect("highlight");
					}
				} else {
					$(this).hide();
				}
			});

			if ($page_template_meta_boxes.is(':visible')) {
				$('#et_pb_layout').removeClass('first-visible');
			} else {
				$('#et_pb_layout').addClass('first-visible');
			}
		}).trigger('change');

		$('ul.checklist').on('change', 'input[type=checkbox]', function () {
			var $checklist = $(this).closest('ul.checklist'),
				$check_all = $checklist.find('.check_all'),
				$all_checkboxes = $checklist.find('input[type=checkbox]').not('.check_all'),
				$all_checkboxes_checked = $all_checkboxes.filter(':checked');

			if ($all_checkboxes_checked.length === $all_checkboxes.length) {
				$check_all.prop('checked', true);
			} else if ('undefined' !== typeof $(this).attr('value') && !$(this).is(':checked')) {
				$check_all.prop('checked', false);
			}
		});

		$('input[type=checkbox].check_all').click(function () {
			var $checklist = $(this).closest('ul.checklist'),
				$all_checkboxes = $checklist.find('input[type=checkbox]').not('.check_all');

			if ($(this).is(':checked')) {
				$all_checkboxes.prop('checked', true);
			} else {
				$all_checkboxes.prop('checked', false);
			}
		});

		function setup_sitemap_sections() {
			var $sitemap_sections_checkboxes = $sitemap_sections.find('input[type=checkbox]');

			$sitemap_sections.sortable({
				items: 'li',
				cursor: 'move',
				forcePlaceholderSize: true
			});

			$sitemap_sections_checkboxes.on('change', function (e) {
				var $this = $(this),
					$settings_box = $('#sitemap_page_section_' + $this.val()),
					$all_settings_boxes = $('.sitemap_page_section'),
					is_all = ($this.val() === '1');

				if ($this.is(':checked')) {
					$settings_box.slideDown('fast');

					if (is_all) {
						$all_settings_boxes.slideDown('fast');
					}
				} else {
					$settings_box.slideUp('fast');

					if (is_all) {
						$all_settings_boxes.slideUp('fast');
					}
				}
			}).trigger('change');
		}

		if ($sitemap_sections.length) {
			setup_sitemap_sections();
		}

		function setup_contact_map() {
			var map,
				marker,
				$address = $('#contact_form_map_address'),
				$address_lat = $('#contact_form_map_address_lat'),
				$address_lng = $('#contact_form_map_address_lng'),
				$find_address = $('#contact_form_map_address_find'),
				$zoom_level = $('#contact_form_map_zoom'),
				geocoder = new google.maps.Geocoder(),
				default_zoom_level = 17;

			if ('' === $zoom_level.val()) {
				$zoom_level.val(default_zoom_level);
			}

			var geocode_address = function () {
				var address = $address.val();
				if (address.length <= 0) {
					$address_lat.val('');
					$address_lng.val('');
					return;
				}
				geocoder.geocode({
					'address': address
				}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						var result = results[0];

						$address.val(result.formatted_address);
						$address_lat.val(result.geometry.location.lat());
						$address_lng.val(result.geometry.location.lng());

						update_map(result.geometry.location);
					} else {
						alert('Geocode was not successful for the following reason: ' + status);
					}
				});
			};

			var update_map = function (LatLng) {
				marker.setPosition(LatLng);
				map.setCenter(LatLng);
			};

			var update_zoom = function () {
				map.setZoom(parseInt($zoom_level.val()));
			};

			$address.on('blur', geocode_address).on('keydown', function (e) {
				if (13 === e.keyCode) {
					geocode_address();
					e.preventDefault();
				}
			});

			$find_address.on('click', function (e) {
				e.preventDefault();
			});

			setTimeout(function () {
				map = new google.maps.Map($map[0], {
					zoom: parseInt($zoom_level.val()),
					mapTypeId: google.maps.MapTypeId.ROADMAP
				});

				marker = new google.maps.Marker({
					map: map,
					draggable: true
				});

				google.maps.event.addListener(marker, 'dragend', function () {
					var drag_position = marker.getPosition();
					$address_lat.val(drag_position.lat());
					$address_lng.val(drag_position.lng());

					update_map(drag_position);

					latlng = new google.maps.LatLng(drag_position.lat(), drag_position.lng());
					geocoder.geocode({
						'latLng': latlng
					}, function (results, status) {
						if (status === google.maps.GeocoderStatus.OK) {
							if (results[0]) {
								$address.val(results[0].formatted_address);
							} else {
								alert('No results found');
							}
						} else {
							alert('Geocoder failed due to: ' + status);
						}
					});

				});

				google.maps.event.addListener(map, 'zoom_changed', function () {
					var zoom_level = map.getZoom();
					$zoom_level.val(zoom_level);
				});

				if ('' !== $address_lat.val() && '' !== $address_lng.val()) {
					update_map(new google.maps.LatLng($address_lat.val(), $address_lng.val()));
				}

				if ('' !== $zoom_level.val()) {
					update_zoom();
				}

			}, 200);
		}

		if ($map.length) {
			$('#page_template').on('change', function () {
				if ('page-template-contact.php' === $(this).val()) {
					setTimeout(function () {
						setup_contact_map();
					}, 1500);
				}
			});

			if (!$map.parent().is(":visible")) {
				return;
			}

			setup_contact_map();
		}


	});

})(jQuery);
