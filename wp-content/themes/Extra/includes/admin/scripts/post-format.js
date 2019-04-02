(function ($) {

	$(document).ready(function () {
		var $post_format_meta_boxes = $('.post-format-options').closest('.postbox'),
			$map = $('.et-post-format-map'),
			et_media_frame,
			$media_add_media = $('.et_media_add_media'),
			$video_post_format_box = $('#video-post-format'),
			$video_urls_container = $('.video_urls_container'),
			$video_url = $('.video_url'),
			video_url_count = $video_url.length,
			$add_video_url = $('.add_video_url');

		$media_add_media.on('click', function (e) {
			var $this = $(this);

			e.preventDefault();

			et_media_frame = wp.media.frames.et_media_frame = wp.media({
				title: $this.data('title'),
				button: {
					text: $this.data('title'),
				},
				states: [
					new wp.media.controller.Library({
						title: $this.data('title'),
						filterable: 'uploaded',
						multiple: 'add',
						editable: false,

						library: wp.media.query({
							type: $this.data('media-type')
						})
					})
				]
			});

			et_media_frame.open();

			et_media_frame.on('select', function (e) {

				var selection = et_media_frame.state().get('selection');

				selection.each(function (selection_item) {
					if (selection_item.has('url')) {
						$($this.data('url-field')).val(selection_item.get('url'));
					}
				});
			});

		});

		$post_format_meta_boxes.each(function () {
			var selected_format  = $('input[name=et_post_format]:checked').val();
			var this_post_format = $(this).find(".post-format-options").val();

			if (selected_format === this_post_format) {
				$(this).removeClass('hide-if-js');
			} else {
				$(this).addClass('hide-if-js');
			}
			
			var this_id = $(this).attr('id');
			$('#' + this_id + '-hide').closest('label').hide();
		});

		$('input[name=et_post_format]').change(function () {
			var current_post_format = $(this).val(),
				post_format_field_init = $('#post-formats-select').data('init');

			$post_format_meta_boxes.each(function () {
				var $this = $(this),
					this_post_format = $this.find(".post-format-options").val();

				if (this_post_format === current_post_format) {
					if (!$this.is(':visible')) {
						$this.slideDown('fast');
						if (post_format_field_init) {
							$('body').animate({
									scrollTop: $this.offset().top - $this.find('.hndle').outerHeight() - 10
								},
								200,
								'swing',
								function () {
									$this.effect("highlight");
								});
						}
						$('#post-formats-select').data('init', 1);
					}
				} else {
					$this.hide();
				}
			});
		});

		$video_post_format_box.on('click', '.delete_video_url', function () {
			var $parent = $(this).parents('.video_url');

			$parent.slideUp('fast', function () {
				$parent.remove();

				var $video_urls = $video_post_format_box.find('.video_url');

				if ($video_urls.length <= 1) {
					$video_url.find('.delete_video_url').hide();
				} else {
					$video_url.find('.delete_video_url').show();
				}
			});

		});

		$add_video_url.on('click', function (e) {
			e.preventDefault();

			var video_url_number = video_url_count,
				$new_video_url = $video_url.last().clone(true, true),
				url_field_id = '_video_format_url_' + video_url_number;

			$new_video_url.find('input').attr('id', url_field_id).val('');
			$new_video_url.find('button').attr('data-url-field', '#' + url_field_id);

			$new_video_url.appendTo($video_urls_container);

			video_url_count = parseInt(video_url_number) + 1;

			$video_url.find('.delete_video_url').show();
		});

		$('input[name=et_post_format]:checked').trigger('change');

		function setup_post_format_map() {
			var map,
				marker,
				$address = $('#map_format_address'),
				$address_lat = $('#map_format_lat'),
				$address_lng = $('#map_format_lng'),
				$find_address = $('#map_format_find'),
				$zoom_level = $('#map_format_zoom'),
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
			$('input[name=et_post_format]').on('change', function () {
				if ('map' === $(this).val()) {
					setTimeout(function () {
						setup_post_format_map();
					}, 1500);
				}
			});

			if (!$map.parent().is(":visible")) {
				return;
			}

			setup_post_format_map();
		}

	}); // end $( document ).ready()

})(jQuery);
