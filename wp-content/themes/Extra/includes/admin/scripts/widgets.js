(function ($) {

	$(document).ready(function () {

		var $widgets_area = $('#widgets-right'),
			$ads_widgets = $('.et_ads_widget');

		$widgets_area.on('change', '.network-enabled', function () {
			var $this_checkbox = $(this),
				$this_network = $this_checkbox.closest('.et-social-followers-network'),
				$settings_box = $this_network.find('.et-network-settings');
			$settings_box.slideToggle();
		});

		$widgets_area.on('click', '.et-authorize-network', function () {
			var $authorize_button = $(this),
				network_name = $authorize_button.data('et-network-name') || '',
				$this_network = $authorize_button.closest('.et-social-followers-network'),
				$input_fields = $this_network.find('input.et-autorize-required-field'),
				authorize_ready = true,
				$spinner = $authorize_button.closest('div').find('.spinner'),
				$save_widget_button = $authorize_button.closest('form').find('input[name="savewidget"]'),
				fields_data;

			if ('' === network_name) {
				return false;
			}

			if ($input_fields.length) {
				$input_fields.css({
					'border-color': '#ddd'
				});
				fields_data = [];
				// check each required field and fill the fields_data array if field is not empty
				$input_fields.each(function () {
					var $this_field = $(this);

					// if required field is empty - add red border and set authorize_ready to false
					if ('' === $this_field.val()) {
						$this_field.css({
							'border-color': '#faa'
						});
						authorize_ready = false;
					} else {
						fields_data.push({
							'field_id': $this_field.data('original_field_name'),
							'field_val': $this_field.val()
						});
					}
				});
			}

			if (!authorize_ready) {
				return false;
			}

			// emulate click on the save widget button before refreshing the page
			$save_widget_button.click();
			$spinner.addClass('is-et-active');

			// wait until the saved data on page will be properly refreshed ( 3 seconds is enough ) and then open authorization page.
			setTimeout(function () {
				$.ajax({
					type: "POST",
					dataType: "json",
					url: EXTRA.ajaxurl,
					data: {
						action: 'et_social_authorize_network_' + network_name,
						et_extra_nonce: EXTRA.authorize_nonce,
						et_extra_fields_data: JSON.stringify(fields_data)
					},
					success: function (data) {
						if (typeof data === 'undefined') {
							return false;
						}

						if (typeof data.error_message !== 'undefined') {
							alert(data.error_message);
						} else if (typeof data.authorization_url !== 'undefined') {
							window.location = data.authorization_url;
						}
					}
				});
			}, 3000);
		});

		function ads_widget_setup($ads_widget) {
			var $ads_container = $ads_widget.find('.et_ads_widget_ads_container'),
				$ad_count = $ads_widget.find('.et_ads_ad_count'),
				$add_ad = $ads_widget.find('.et_ads_add_ad'),
				widget_number = $ads_widget.find('.et_ads_ad_widget_number').val();

			$ads_widget.on('click', '.delete_ad', function () {
				var $parent = $(this).parents('.et_ads_ad');

				$parent.slideUp('fast', function () {
					$parent.remove();

					var $ads = $ads_widget.find('.et_ads_ad');

					if ($ads.length <= 1) {
						$ads.find('.delete_ad').hide();
					} else {
						$ads.find('.delete_ad').show();
					}
				});

			});

			$add_ad.on('click', function (e) {
				e.preventDefault();

				var ad_number = $ad_count.val();

				$ads_container.append(
					'<div class="et_ads_ad group" data-ad_id="' + ad_number + '">\
						<div class="header">' + EXTRA.label_ad_number + ad_number + '</div>\
						<div class="content">\
							<div class="delete_ad">X</div>\
							<p class="field_wrap">\
								<label for="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][img_url]">' + EXTRA.label_img_url + '</label>\
								<input class="widefat" id="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][img_url]" name="widget-et_ads[' + widget_number + '][ads][' + ad_number + '][img_url]" type="text" value="">\
							</p>\
							<p class="field_wrap">\
								<label for="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][img_alt_text]">' + EXTRA.label_img_alt_text + '</label>\
								<input class="widefat" id="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][img_alt_text]" name="widget-et_ads[' + widget_number + '][ads][' + ad_number + '][img_alt_text]" type="text" value="">\
							</p>\
							<p class="field_wrap">\
								<label for="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][link_url]">' + EXTRA.label_link_url + '</label>\
								<input class="widefat" id="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][link_url]" name="widget-et_ads[' + widget_number + '][ads][' + ad_number + '][link_url]" type="text" value="">\
							</p>\
							<p>' + EXTRA.label_or + '</p>\
							<p class="field_wrap" >\
								<label for="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][ad_html]">' + EXTRA.label_ad_html + '</label>\
								<textarea class="widefat" rows="10" cols="20" id="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][ad_html]" name="widget-et_ads[' + widget_number + '][ads][' + ad_number + '][ad_html]"></textarea>\
							</p>\
							<p class="field_wrap">\
								<input id="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][new_line]" name="widget-et_ads[' + widget_number + '][ads][' + ad_number + '][new_line]" type="checkbox" checked="checked">&nbsp;<label for="widget-et_ads-' + widget_number + '-[ads][' + ad_number + '][new_line]">' + EXTRA.label_new_line + '</label>\
							</p>\
						</div>\
					</div>'
				);

				$ads_container = $ads_widget.find('.et_ads_widget_ads_container');
				$ads_container.accordion("refresh");

				$ads_container.find('.group').last().find('.header').click();

				$ads_widget.find('.delete_ad').show();
				$ad_count.val(parseInt(ad_number) + 1);
			});
		}

		function ads_container_accordion($ads_widget) {
			$ads_widget.find('.et_ads_widget_ads_container').accordion({
				header: '> div > .header',
				heightStyle: "content",
				collapsible: true
			});
		}

		if ($ads_widgets.length) {
			$ads_widgets.each(function () {
				ads_widget_setup($(this));
				ads_container_accordion($(this));
			});

			$(document).on('et_ads_widget_init', function (event) {
				ads_widget_setup(event.$el);
				ads_container_accordion(event.$el);
			});
		}

	});

})(jQuery);
