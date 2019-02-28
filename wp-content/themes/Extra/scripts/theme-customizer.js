/**
 * Theme Customizer enhancements for a better user experience.
 *
 * Contains handlers to make Theme Customizer preview reload changes asynchronously.
 */

(function ($, top_$, EXTRA) {
	var boxed_layout_background_color,
		value_bind_callbacks,
		shared_paramless_callbacks;

	function hexdec(hex_string) {
		hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
		return parseInt(hex_string, 16);
	}

	function dechex(number) {
		var hex_string;
		if (number < 0) {
			number = 0xFFFFFFFF + number + 1;
		}

		hex_string = parseInt(number, 10).toString(16);
		if (1 === hex_string.length) {
			hex_string = '0' + hex_string;
		}
		return hex_string;
	}

	function changeHexColor(hex_string, amount) {
		var r, g, b;
		amount = amount || -25;
		hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
		if (hex_string.length === 6) {
			r = hexdec(hex_string.substring(0, 2));
			g = hexdec(hex_string.substring(2, 4));
			b = hexdec(hex_string.substring(4, 6));
		} else if (hex_string.length === 3) {
			r = hex_string.substring(0, 1);
			g = hex_string.substring(1, 2);
			b = hex_string.substring(2, 3);
			r = hexdec(r + r);
			g = hexdec(g + g);
			b = hexdec(b + b);
		}

		r = Math.max(r + amount, 0);
		g = Math.max(g + amount, 0);
		b = Math.max(b + amount, 0);

		return '#' + dechex(r) + dechex(g) + dechex(b);
	}

	function et_print_font_style(styles, important, boldness) {
		var font_styles = "";

		if ('undefined' !== typeof styles && false !== styles) {

			var styles_array = styles.split('|');

			if ('undefined' !== typeof important && important.length > 0) {
				important = " " + important;
			} else {
				important = "";
			}

			if ('undefined' === typeof boldness) {
				boldness = 'bold';
			}

			if (-1 !== styles_array.indexOf('bold')) {
				font_styles = font_styles + "font-weight: " + boldness + important + "; ";
			} else {
				font_styles = font_styles + "font-weight: normal" + important + "; ";
			}

			if (-1 !== styles_array.indexOf('italic')) {
				font_styles = font_styles + "font-style: italic" + important + "; ";
			} else {
				font_styles = font_styles + "font-style: normal" + important + "; ";
			}

			if (-1 !== styles_array.indexOf('uppercase')) {
				font_styles = font_styles + "text-transform: uppercase" + important + "; ";
			} else {
				font_styles = font_styles + "text-transform: none" + important + "; ";
			}

			if (-1 !== styles_array.indexOf('underline')) {
				font_styles = font_styles + "text-decoration: underline" + important + "; ";
			} else {
				font_styles = font_styles + "text-decoration: none" + important + "; ";
			}
		}

		return font_styles;
	}

	/**
	 * This is a simplified version of {@see et_builder_maybe_wrap_css_selector()}.
	 * If multiple selectors (eg. selector1, selector2) are provided they will each be wrapped.
	 *
	 * @param selector
	 */
	function maybe_wrap_css_selector(selector) {
		if ('no' === EXTRA.is_custom_post_type) {
			return selector;
		}

		var selectors = selector.split(',');
		var result    = '';

		_.forEach(selectors, function(css_selector) {
			result += EXTRA.css_selector_wrapper + ' ' + css_selector;
		});

		return result.join(',');
	}

	var class_toggle_callbacks = {};
	var css                    = maybe_wrap_css_selector;

	value_bind_callbacks = {
		extra_sidebar_width_css_value: function (setting_name, property, unformatted_value) {
			var formatted_value,
				sidebar_width = unformatted_value,
				content_width = 100 - sidebar_width;

			formatted_value =
				"@media only screen and (min-width: 1025px) {" +
				".with_sidebar" + css('.et_pb_extra_column_sidebar') + "{" +
				"	min-width: " + sidebar_width + "%;" +
				"	max-width: " + sidebar_width + "%;" +
				"	width: " + sidebar_width + "%;" +
				"	flex-basis: " + sidebar_width + "%;" +
				"}" +
				".with_sidebar" + css( '.et_pb_extra_column_main' ) + "{" +
				"	min-width: " + content_width + "%;" +
				"	max-width: " + content_width + "%;" +
				"	width: " + content_width + "%;" +
				"	flex-basis: " + content_width + "%;" +
				"}" +
				"}";

			return formatted_value;
		},

		extra_gutter_width_css_value: function (setting_name, property, unformatted_value) {
			var formatted_value,
				gutter_width = unformatted_value;

			formatted_value =
				css('.et_pb_container') + "{ " +
				"	padding: 0 " + gutter_width + "px;" +
				"}" +

				css('.et_pb_row') + "{" +
				"	margin: 0 - " + (gutter_width / 2) + "px;" +
				"}" +

				css('.et_pb_column') + "{" +
				"	padding: 0 " + (gutter_width / 2) + "px;" +
				"}";

			return formatted_value;
		},

		extra_et_print_font_style_css_value: function (setting_name, property, unformatted_value, setting_options) {
			var default_value = typeof setting_options.default === 'undefined' ? false : setting_options.default,
				boldness = typeof setting_options.boldness === 'undefined' ? 'bold' : setting_options.boldness,
				formatted_value;

			if ('undefined' === typeof unformatted_value || default_value === unformatted_value) {
				formatted_value = '';
			} else {
				formatted_value = et_print_font_style(unformatted_value, false, boldness);
			}

			return formatted_value;
		},

		et_pb_module_tabs_padding_css_value: function (setting_name, property, unformatted_value) {
			var padding_tab_top_bottom = parseInt(unformatted_value) * 0.133333333,
				padding_tab_active_top = padding_tab_top_bottom + 1,
				padding_tab_active_bottom = padding_tab_top_bottom - 1,
				padding_tab_content = parseInt(unformatted_value) * 0.8;

			// negative result will cause layout issue
			if (padding_tab_active_bottom < 0) {
				padding_tab_active_bottom = 0;
			}

			var formatted_value =
				css('.et_pb_tabs_controls li') + "{ padding: " + padding_tab_active_top + "px " + unformatted_value + "px " + padding_tab_active_bottom + "px; } " +
				css('.et_pb_tabs_controls li.et_pb_tab_active') + "{ padding: " + padding_tab_top_bottom + "px " + unformatted_value + "px; } " +
				css('.et_pb_all_tabs') + "{ padding: " + padding_tab_content + "px " + unformatted_value + "px ; }";

			return formatted_value;
		},

		et_pb_module_slider_padding_css_value: function (setting_name, property, unformatted_value) {
			var formatted_value = "padding-top: " + unformatted_value + "%; padding-bottom: " + unformatted_value + "%;";
			return formatted_value;
		},

		et_pb_module_cta_padding_css_value: function (setting_name, property, unformatted_value) {
			unformatted_value = parseInt(unformatted_value);

			var formatted_value =
				css('.et_pb_promo') + "{ padding: " + unformatted_value + "px " + (unformatted_value * (60 / 40)) + "px; }" +
				css('.et_pb_column_1_2 .et_pb_promo, .et_pb_column_1_3 .et_pb_promo, .et_pb_column_1_4 .et_pb_promo') + "{ padding: " + unformatted_value + "px; }";

			return formatted_value;
		},

		et_pb_social_media_follow_font_size_css_value: function (setting_name, property, unformatted_value) {
			var icon_margin = parseInt(unformatted_value) * 0.57,
				icon_dimension = parseInt(unformatted_value) * 2;

			return css('.et_pb_social_media_follow li a.icon') + "{ margin-right: " + icon_margin + "px; width: " + icon_dimension + "px; height: " + icon_dimension + "px; }" + css('.et_pb_social_media_follow li a.icon::before') + "{ width: " + icon_dimension + "px; height: " + icon_dimension + "px; font-size: " + unformatted_value + "px; line-height: " + icon_dimension + "px; }" + css('.et_pb_social_media_follow li a.follow_button') + "{ font-size:" + unformatted_value + "px; }";
		},

		et_extra_secondary_nav_icon_search_cart_font_size_css_value: function (setting_name, property, unformatted_value) {
			var value = parseInt(unformatted_value),
				icon_dimension = Math.floor(value * (16 / 12)),
				icon_box_dimension = value * (30 / 12),
				search_cart_padding_top_bottom = Math.floor(value * (7 / 12)),
				search_cart_padding_right_left = value * (10 / 12),
				search_button_margin = 0 - (value / 2),
				search_width = value * (120 / 12),
				formatted_value;

			formatted_value =
				"#et-info .et-cart," +
				"#et-info .et-cart:before," +
				"#et-info .et-top-search .et-search-field," +
				"#et-info .et-top-search .et-search-submit:before {" +
				"	font-size: " + unformatted_value + "px" +
				"}" +
				"#et-info .et-extra-social-icons .et-extra-icon {" +
				"	font-size: " + icon_dimension + "px;" +
				"	line-height: " + icon_box_dimension + "px;" +
				"	width:" + icon_box_dimension + "px;" +
				"	height: " + icon_box_dimension + "px;" +
				"}" +
				"#et-info .et-cart," +
				"#et-info .et-top-search .et-search-field {" +
				"	padding: " + search_cart_padding_top_bottom + "px " + search_cart_padding_right_left + "px;" +
				"}" +
				"#et-info .et-top-search .et-search-field {" +
				"	width: " + search_width + "px;" +
				"}" +
				"#et-info .et-top-search .et-search-submit:before {" +
				"	margin-top: " + search_button_margin + "px;" +
				"}";

			return formatted_value;
		},

		et_extra_secondary_nav_trending_font_size_css_value: function (setting_name, property, unformatted_value) {
			var value = parseInt(unformatted_value),
				trending_button_width = value * (20 / 14),
				trending_button_height = value * (2 / 14),
				trending_button_clicked_first_translateY = 6 + ((((value * (6 / 14))) - 6) / 2),
				trending_button_clicked_last_translateY = 0 - trending_button_clicked_first_translateY,
				formatted_value;

			formatted_value =
				"#et-trending-label," +
				".et-trending-post a {" +
				"	font-size: " + value + "px;" +
				"}" +
				"#et-trending-button {" +
				"	width: " + trending_button_width + "px;" +
				"	height: " + trending_button_width + "px;" +
				"}" +
				"#et-trending-button span {" +
				"	width: " + trending_button_width + "px;" +
				"	height: " + trending_button_height + "px;" +
				"}" +
				"#et-trending-button.toggled span:first-child {" +
				"	-webkit-transform: translateY(" + trending_button_clicked_first_translateY + "px) rotate(45deg);" +
				"	transform: translateY(" + trending_button_clicked_first_translateY + "px) rotate(45deg);" +
				"}" +
				"#et-trending-button.toggled span:last-child {" +
				"	-webkit-transform: translateY(" + trending_button_clicked_last_translateY + "px) rotate(-45deg);" +
				"	transform: translateY(" + trending_button_clicked_last_translateY + "px) rotate(-45deg);" +
				"}";

			return formatted_value;
		}
	};

	shared_paramless_callbacks = {
		extra_nav_height_value: function () {
			var default_nav_height = 124,
				default_logo_height = 51,
				default_font_size = 16,
				prefixes = ['primary', 'fixed'],
				formatted_value = '',
				primary_nav_hide_logo_image = typeof wp.customize.value('et_extra[primary_nav_hide_logo_image]')() === 'undefined' ? false : wp.customize.value('et_extra[primary_nav_hide_logo_image]')(),
				primary_nav_logo_image_visibility = primary_nav_hide_logo_image ? 'none' : 'block',
				header_style = typeof wp.customize.value('et_extra[header_style]')() === 'undefined' ? 'left-right' : wp.customize.value('et_extra[header_style]')(),
				header_style_class_name = header_style === 'centered' && primary_nav_hide_logo_image ? '.centered' : '.left-right',
				$main_header = $('#main-header'),
				$logo = $main_header.find('.logo');

			_.each(prefixes, function (prefix, index) {
				var nav_height = typeof wp.customize.value('et_extra[' + prefix + '_nav_height]')() === 'undefined' ? default_nav_height : parseInt(wp.customize.value('et_extra[' + prefix + '_nav_height]')()),
					logo_height_value = typeof wp.customize.value('et_extra[' + prefix + '_nav_logo_height]')() === 'undefined' ? default_logo_height : parseInt(wp.customize.value('et_extra[' + prefix + '_nav_logo_height]')()),
					nav_font_size = typeof wp.customize.value('et_extra[' + prefix + '_nav_font_size]')() === 'undefined' ? default_font_size : parseInt(wp.customize.value('et_extra[' + prefix + '_nav_font_size]')()),
					logo_height = (logo_height_value / 100) * nav_height,
					logo_margin = (nav_height - logo_height) / 2,
					menu_padding = (nav_height / 2) - (nav_font_size / 2),
					wrapper = prefix === 'fixed' ? '.et-fixed-header ' : '';

				formatted_value +=
					"@media only screen and (min-width: 768px) {" +
					wrapper + "#main-header .logo { height: " + logo_height + "px; margin: " + logo_margin + "px 0; }" +
					wrapper + "#logo{ max-width: none }" +
					wrapper + ".header" + header_style_class_name + " #et-navigation > ul > li > a { padding-bottom: " + menu_padding + "px; }" +
					"}";

				if (prefix === 'fixed') {
					$logo.attr({
						'data-fixed-height': logo_height_value
					});

					$main_header.attr({
						'data-fixed-height': nav_height
					});
				}

				if ($('#main-header .etad').length) {
					formatted_value +=
						"@media only screen and (min-width: 768px) {" +
						wrapper + "#main-header .etad { max-height: " + logo_height + "px; margin: " + logo_margin + "px 0; }" +
						"}";
				}

				if ( primary_nav_hide_logo_image ) {
					var menu_item_before_top = menu_padding + 10;

					formatted_value +=
						"@media only screen and (min-width: 768px) {" +
						wrapper + ".header" + header_style_class_name + " #et-navigation > ul > li > a { padding-top: " + menu_padding + "px; }" +
						wrapper + ".header" + header_style_class_name + " #et-navigation > ul > li > a:before { top: " + menu_item_before_top + "px; }" +
						"}";
				}
			});

			// Calculating fixed logo width
			var fixed_logo_percentage_height = parseInt($logo.attr('data-fixed-height')),
				fixed_menu_height = parseInt($main_header.attr('data-fixed-height')),
				fixed_logo_height = fixed_menu_height * (fixed_logo_percentage_height / 100),
				initial_logo_width = parseInt($logo.attr('data-initial-width')),
				initial_logo_height = parseInt($logo.attr('data-initial-height')),
				fixed_logo_width = (initial_logo_width / initial_logo_height) * fixed_logo_height;

			$logo.attr({
				'data-fixed-width': fixed_logo_width
			});

			// Toggle primary nav logo image visibility
			formatted_value += "#main-header .logo { display: " + primary_nav_logo_image_visibility + " !important; }";

			// Add margin for mobile show menu button when logo is hidden
			if ( primary_nav_hide_logo_image ) {
				formatted_value +=
					"@media only screen and (max-width: 1025px) {" +
					"#et-mobile-navigation .show-menu-button { margin: 20px 0; }" +
					"}";
			}

			return formatted_value;
		}
	};

	// wp.customize( 'et_extra[page_width]', function( value ) {
	// 	value.bind( function( to ) {
	// 		var $customize_preview = top_$( "#customize-preview" );

	// 		if ( '100%' !== to ) {
	// 			$customize_preview.css({
	// 				width: to,
	// 				boxShadow: "0px -2px 10px #333",
	// 				left: 50
	// 			});
	// 		} else {
	// 			$customize_preview.css({
	// 				width: "100%",
	// 				boxShadow: "none",
	// 				left: 0
	// 			});
	// 		}
	// 	} );
	// } );

	function set_background_styles(color) {
		$('#extra-custom-background-css').remove();
		$('<style type="text/css" id="extra-custom-background-css"> body.custom-background { background-color: ' + color + '; } </style>').appendTo($('head'));
	}

	function set_boxed_background_styles(color) {
		$('#extra-dynamic-styles-boxed_layout_background_color').remove();
		$('<style type="text/css" id="extra-dynamic-styles-boxed_layout_background_color"> #page-container { background-color: ' + color + '; } </style>').appendTo($('head'));
	}

	wp.customize('background_color', function (value) {
		var background_color = value.get();

		value.bind(function (to) {
			background_color = to;

			set_background_styles(background_color);
		});
	});

	wp.customize('et_extra[boxed_layout_background_color]', function (value) {
		boxed_layout_background_color = value.get();

		value.bind(function (to) {
			boxed_layout_background_color = to;
		});
	});

	wp.customize('et_extra[hide_nav_until_scroll]', function (value) {
		value.bind(function (to) {
			var FixedNav = window.ET_App.FixedNav;

			if (to) {
				FixedNav.reApplyHideNav();
			} else {
				FixedNav.detachHideNav();
			}
		});
	});

	wp.customize('et_extra[boxed_layout]', function (value) {
		var $boxed_bg_control = top_$('#customize-control-et_extra-boxed_layout_background_color'),
			$boxed_bg_color = $boxed_bg_control.find('.color-picker-hex'),
			$background_color = top_$('#customize-control-background_color').find('.color-picker-hex');

		if (false === value.get()) {
			$boxed_bg_control.hide();
		}

		value.bind(function (to) {
			$('#extra-dynamic-styles-boxed_layout_background_color').remove();
			if (to) {
				$('body').addClass('boxed_layout');

				$boxed_bg_control.show();

				boxed_layout_background_color = changeHexColor($background_color.val(), 25);

				$boxed_bg_color.wpColorPicker('color', boxed_layout_background_color);
				$boxed_bg_color.wpColorPicker('defaultColor', boxed_layout_background_color);

				set_boxed_background_styles(boxed_layout_background_color);

			} else {
				$('body').removeClass('boxed_layout');

				$boxed_bg_control.hide();

				set_boxed_background_styles('transparent');
			}
		});
	});

	wp.customize('et_extra[header_style]', function (value) {
		value.bind(function (to) {
			$('#main-header .logo').css({
				'width': ''
			});
		});
	});

	wp.customize('show_on_front', function (value) {
		var $layout_options_control = top_$('#customize-control-show_on_front_layout');

		if ('layout' === value.get()) {
			$layout_options_control.show();
		} else {
			$layout_options_control.hide();
		}

	});


	wp.customize('et_extra[show_header_social_icons]', function (value) {
		value.bind(function (to) {
			search_only_state_transition();
		});
	});

	wp.customize('et_extra[show_header_search]', function (value) {
		value.bind(function (to) {
			search_only_state_transition();
		});
	});

	wp.customize('et_extra[show_header_trending]', function (value) {
		value.bind(function (to) {
			search_only_state_transition();
		});
	});

	wp.customize('et_extra[show_header_cart_total]', function (value) {
		value.bind(function (to) {
			search_only_state_transition();
		});
	});

	wp.customize('nav_menu_locations[secondary-menu]', function (value) {
		value.bind(function (to) {
			search_only_state_transition();
		});
	});

	// Update Extra modules' global color accent
	wp.customize('et_extra[accent_color]', function (value) {
		value.bind(function (to) {
			$('.no-term-color-module:not(.tabbed-post-module)').css({
				'border-top-color': to
			}).find('.module-head h1, .et-accent-color').css({
				'color': to
			});

			// Tabbed posts need special treatment
			$('.tabbed-post-module').each(function () {
				var tab_index = 1,
					$tabbed_post_module = $(this);

				$tabbed_post_module.find('.tabs li').each(function () {
					var $tabs_nav = $(this);


					// If the tab uses color accent, apply these changes
					if ($tabs_nav.hasClass('no-term-color-tab')) {
						$tabs_nav.data('term-color', to);

						// Update tab content
						$tabbed_post_module.find('.tab-content:nth-child(' + tab_index + ') .et-accent-color').css({
							'color': to
						});

						// Update tabbed posts module if the tab is active
						if ($tabs_nav.hasClass('active')) {
							$tabs_nav.css({
								'color': to
							});
							$tabbed_post_module.css({
								'border-top-color': to
							});
						}
					}

					tab_index++;
				});

			});
		});
	});

	(function () {
		$.each(EXTRA.social_networks, function (social_network_slug) {
			wp.customize('et_extra[' + social_network_slug + '_url]', function (value) {
				value.bind(function (to) {

					var $social_icons_header = $('#top-header ul.et-extra-social-icons'),
						$social_icons_footer = $('#footer ul.et-extra-social-icons'),
						$social_icon_header = $social_icons_header.find('.et-extra-social-icon.' + social_network_slug),
						$social_icon_footer = $social_icons_footer.find('.et-extra-social-icon.' + social_network_slug);

					if (to) {
						if ($social_icon_header.length > 0) {
							$social_icon_header.find("a").attr("href", to);
						} else {
							$social_icons_header.append('<li class="et-extra-social-icon ' + social_network_slug + '">' +
								'<a href="' + to + '" class="et-extra-icon et-extra-icon-background-hover et-extra-icon-' + social_network_slug + '"></a>' +
								'</li>');
						}

						if ($social_icon_footer.length > 0) {
							$social_icon_footer.find("a").attr("href", to);
						} else {
							$social_icons_footer.append('<li class="et-extra-social-icon ' + social_network_slug + '">' +
								'<a href="' + to + '" class="et-extra-icon et-extra-icon-background-hover et-extra-icon-' + social_network_slug + '"></a>' +
								'</li>');
						}
					} else {
						$social_icons_header.find('.et-extra-social-icon.' + social_network_slug).remove();
						$social_icons_footer.find('.et-extra-social-icon.' + social_network_slug).remove();
					}
				});
			});
		});
	})();

	(function () {
		$.each(EXTRA.settings, function (setting_name, setting_options) {

			wp.customize('et_extra[' + setting_name + ']', function (value) {

				var style = setting_options.value_bind.style,
					toggle_selector = setting_options.value_bind.selector,
					$toggle_selector = $(toggle_selector);

				if ('class_toggle' === style || 'class_toggle' === setting_options.value_bind.perform_toggle) {
					value.bind(function (to) {
						var toggle_class = setting_options.value_bind.class || setting_name,
							remove_class = '',
							before_action_callback_name = 'before_class_toggle_' + setting_name,
							choice;

						if ('function' === typeof class_toggle_callbacks[before_action_callback_name]) {
							var before_class_toggle_callback = class_toggle_callbacks[before_action_callback_name];

							before_class_toggle_callback();
						}

						if ('_value_bind_to_value' === toggle_class) {
							if ('undefined' !== typeof setting_options.value_bind.format) {
								toggle_class = setting_options.value_bind.format.replace(/%value%/gi, to);

								if ('object' === typeof setting_options.choices) {
									for (choice in setting_options.choices) {
										remove_class = remove_class + ' ' + setting_options.value_bind.format.replace(/%value%/gi, choice);
									}
								} else if ('range' === setting_options.type) {
									var range_min = setting_options.input_attrs.min,
										range_max = setting_options.input_attrs.max,
										range_step = setting_options.input_attrs.step,
										range_x = range_min;

									for (range_x; range_x <= range_max; range_x += range_step) {
										remove_class = remove_class + ' ' + setting_options.value_bind.format.replace(/%value%/gi, range_x);
									}
								}
							} else {
								toggle_class = to;

								if ('object' === typeof setting_options.choices) {
									for (choice in setting_options.choices) {
										remove_class = remove_class + ' ' + choice;
									}
								}
							}
						}

						if (to) {

							$toggle_selector.removeClass($toggle_selector.data('class_toggle_' + setting_name));
							$toggle_selector.removeClass(remove_class);

							$toggle_selector.addClass(toggle_class);

							$toggle_selector.data('clazss_toggle_' + setting_name, toggle_class);
						} else {
							$toggle_selector.removeClass(toggle_class);
						}
					});
				}

				if ('el_toggle' === style) {
					value.bind(function (to) {
						if (to) {
							$toggle_selector.show();
						} else {
							$toggle_selector.hide();
						}
					});
				}

				if ('el_toggle_reverse' === style) {
					value.bind(function (to) {
						if (to) {
							$toggle_selector.hide();
						} else {
							$toggle_selector.show();
						}
					});
				}

				if ('dynamic_selectors_shared_paramless_callback' === style) {
					value.bind(function (to) {
						$.each(setting_options.value_bind.property_selectors, function (property, property_selectors) {
							var value_format_callback = setting_options.value_bind.value_format_callback,
								property_style_id = 'extra-dynamic-styles-' + value_format_callback,
								formatted_value;

							var set_formatted_value_styles = function (formatted_value) {
								set_dynamic_style_el(property_style_id, formatted_value);
							};

							if ('function' === typeof shared_paramless_callbacks[setting_options.value_bind.value_format_callback]) {

								var shared_paramless_callback = shared_paramless_callbacks[setting_options.value_bind.value_format_callback];

								formatted_value = shared_paramless_callback();

								set_formatted_value_styles(formatted_value);

							} else {
								// Populate all customizer options
								var all_options = {};

								_.each(wp.customize._value, function (element, index) {
									all_options[index] = wp.customize.value(index)();
								});

								$.ajax({
									type: "POST",
									url: EXTRA.ajaxurl,
									data: {
										action: 'extra_customizer_value_formatted_property_selector',
										extra_customizer_nonce: EXTRA.extra_customizer_nonce,
										unformatted_value: JSON.stringify(all_options),
										setting_name: setting_name,
										property: property,
										callback: setting_options.value_bind.value_format_callback,
										style: style
									},
									success: function (formatted_value) {
										set_formatted_value_styles(formatted_value);
									}
								});
							}
						});
					});
				}

				if ('dynamic_selectors_value_format_callback' === style) {
					value.bind(function (to) {
						$.each(setting_options.value_bind.property_selectors, function (property, property_selectors) {
							var unformatted_value = to,
								property_style_id = 'extra-dynamic-styles-' + setting_name + '-' + property,
								css = '',
								formatted_value;

							if ('undefined' === typeof setting_options.value_bind.use_formatted_value_as_css_expression) {
								property_selectors = property_selectors.join(",\n");
							}

							var set_formatted_value_styles = function (formatted_value) {

								if ('undefined' !== typeof setting_options.value_bind.use_formatted_value_as_css_expression) {
									css = formatted_value;
								} else if ('undefined' !== typeof setting_options.value_bind.use_only_formatted_value) {
									css = dynamic_selector_css(property_selectors, formatted_value);
								} else {
									css = dynamic_selector_css(property_selectors, formatted_value, property);
								}

								set_dynamic_style_el(property_style_id, css);
							};

							if ('function' === typeof value_bind_callbacks[setting_options.value_bind.value_format_callback]) {

								var value_bind_callback = value_bind_callbacks[setting_options.value_bind.value_format_callback];

								formatted_value = value_bind_callback(setting_name, property, unformatted_value, setting_options);

								set_formatted_value_styles(formatted_value);

							} else {
								$.ajax({
									type: "POST",
									url: EXTRA.ajaxurl,
									data: {
										action: 'extra_customizer_value_formatted_property_selector',
										extra_customizer_nonce: EXTRA.extra_customizer_nonce,
										unformatted_value: unformatted_value,
										setting_name: setting_name,
										property: property,
										callback: setting_options.value_bind.value_format_callback,
										style: style
									},
									success: function (formatted_value) {
										set_formatted_value_styles(formatted_value);
									}
								});
							}
						});
					});
				}

				if ('dynamic_selectors_value_format' === style) {
					value.bind(function (to) {
						$.each(setting_options.value_bind.property_selectors, function (property, property_options) {
							var property_selectors = property_options.selectors.join(",\n"),
								css_property = property_options.property,
								property_style_id = 'extra-dynamic-styles-' + setting_name + '-' + css_property,
								formatted_value = to,
								css = '';

							if ('undefined' !== typeof property_options.format) {
								formatted_value = property_options.format.replace(/%value%/gi, to);
							}

							if ('undefined' !== typeof setting_options.value_bind.use_only_formatted_value) {
								css = dynamic_selector_css(property_selectors, formatted_value);
							} else {
								css = dynamic_selector_css(property_selectors, formatted_value, css_property);
							}

							set_dynamic_style_el(property_style_id, css);

						});
					});
				}

				if ('dynamic_selectors' === style) {
					value.bind(function (to) {
						$.each(setting_options.value_bind.property_selectors, function (property, property_selectors) {
							var property_style_id = 'extra-dynamic-styles-' + setting_name + '-' + property,
								css = '';

							property_selectors = property_selectors.join(",\n");
							css = dynamic_selector_css(property_selectors, to, property);
							set_dynamic_style_el(property_style_id, css);
						});
					});
				}

			});
		});
	})();

	function set_dynamic_style_el(style_id, css) {
		var $dynamic_style = $("#" + style_id);

		$dynamic_style.remove();

		if ('undefined' !== typeof css) {
			$dynamic_style = $('<style type="text/css" id="' + style_id + '">' + "\n" + css + '</style>').appendTo($('head'));
		}
	}

	function dynamic_selector_css(property_selectors, value, css_property) {
		var css_expression;

		if ('undefined' === typeof value) {
			return;
		}

		if ('undefined' !== typeof css_property) {
			css_expression = css_property + ': ' + value + ';';
		} else {
			css_expression = value;
		}

		if (css_expression.length > 0) {
			return property_selectors + ' {' + "\n\t" + css_expression + "\n" + '} ' + "\n\n";
		}
	}

	function search_only_state_transition() {

		var $top_header = $('#top-header'),
			$top_header_search = $top_header.find('.et-top-search'),
			$primary_nav_search = $('#et-navigation .menu-item.et-top-search-primary-menu-item'),
			$primary_nav_cart = $('#et-navigation .menu-item.et-cart-info-primary-menu-item'),
			show_search_bar = wp.customize.value('et_extra[show_header_search]')(),
			show_social_icons = wp.customize.value('et_extra[show_header_social_icons]')(),
			show_trending_bar = wp.customize.value('et_extra[show_header_trending]')(),
			show_cart = wp.customize.has('et_extra[show_header_cart_total]') ? wp.customize.value('et_extra[show_header_cart_total]')() : false,
			secondary_menu = parseInt(wp.customize.value('nav_menu_locations[secondary-menu]')());

		if ((!show_cart || !show_search_bar) && !show_social_icons && !show_trending_bar && secondary_menu === 0) {
			$top_header.hide();

			if (show_search_bar) {
				$primary_nav_search.show();
				$primary_nav_cart.hide();
			} else if (show_cart) {
				$primary_nav_cart.show();
				$primary_nav_search.hide();
			} else {
				$primary_nav_cart.hide();
				$primary_nav_search.hide();
			}
		} else {
			$top_header.show();
			$primary_nav_cart.hide();
			$primary_nav_search.hide();

			if (show_search_bar) {
				$top_header_search.show();
			} else {
				$top_header_search.hide();
			}
		}
	}

})(jQuery, window.top.jQuery, EXTRA);
