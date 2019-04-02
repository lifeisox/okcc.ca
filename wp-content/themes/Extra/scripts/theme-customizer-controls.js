(function ($) {
	var api = wp.customize,
		ET_Google_Fonts,
		ET_Select_Image = function (element, options) {
			this.element = element;
			this.custom_select_link = null;
			this.custom_dropdown = null;
			this.frontend_customizer = $('body').hasClass('et_frontend_customizer') ? true : false;

			this.options = jQuery.extend({}, this.defaults, options);

			this.create_dropdown();
		};

	api.ET_ColorAlphaControl = api.Control.extend({
		ready: function () {
			var control = this,
				picker = control.container.find('.color-picker-hex');

			picker.val(control.setting()).wpColorPicker({
				change: function () {
					var et_color_picker_value = picker.wpColorPicker('color');

					if ('' !== et_color_picker_value) {
						try {
							control.setting.set(et_color_picker_value.toLowerCase());

						} catch (err) {
							// Value is not a properly formatted color, let's see if we can fix it.

							if (/^[\da-z]{3}([\da-z]{3})?$/i.test(et_color_picker_value)) {
								// Value looks like a hex color but is missing hash character.
								et_color_picker_value = '#' + et_color_picker_value.toLowerCase();

								control.setting.set(et_color_picker_value);
							}
						}
					}
				},
				clear: function () {
					control.setting.set(false);
				}
			});

			control.setting.bind(function (value) {
				picker.val(value);
				picker.wpColorPicker('color', value);
			});

			// todo, this is divi'ified :(
			// /**
			// * Adding following event whenever footer_menu_text_color is changed, due to its relationship with footer_menu_active_link_color.
			// */
			// if ( 'et_divi[footer_menu_text_color]' === this.id ) {

			// 	// Whenever user change footer_menu_text_color, do the following
			// 	this.setting.bind( 'change', function( value ){

			// 		// Set footer_menu_active_link_color equal to the newly changed footer_menu_text_color
			// 		api( 'et_divi[footer_menu_active_link_color]' ).set( value );

			// 		// Update default color of footer_menu_active_link_color equal to the newly changed footer_menu_text_color.
			// 		// If afterward user change the color and not happy with it, they can click reset and back to footer_menu_text_color color
			// 		api.control( 'et_divi[footer_menu_active_link_color]' ).container.find( '.color-picker-hex' )
			// 			.data( 'data-default-color', value )
			// 			.wpColorPicker({ 'defaultColor' : value, 'color' : value });
			// 	});
			// }
		}
	});

	api.controlConstructor.et_coloralpha = api.ET_ColorAlphaControl;


	ET_Google_Fonts = function (element, options) {
		this.element = element;
		this.custom_select_link = null;
		this.custom_dropdown = null;
		this.frontend_customizer = $('body').hasClass('et_frontend_customizer') ? true : false;

		this.options = jQuery.extend({}, this.defaults, options);

		this.unique_id = this.element.find('');

		this.create_dropdown();
	};

	ET_Google_Fonts.prototype = {
		defaults: {
			apply_font_to: 'body',
			// unique_id		: 'et_body_font'
		},

		create_dropdown: function () {
			var $et_google_font_main_select = this.element,
				et_filter_options_html = '',
				$selected_option,
				$dropdown_selected_option,
				self = this;

			$et_google_font_main_select.hide().addClass('et_google_font_main_select');

			$et_google_font_main_select.change($.proxy(self.change_font, self));

			$et_google_font_main_select.find('option').each(function () {
				var $this_option = $(this),
					selected = $(this).is(':selected') ? ' class="et_google_font_active"' : '',
					data_parent = typeof $this_option.data('parent_font') !== 'undefined' && '' !== $this_option.data('parent_font') ? ' data-parent_font="' + $this_option.data('parent_font') + '"' : '';

				et_filter_options_html += '<li class="' + self.fontname_to_class($this_option.text()) + '" data-value="' + $this_option.attr('value') + '"' + data_parent + selected + '>' + $this_option.text() + '</li>';
			});

			$et_google_font_main_select.after('<a href="#" class="et_google_font_custom_select">' + '<span class="et_filter_text"></span>' + '</a>' + '<ul class="et_google_font_options">' + et_filter_options_html + '</ul>');

			this.custom_select_link = $et_google_font_main_select.next('.et_google_font_custom_select');

			this.custom_dropdown = this.custom_select_link.next('.et_google_font_options');

			$selected_option = $et_google_font_main_select.find(':selected');

			if ( $selected_option.length < 1 ) {
 				$selected_option = $et_google_font_main_select.find( 'option[value="none"]' );
 			}

			if ($selected_option.length) {
				this.custom_select_link.find('.et_filter_text').text($selected_option.text());

				$dropdown_selected_option = ($selected_option.val() === 'none') ? this.custom_dropdown.find('li').eq(0) : this.custom_dropdown.find('li[data-value="' + $selected_option.text() + '"]');

				this.custom_select_link.find('.et_filter_text').addClass($dropdown_selected_option.attr('class')).attr('data-gf-class', $dropdown_selected_option.attr('class'));

				$dropdown_selected_option.addClass('et_google_font_active');
			}

			this.custom_select_link.click($.proxy(self.open_dropdown, self));

			this.custom_dropdown.find('li').click($.proxy(self.select_option, self));
		},

		open_dropdown: function (event) {
			var self = this,
				$this_link = $(event.target);

			if (self.custom_dropdown.hasClass('et_google_font_open')) {
				return false;
			}

			self.custom_dropdown.show().addClass('et_google_font_open');

			$this_link.hide();

			return false;
		},

		select_option: function (event) {
			var self = this,
				$this_option = $(event.target),
				this_option_value = $this_option.text(),
				$main_text = self.custom_select_link.find('.et_filter_text'),
				$main_select_active_element = self.element.find('option[value="' + this_option_value + '"]'),
				main_text_gf_class = $main_text.attr('data-gf-class');

			if ($this_option.hasClass('et_google_font_active')) {
				self.close_dropdown();

				return false;
			}

			$main_text.html( this_option_value );
			
			$this_option.siblings().removeClass('et_google_font_active');

			$main_text.removeClass(main_text_gf_class).addClass($this_option.attr('class')).attr('data-gf-class', $this_option.attr('class'));

			$this_option.addClass('et_google_font_active');

			self.close_dropdown();

			if (!$main_select_active_element.length) {
				self.element.val('none').trigger('change');
			} else {
				self.element.val(this_option_value).trigger('change');
			}

			return false;
		},

		close_dropdown: function () {
			this.custom_select_link.find('.et_filter_text').show();
			this.custom_dropdown.hide().removeClass('et_google_font_open');
		},

		maybe_request_font: function (font_name, font_option) {
			if (font_option.val() === 'none') {
				return;
			}
			var $head = this.frontend_customizer ? $('head') : $( "#customize-preview iframe" ).contents().find('head');
			var font_class = this.fontname_to_class( font_name );

			// process custom user fonts
			if ( typeof extra_customizer_control_params.user_fonts !== 'undefined' && typeof extra_customizer_control_params.user_fonts[ font_name ] !== 'undefined' ) {
				if ( $head.find( 'style#' + font_class ).length ) {
					return;
				}

				$head.append( '<style id="' + font_class + '">@font-face{font-family:"' + font_name + '"; src: url(' + extra_customizer_control_params.user_fonts[ font_name ].font_url + ');}</style>' );

				return;
			}

			var font_styles = typeof font_option.data('parent_styles') !== 'undefined' && '' !== font_option.data('parent_styles') ? ':' + font_option.data('parent_styles') : '',
				subset = typeof font_option.data('parent_subset') !== 'undefined' && '' !== font_option.data('parent_subset') ? '&' + subset : '';

			if ( $head.find( 'link#' + font_class ).length ) {
				return;
			}

			$head.append( '<link id="' + font_class + '" href="//fonts.googleapis.com/css?family=' + this.convert_to_google_font_name( font_name ) + font_styles + subset + '" rel="stylesheet" type="text/css" />' );
		},

		// apply_font: function( font_name, font_option ) {
		// 	var $head = this.frontend_customizer ? $('head') : $( "#customize-preview iframe" ).contents().find('head'),
		// 		font_weight = '';

		// 	$head.find( 'style.' + this.options.unique_id ).remove();

		// 	if ( font_option.val() === 'none' )
		// 		return;

		// 	font_weight = typeof font_option.data( 'parent_font' ) !== 'undefined' && '' !== font_option.data( 'parent_font' ) ? 'font-weight:' + font_option.data( 'current_styles' ) : '';

		// 		$head.append( '<style class="' + this.options.unique_id + '">' + this.options.apply_font_to + ' { font-family: "' + font_name + '", sans-serif; ' + font_weight + ' } </style>' );
		// },

		change_font: function () {
			var self = this,
				$active_option = self.element.find('option:selected'),
				active_option_value = $active_option.val(),
				active_option_name = typeof $active_option.data('parent_font') !== 'undefined' && '' !== $active_option.data('parent_font') ? $active_option.data('parent_font') : $active_option.val(),
				$this_option = this.custom_dropdown.find('li[data-value="' + active_option_value + '"]'),
				$main_text = self.custom_select_link.find('.et_filter_text'),
				main_text_gf_class = $main_text.attr('data-gf-class');

			self.maybe_request_font(active_option_name, $active_option);
			// self.apply_font( active_option_name, $active_option );

			// set correct custom dropdown values on first load
			if (this.custom_dropdown.find('li.et_google_font_active').data('value') !== active_option_value) {
				this.custom_dropdown.find('li').removeClass('et_google_font_active');
				$main_text.removeClass(main_text_gf_class).addClass($this_option.attr('class')).attr('data-gf-class', $this_option.attr('class'));

				$this_option.addClass('et_google_font_active');
			}
		},

		convert_to_google_font_name: function (font_name) {
			return font_name.replace(/ /g, '+');
		},

		fontname_to_class: function (option_value) {
			return 'et_gf_' + option_value.replace(/ /g, '_').toLowerCase();
		}
	};

	$.fn.et_google_fonts = function (options) {
		new ET_Google_Fonts(this, options);
		return this;
	};

	ET_Select_Image.prototype = {
		defaults: {
			apply_value_to: 'body'
		},

		create_dropdown: function () {
			var $et_select_image_main_select = this.element,
				et_filter_options_html = '',
				$selected_option,
				$dropdown_selected_option,
				self = this;

			if ($et_select_image_main_select.length) {
				$et_select_image_main_select.hide().addClass('et_select_image_main_select');

				$et_select_image_main_select.change($.proxy(self.change_option, self));

				$et_select_image_main_select.find('option').each(function () {
					var $this_option = $(this),
						selected = $(this).is(':selected') ? ' class="et_select_image_active"' : '',
						option_class = 0 === $this_option.attr('value').indexOf('_') ? $this_option.attr('value') : '_' + $this_option.attr('value');

					et_filter_options_html += '<li class="et_si' + option_class + '_column" data-value="' + $this_option.attr('value') + '"' + selected + '>' + $this_option.text() + '</li>';
				});

				$et_select_image_main_select.after('<a href="#" class="et_select_image_custom_select">' + '<span class="et_filter_text"></span>' + '</a>' + '<ul class="et_select_image_options ' + self.esc_classname($et_select_image_main_select.attr('data-customize-setting-link')) + '">' + et_filter_options_html + '</ul>');
			}

			this.custom_select_link = $et_select_image_main_select.next('.et_select_image_custom_select');

			this.custom_dropdown = this.custom_select_link.next('.et_select_image_options');

			$selected_option = $et_select_image_main_select.find(':selected');

			if ($selected_option.length) {
				var selected_option_class = 0 === $selected_option.attr('value').indexOf('_') ? $selected_option.attr('value') : '_' + $selected_option.attr('value');
				this.custom_select_link.find('.et_filter_text').text($selected_option.text()).addClass('et_si' + selected_option_class + '_column');

				$dropdown_selected_option = ($selected_option.val() === 'none') ? this.custom_dropdown.find('li').eq(0) : this.custom_dropdown.find('li[data-value="' + $selected_option.text() + '"]');

				this.custom_select_link.find('.et_filter_text').addClass($dropdown_selected_option.attr('class')).attr('data-si-class', $dropdown_selected_option.attr('class'));

				$dropdown_selected_option.addClass('et_select_image_active');
			}

			this.custom_select_link.click($.proxy(self.open_dropdown, self));

			this.custom_dropdown.find('li').click($.proxy(self.select_option, self));
		},

		open_dropdown: function (event) {
			var self = this,
				$this_link = $(event.target);

			if (self.custom_dropdown.hasClass('et_select_image_open')) {
				return false;
			}

			self.custom_dropdown.show().addClass('et_select_image_open');

			$this_link.hide();

			return false;
		},

		select_option: function (event) {
			var self = this,
				$this_option = $(event.target),
				this_option_value = $this_option.attr('data-value'),
				$main_text = self.custom_select_link.find('.et_filter_text'),
				$main_select_active_element = self.element.find('option[value="' + this_option_value + '"]');

			if ($this_option.hasClass('et_select_image_active')) {
				self.close_dropdown();

				return false;
			}

			$this_option.siblings().removeClass('et_select_image_active');

			$main_text.removeClass(function (index, css) {
				return (css.match(/\bet_si_\S+/g) || []).join(' ');
			});

			$main_text.addClass($this_option.attr('class')).attr('data-si-class', $this_option.attr('class'));

			$this_option.addClass('et_select_image_active');

			self.close_dropdown();

			if (!$main_select_active_element.length) {
				self.element.val('none').trigger('change');
			} else {
				self.element.val(this_option_value).trigger('change');
			}

			return false;
		},

		close_dropdown: function () {
			this.custom_select_link.find('.et_filter_text').show();
			this.custom_dropdown.hide().removeClass('et_select_image_open');
		},

		change_option: function () {
			var self = this,
				$active_option = self.element.find('option:selected'),
				active_option_value = $active_option.val(),
				$this_option = this.custom_dropdown.find('li[data-value="' + active_option_value + '"]'),
				$main_text = self.custom_select_link.find('.et_filter_text'),
				main_text_si_class = $main_text.attr('data-si-class');

			// set correct custom dropdown values on first load
			if (this.custom_dropdown.find('li.et_select_image_active').data('value') !== active_option_value) {
				this.custom_dropdown.find('li').removeClass('et_select_image_active');
				$main_text.removeClass(main_text_si_class).addClass($this_option.attr('class')).attr('data-si-class', $this_option.attr('class'));

				$this_option.addClass('et_select_image_active');
			}
		},

		esc_classname: function (option_value) {
			return 'et_si_' + option_value.replace(/[ +\/\[\]]/g, '_').toLowerCase();
		}
	};

	$.fn.et_select_image = function (options) {
		new ET_Select_Image(this, options);
		return this;
	};

	$('body').on('click', '.et_font_icon li', function () {
		var $this_el = $(this),
			$this_input;

		if (!$this_el.hasClass('active')) {
			$('.et_font_icon li').removeClass('et_active');
			$this_el.addClass('et_active');

			$this_input = $this_el.closest('label').find('.et_selected_icon');
			$this_input.val($this_el.data('icon'));
			$this_input.change();
		}
	});

	$(document).ready(function () {
		$('select.et-font-select-control').each(function () {
			$(this).et_google_fonts();
		});

		$('select[data-customize-setting-link="et_extra[footer_columns]"]').et_select_image({
			apply_value_to: 'body'
		}).change(function () {
			var $select = $(this),
				footer_columns = $select.find('option:selected').val(),
				column_count;

			// Determine column count
			switch (footer_columns) {
			case '4':
				column_count = 4;
				break;

			case '3':
			case '1_4__1_4__1_2':
			case '1_2__1_4__1_4':
			case '1_4__1_2__1_4':
				column_count = 3;
				break;

			case '1':
				column_count = 1;
				break;

			default:
				column_count = 2;
				break;
			}

			// Update column name
			_.each(_.range(4), function (index) {
				var num = index + 1;
				$('#accordion-section-sidebar-widgets-sidebar-footer-' + num + ' > .accordion-section-title').text(extra_customizer_control_params.footer_sidebar_names['column-' + column_count][index]);
			});
		});

		$('.et_divi_reset_slider').click(function () {
			var $this_input = $(this).closest('label').find('input'),
				input_default = $this_input.data('reset_value');

			$this_input.val(input_default);
			$this_input.change();
		});

		$('.control-panel-back').click(function () {
			var $iframe_preview = $('#customize-preview');
			$iframe_preview.removeClass('et_divi_phone et_divi_tablet');
		});

		$('input[type=range]').on('mousedown', function () {
			var $range = $(this),
				$range_input = $range.parent().children('.et-pb-range-input');

			value = $(this).attr('value');
			$range_input.val(value);

			$(this).mousemove(function () {
				value = $(this).attr('value');
				$range_input.val(value);
			});
		});

		var et_range_input_number_timeout;

		function et_autocorrect_range_input_number(input_number, timeout) {
			var $range_input = input_number,
				$range = $range_input.parent().find('input[type="range"]'),
				value = parseFloat($range_input.val()),
				reset = parseFloat($range.attr('data-reset_value')),
				step = parseFloat($range_input.attr('step')),
				min = parseFloat($range_input.attr('min')),
				max = parseFloat($range_input.attr('max'));

			clearTimeout(et_range_input_number_timeout);

			et_range_input_number_timeout = setTimeout(function () {
				if (isNaN(value)) {
					$range_input.val(reset);
					$range.val(reset).trigger('change');
					return;
				}

				if (step >= 1 && value % 1 !== 0) {
					value = Math.round(value);
					$range_input.val(value);
					$range.val(value);
				}

				if (value > max) {
					$range_input.val(max);
					$range.val(max).trigger('change');
				}

				if (value < min) {
					$range_input.val(min);
					$range.val(min).trigger('change');
				}
			}, timeout);

			$range.val(value).trigger('change');
		}

		$('input.et-pb-range-input').on('change keyup', function () {
			et_autocorrect_range_input_number($(this), 1000);
		}).on('focusout', function () {
			et_autocorrect_range_input_number($(this), 0);
		});

		$('input.et_font_style_checkbox[type=checkbox]').on('change', function () {
			var $this_el = $(this),
				$main_option = $this_el.closest('span').siblings('input.et_font_styles'),
				value = $this_el.val(),
				current_value = $main_option.val(),
				values = (current_value !== false) ? current_value.split('|') : [],
				query = $.inArray(value, values),
				result = '';

			if ($this_el.prop('checked') === true) {

				if (current_value.length) {

					if (query < 0) {
						values.push(value);

						result = values.join('|');
					}
				} else {
					result = value;
				}
			} else {

				if (current_value.length !== 0) {

					if (query >= 0) {
						values.splice(query, 1);

						result = values.join('|');
					} else {
						result = current_value;
					}
				}
			}

			$main_option.val(result).trigger('change');
		});

		$('span.et_font_style').click(function () {
			var style_checkbox = $(this).find('input');

			$(this).toggleClass('et_font_style_checked');

			if (style_checkbox.is(':checked')) {
				style_checkbox.prop('checked', false);
			} else {
				style_checkbox.prop('checked', true);
			}

			style_checkbox.change();
		});

		// $('#customize-theme-controls').on( 'change', '#customize-control-et_divi-vertical_nav input[type=checkbox]', function(){
		// 	$input = $(this);

		// 	if ( $input.is(':checked') ) {
		// 		$nav_fullwidth_control.hide();
		// 	} else {
		// 		$nav_fullwidth_control.show();
		// 	}
		// });

		/**
		 * Conditionally toggle primary nav logo height, fixed nav hide logo image, and fixed nav logo height
		 */
		var $primary_nav_hide_logo_image = $('#customize-control-et_extra-primary_nav_hide_logo_image'),
			$primary_nav_logo_height = $('#customize-control-et_extra-primary_nav_logo_height'),
			$fixed_nav_hide_logo_image = $('#customize-control-et_extra-fixed_nav_hide_logo_image'),
			$fixed_nav_logo_height = $('#customize-control-et_extra-fixed_nav_logo_height'),
			primary_nav_hide_logo_image_checked = $primary_nav_hide_logo_image.find('input[type="checkbox"]').is(':checked'),
			fixed_nav_hide_logo_image_checked = $fixed_nav_hide_logo_image.find('input[type="checkbox"]').is(':checked'),
			fixed_nav_logo_height_visibility = primary_nav_hide_logo_image_checked || fixed_nav_hide_logo_image_checked;

		function et_toggle_field_item( toggle, $el ) {
			if (toggle) {
				$el.hide();
			} else {
				$el.show();
			}
		}

		// Toggle fields on page load
		et_toggle_field_item(primary_nav_hide_logo_image_checked, $primary_nav_logo_height);
		et_toggle_field_item(primary_nav_hide_logo_image_checked, $fixed_nav_hide_logo_image);
		et_toggle_field_item(fixed_nav_logo_height_visibility, $fixed_nav_logo_height);

		// Toggle fields when primary nav's Hide Logo Image is checked/unchecked
		$primary_nav_hide_logo_image.on('change', 'input[type="checkbox"]', function() {
			var checked = $(this).is(':checked'),
				fixed_nav_hide_logo_image_checked = $fixed_nav_hide_logo_image.find('input[type="checkbox"]').is(':checked'); // redeclared to get latest value

			et_toggle_field_item(checked, $primary_nav_logo_height);
			et_toggle_field_item(checked, $fixed_nav_hide_logo_image);
			et_toggle_field_item((checked || fixed_nav_hide_logo_image_checked), $fixed_nav_logo_height);
		});

		// Toggle fields when fixed nav's Hide Logo Image is checked/unchecked
		$fixed_nav_hide_logo_image.on('change', 'input[type="checkbox"]', function() {
			var checked = $(this).is(':checked'),
				primary_nav_hide_logo_image_checked = $primary_nav_hide_logo_image.find('input[type="checkbox"]').is(':checked');

			et_toggle_field_item((checked || primary_nav_hide_logo_image_checked), $fixed_nav_logo_height);
		});
	});

	$(window).load(function () {
		if ($('.et_font_icon').length) {
			$('.et_font_icon').each(function () {
				var $this_el = $(this),
					this_input_val = $this_el.closest('label').find('.et_selected_icon').val();
				$this_el.find('li[data-icon="' + this_input_val + '"]').addClass('et_active');
			});
		}
	});

	if (typeof window.location.search !== 'undefined' && window.location.search.search('et_customizer_option_set=module') !== -1) {
		$('body').addClass('et_modules_customizer_option_set');
	} else {
		$('body').addClass('et_theme_customizer_option_set');
	}

})(jQuery);
