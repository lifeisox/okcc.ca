<?php
// Prevent file from being loaded directly
if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}

define( 'EXTRA_HOME_LAYOUT_META_KEY', '_extra_layout_home' );
define( 'EXTRA_DEFAULT_LAYOUT_META_KEY', '_extra_layout_default' );

function extra_et_builder_post_types( $post_types ){
	return array_merge( $post_types, array(
		EXTRA_LAYOUT_POST_TYPE,
	) );
}

add_filter( 'et_builder_post_types', 'extra_et_builder_post_types' );

function extra_et_builder_always_enabled( $bool, $post_type, $post ) {
	if ( EXTRA_LAYOUT_POST_TYPE == $post_type ) {
		$bool = true;
	}
	return $bool;
}

add_filter( 'et_builder_always_enabled', 'extra_et_builder_always_enabled', 10, 3 );

function extra_et_builder_row_settings_controls( $output ) {
	global $typenow;

	if ( 'layout' == $typenow ) {
		$output = str_replace( '<a href="#" class="et-pb-settings et-pb-settings-row"><span>Settings</span></a>', '', $output );

	}
	return $output;
}

add_filter( 'et_builder_row_settings_controls', 'extra_et_builder_row_settings_controls' );

function extra_text_module_post_types( $post_types, $module_slug ) {
	if ( 'et_builder_text' == $module_slug ) {
		$post_types = array(
			EXTRA_LAYOUT_POST_TYPE,
			'post',
		);
	}

	return $post_types;
}

add_filter( 'et_builder_module_post_types', 'extra_text_module_post_types', 10, 2 );

function extra_text_module_layout_classes( $classes ) {
	if ( !is_singular( 'post' ) ) {
		$classes[] = 'boxy';
	}

	return $classes;
}

add_filter( 'et_builder_module_classes_et_builder_text', 'extra_text_module_layout_classes' );

function extra_text_module_layout_fields( $fields ) {
	global $post;

	if ( EXTRA_LAYOUT_POST_TYPE == $post->post_type ) {

		$fields_to_remove = array(
			'use_background_color',
			'background_color',
			'background_image',
			'dropcap',
			'breakout',
		);

		foreach ($fields as $field_key => $field) {
			if ( in_array( $field_key, $fields_to_remove ) ) {
				unset( $fields[$field_key] );
			}
		}
	}

	return $fields;
}

add_filter( 'et_builder_module_fields_et_builder_text', 'extra_text_module_layout_fields' );

function extra_text_module_layout_border_field( $field ) {
	global $post;

	if ( EXTRA_LAYOUT_POST_TYPE == $post->post_type ) {
		$field['label'] = esc_html__( 'Show Top Border?', 'extra' );

		$field['options'] = array(
			'none' => esc_html__( 'No', 'extra' ),
			'top'  => esc_html__( 'Yes', 'extra' ),
		);

		$field['description'] = esc_html__( 'This will add a border to the top side of the module.', 'extra' );
	}
	return $field;
}

add_filter( 'et_builder_module_fields_et_builder_text_field_border', 'extra_text_module_layout_border_field' );

/**
 * Modify blog feed standard & masonry's read more button border width default value
 * @param array $fields field variables
 * @return array modified field variables
 */
function extra_blog_feed_read_more_border_width_field( $field ) {
	global $post;

	$field['default'] = 0;

	return $field;
}
add_filter( 'et_builder_module_fields_et_pb_posts_blog_feed_standard_field_read_more_border_width', 'extra_blog_feed_read_more_border_width_field' );
add_filter( 'et_builder_module_fields_et_pb_posts_blog_feed_masonry_field_read_more_border_width', 'extra_blog_feed_read_more_border_width_field' );

function extra_get_layouts( $args = array() ) {
	$default_args = array(
		'post_type' => EXTRA_LAYOUT_POST_TYPE,
	);

	$args = wp_parse_args( $args, $default_args );

	return new WP_Query( $args );
}

function extra_home_layout() {
	global $et_builder_post_type;
	$et_builder_post_type = EXTRA_LAYOUT_POST_TYPE;

	extra_processing_category_layout( true );
	$layout = extra_get_home_layout();
	$layout = wpautop( $layout );
	echo do_shortcode( et_pb_fix_shortcodes( $layout ) );
	extra_processing_category_layout( false );
}

function _et_extra_get_home_layout() {
	global $wp_customize;

	$args = array(
		'meta_key'       => EXTRA_HOME_LAYOUT_META_KEY,
		'meta_value'     => 1,
		'posts_per_page' => 1,
	);

	if ( extra_is_customizer_request() ) {
		$show_on_front_layout = $wp_customize->get_setting( 'show_on_front_layout' )->post_value();
		if ( !empty( $show_on_front_layout ) ) {
			$args = array(
				'post__in' => array( $show_on_front_layout ),
			);
		}
	}

	$layouts = extra_get_layouts( $args );

	return !empty( $layouts->posts ) ? $layouts->posts[0] : false;
}

// filters the page id for Divi Builder settings to apply them correctly on homepage
function et_pb_set_home_page_id() {
	$layout_id = extra_get_home_layout_id();

	return $layout_id;
}

// filters the page id for Divi Builder settings to apply them correctly on tax pages
function et_pb_set_tax_page_id() {
	$layout_id = extra_get_tax_layout_id();

	return $layout_id;
}

function extra_get_home_layout() {
	// add filter to define the correct page id in Page Builder Settings
	add_filter( 'et_pb_page_id_custom_css', 'et_pb_set_home_page_id' );
	return ( $layout = _et_extra_get_home_layout() ) ? $layout->post_content : extra_default_layout();
}

function extra_get_home_layout_id() {
	return ( $layout = _et_extra_get_home_layout() ) ? $layout->ID : extra_get_default_layout_id();
}

function extra_modify_archive_query( $post_id ) {
	if ( is_home() ) {
		$home_layout_id = extra_get_home_layout_id();

		if ( $home_layout_id ) {
			return $home_layout_id;
		}
	}

	if ( ( is_category() || is_tag() ) ) {
		$layout_id = extra_get_tax_layout_id();

		if ( $layout_id ) {
			return $layout_id;
		}
	}

	return $post_id;
}
add_filter( 'et_is_ab_testing_active_post_id', 'extra_modify_archive_query' );

function _extra_get_default_layout() {
	$args = array(
		'meta_key'       => EXTRA_DEFAULT_LAYOUT_META_KEY,
		'meta_value'     => 1,
		'posts_per_page' => 1,
	);

	$layouts = extra_get_layouts( $args );

	if ( !empty( $layouts->posts ) ) {
		return $layouts->posts[0];
	} else {
		return false;
	}
}

function extra_get_default_layout_id() {
	return ( $layout = _extra_get_default_layout() ) ? $layout->ID : false;
}

function extra_default_layout() {
	return ( $layout = _extra_get_default_layout() ) ? $layout->post_content : '';
}

function extra_tax_layout() {
	$layout = extra_get_tax_layout();
	if ( !empty( $layout ) ) {
		// add filter to define the correct page id in Page Builder Settings
		add_filter( 'et_pb_page_id_custom_css', 'et_pb_set_tax_page_id' );
		extra_processing_category_layout( true );
		$layout = wpautop( $layout );
		echo do_shortcode( et_pb_fix_shortcodes( $layout ) );
		extra_processing_category_layout( false );
	} else {
		require locate_template( 'index-content.php' );
	}
}

function is_extra_tax_layout() {
	$is_extra_tax_layout = is_category() || is_tag();

	return apply_filters( 'is_extra_tax_layout', $is_extra_tax_layout );
}

function _et_extra_get_tax_layout() {
	$args = array(
		'posts_per_page' => 1,
	);

	if ( is_category() ) {
		$args['tax_query'] = array(
			array(
				'taxonomy'         => 'category',
				'field'            => 'id',
				'terms'            => array( get_query_var( 'cat' ) ),
				'operator'         => 'IN',
				'include_children' => false,
			),
		);
	} else if ( is_tag() ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => 'tag',
				'field'    => 'id',
				'terms'    => array( get_query_var( 'tag' ) ),
				'operator' => 'IN',
			),
		);
	} else {
		return false;
	}

	$layouts = extra_get_layouts( $args );

	return !empty( $layouts->posts ) ? $layouts->posts[0] : false;
}

function extra_get_tax_layout() {
	return ( $layout = _et_extra_get_tax_layout() ) ? $layout->post_content : extra_default_layout();
}

function extra_get_tax_layout_id() {
	return ( $layout = _et_extra_get_tax_layout() ) ? $layout->ID : extra_get_default_layout_id();
}

function extra_admin_bar_layout_edit( $wp_admin_bar ) {
	if ( !current_user_can( 'edit_pages' ) ) {
		return;
	}

	if ( is_home() && et_extra_show_home_layout() ) {
		$layout_id = extra_get_home_layout_id();
	} else if ( is_category() ) {
		$layout_id = extra_get_tax_layout_id();
	}

	if ( empty( $layout_id ) ) {
		return;
	}

	$wp_admin_bar->add_node( array(
		'id'     => 'edit-layout',
		'parent' => false,
		'title'  => esc_html__( 'Edit Layout', 'extra' ),
		'href'   => admin_url( 'post.php?post=' . $layout_id . '&action=edit' ),
	));
}

add_action( 'admin_bar_menu', 'extra_admin_bar_layout_edit', 100 );

function extra_layout_menu_home_layout_link() {
	if ( is_admin() ) {
		return;
	}

	$home_layout_id = extra_get_home_layout_id();
	$default_layout_id = extra_get_default_layout_id();

	if ( !empty( $home_layout_id ) ) {
		$pagehook = add_submenu_page(
			'edit.php?post_type=' . EXTRA_LAYOUT_POST_TYPE,
			__( 'Edit Home Layout', 'extra' ),
			__( 'Edit Home Layout', 'extra' ),
			'edit_pages',
			'post.php?post=' . $home_layout_id . '&action=edit'
		);
	}

	if ( !empty( $default_layout_id ) ) {
		$pagehook = add_submenu_page(
			'edit.php?post_type=' . EXTRA_LAYOUT_POST_TYPE,
			__( 'Edit Default Layout', 'extra' ),
			__( 'Edit Default Layout', 'extra' ),
			'edit_pages',
			'post.php?post=' . $default_layout_id . '&action=edit'
		);
	}
}

add_action( 'admin_menu', 'extra_layout_menu_home_layout_link' );

function extra_layout_used() {
	if ( is_home() && et_extra_show_home_layout() ) {
		return true;
	} else if ( is_category() || is_tag() ) {
		if ( extra_get_tax_layout_id() ) {
			return true;
		}
	}
	return false;
}

function extra_hide_use_default_editor_button() {
	global $post, $pagenow;

	$post_types = apply_filters( 'extra_hide_use_default_editor_button', array( EXTRA_LAYOUT_POST_TYPE ) );

	if ( ( 'post.php' === $pagenow || 'post-new.php' === $pagenow ) && isset( $post->post_type ) && in_array( $post->post_type, $post_types ) ) {
		wp_add_inline_style( 'et_pb_admin_css', '#et_pb_toggle_builder { display: none !important; }' );
	}
}
add_action( 'admin_enqueue_scripts', 'extra_hide_use_default_editor_button', 11 );

if ( ! function_exists( 'extra_filter_et_core_is_builder_used_on_current_request' ) ):
function extra_filter_et_core_is_builder_used_on_current_request( $is_builder_used ) {
	return $is_builder_used || extra_layout_used();
}
add_filter( 'et_core_is_builder_used_on_current_request', 'extra_filter_et_core_is_builder_used_on_current_request' );
endif;

if ( ! function_exists( 'extra_filter_et_core_page_resource_current_post_id' ) ):
function extra_filter_et_core_page_resource_current_post_id( $post_id ) {
	$page_resource_post_id = null;

	if ( is_home() && et_extra_show_home_layout() ) {
		$page_resource_post_id = extra_get_home_layout_id();
	} else if ( ( is_category() || is_tag() ) && extra_get_tax_layout_id() ) {
		$page_resource_post_id = extra_get_tax_layout_id();
	}

	return null !== $page_resource_post_id ? $page_resource_post_id : $post_id;
}
add_filter( 'et_core_page_resource_current_post_id', 'extra_filter_et_core_page_resource_current_post_id' );
endif;

if ( ! function_exists( 'extra_filter_et_core_page_resource_is_singular' ) ):
function extra_filter_et_core_page_resource_is_singular( $is_singular ) {
	return $is_singular || extra_layout_used();
}
add_filter( 'et_core_page_resource_is_singular', 'extra_filter_et_core_page_resource_is_singular' );
endif;

if ( ! function_exists( 'extra_processing_category_layout' ) ):
function extra_processing_category_layout( $is_processing ) {
	global $extra_processing_category_layout;

	if ( $is_processing ) {
		$extra_processing_category_layout = apply_filters( 'extra_processing_category_layout', $is_processing );
	} else {
		$extra_processing_category_layout = $is_processing;
	}
}
endif;

/**
 * Removes all the new column variations like 1/6, 1/5, 3/5, 2/5 from Category builder
 * Should be removed once Extra Category Builder will fully support all new columns
 *
 * @return string
 */

if ( ! function_exists( 'extra_filter_category_builder_layout_columns' ) ):
function extra_filter_category_builder_layout_columns( $default_columns ) {
	global $post;
	
	if ( ! isset( $post->post_type ) || EXTRA_LAYOUT_POST_TYPE !== $post->post_type ) {
		return $default_columns;
	}

	$layout_columns =
		'<% if ( typeof et_pb_specialty !== \'undefined\' && et_pb_specialty === \'on\' ) { %>
			<li data-layout="1_2,1_2" data-specialty="1,0" data-specialty_columns="2">
				<div class="et_pb_layout_column et_pb_column_layout_1_2 et_pb_variations et_pb_2_variations">
					<div class="et_pb_variation et_pb_variation_full"></div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_2"></div>
						<div class="et_pb_variation et_pb_variation_1_2"></div>
					</div>
				</div>
				<div class="et_pb_layout_column et_pb_column_layout_1_2 et_pb_specialty_column"></div>
			</li>

			<li data-layout="1_2,1_2" data-specialty="0,1" data-specialty_columns="2">
				<div class="et_pb_layout_column et_pb_column_layout_1_2 et_pb_specialty_column"></div>

				<div class="et_pb_layout_column et_pb_column_layout_1_2 et_pb_variations et_pb_2_variations">
					<div class="et_pb_variation et_pb_variation_full"></div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_2"></div>
						<div class="et_pb_variation et_pb_variation_1_2"></div>
					</div>
				</div>
			</li>

			<li data-layout="1_4,3_4" data-specialty="0,1" data-specialty_columns="3">
				<div class="et_pb_layout_column et_pb_column_layout_1_4 et_pb_specialty_column"></div>
				<div class="et_pb_layout_column et_pb_column_layout_3_4 et_pb_variations et_pb_3_variations">
					<div class="et_pb_variation et_pb_variation_full"></div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_2"></div>
						<div class="et_pb_variation et_pb_variation_1_2"></div>
					</div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_3"></div>
						<div class="et_pb_variation et_pb_variation_1_3"></div>
						<div class="et_pb_variation et_pb_variation_1_3"></div>
					</div>
				</div>
			</li>

			<li data-layout="3_4,1_4" data-specialty="1,0" data-specialty_columns="3">
				<div class="et_pb_layout_column et_pb_column_layout_3_4 et_pb_variations et_pb_3_variations">
					<div class="et_pb_variation et_pb_variation_full"></div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_2"></div>
						<div class="et_pb_variation et_pb_variation_1_2"></div>
					</div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_3"></div>
						<div class="et_pb_variation et_pb_variation_1_3"></div>
						<div class="et_pb_variation et_pb_variation_1_3"></div>
					</div>
				</div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4 et_pb_specialty_column"></div>
			</li>

			<li data-layout="1_4,1_2,1_4" data-specialty="0,1,0" data-specialty_columns="2">
				<div class="et_pb_layout_column et_pb_column_layout_1_4 et_pb_specialty_column"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_2 et_pb_variations et_pb_2_variations">
					<div class="et_pb_variation et_pb_variation_full"></div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_2"></div>
						<div class="et_pb_variation et_pb_variation_1_2"></div>
					</div>
				</div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4 et_pb_specialty_column"></div>
			</li>

			<li data-layout="1_2,1_4,1_4" data-specialty="1,0,0" data-specialty_columns="2">
				<div class="et_pb_layout_column et_pb_column_layout_1_2 et_pb_variations et_pb_2_variations">
					<div class="et_pb_variation et_pb_variation_full"></div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_2"></div>
						<div class="et_pb_variation et_pb_variation_1_2"></div>
					</div>
				</div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4 et_pb_specialty_column"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4 et_pb_specialty_column"></div>
			</li>

			<li data-layout="1_4,1_4,1_2" data-specialty="0,0,1" data-specialty_columns="2">
				<div class="et_pb_layout_column et_pb_column_layout_1_4 et_pb_specialty_column"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4 et_pb_specialty_column"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_2 et_pb_variations et_pb_2_variations">
					<div class="et_pb_variation et_pb_variation_full"></div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_2"></div>
						<div class="et_pb_variation et_pb_variation_1_2"></div>
					</div>
				</div>
			</li>

			<li data-layout="1_3,2_3" data-specialty="0,1" data-specialty_columns="2">
				<div class="et_pb_layout_column et_pb_column_layout_1_3 et_pb_specialty_column"></div>
				<div class="et_pb_layout_column et_pb_column_layout_2_3 et_pb_variations et_pb_2_variations">
					<div class="et_pb_variation et_pb_variation_full"></div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_2"></div>
						<div class="et_pb_variation et_pb_variation_1_2"></div>
					</div>
				</div>
			</li>

			<li data-layout="2_3,1_3" data-specialty="1,0" data-specialty_columns="2">
				<div class="et_pb_layout_column et_pb_column_layout_2_3 et_pb_variations et_pb_2_variations">
					<div class="et_pb_variation et_pb_variation_full"></div>
					<div class="et_pb_variation_row">
						<div class="et_pb_variation et_pb_variation_1_2"></div>
						<div class="et_pb_variation et_pb_variation_1_2"></div>
					</div>
				</div>
				<div class="et_pb_layout_column et_pb_column_layout_1_3 et_pb_specialty_column"></div>
			</li>
		<% } else if ( typeof view !== \'undefined\' && typeof view.model.attributes.specialty_columns !== \'undefined\' ) { %>
			<li data-layout="4_4">
				<div class="et_pb_layout_column et_pb_column_layout_fullwidth"></div>
			</li>
			<li data-layout="1_2,1_2">
				<div class="et_pb_layout_column et_pb_column_layout_1_2"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_2"></div>
			</li>

			<% if ( view.model.attributes.specialty_columns === 3 ) { %>
				<li data-layout="1_3,1_3,1_3">
					<div class="et_pb_layout_column et_pb_column_layout_1_3"></div>
					<div class="et_pb_layout_column et_pb_column_layout_1_3"></div>
					<div class="et_pb_layout_column et_pb_column_layout_1_3"></div>
				</li>
			<% } %>
		<% } else { %>
			<li data-layout="4_4">
				<div class="et_pb_layout_column et_pb_column_layout_fullwidth"></div>
			</li>
			<li data-layout="1_2,1_2">
				<div class="et_pb_layout_column et_pb_column_layout_1_2"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_2"></div>
			</li>
			<li data-layout="1_3,1_3,1_3">
				<div class="et_pb_layout_column et_pb_column_layout_1_3"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_3"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_3"></div>
			</li>
			<li data-layout="1_4,1_4,1_4,1_4">
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
			</li>
			<li data-layout="2_3,1_3">
				<div class="et_pb_layout_column et_pb_column_layout_2_3"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_3"></div>
			</li>
			<li data-layout="1_3,2_3">
				<div class="et_pb_layout_column et_pb_column_layout_1_3"></div>
				<div class="et_pb_layout_column et_pb_column_layout_2_3"></div>
			</li>
			<li data-layout="1_4,3_4">
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
				<div class="et_pb_layout_column et_pb_column_layout_3_4"></div>
			</li>
			<li data-layout="3_4,1_4">
				<div class="et_pb_layout_column et_pb_column_layout_3_4"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
			</li>
			<li data-layout="1_2,1_4,1_4">
				<div class="et_pb_layout_column et_pb_column_layout_1_2"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
			</li>
			<li data-layout="1_4,1_4,1_2">
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_2"></div>
			</li>
			<li data-layout="1_4,1_2,1_4">
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_2"></div>
				<div class="et_pb_layout_column et_pb_column_layout_1_4"></div>
			</li>
	<%
		}
	%>';

	return $layout_columns;
}
add_filter('et_builder_layout_columns', 'extra_filter_category_builder_layout_columns');
endif;

/**
 * Removes all the new column variations like 1/6, 1/5, 3/5, 2/5 from Category builder
 * Should be removed once Extra Category Builder will fully support all new columns
 *
 * @return string
 */

 
if ( ! function_exists( 'extra_filter_category_builder_columns' ) ):
function extra_filter_category_builder_columns( $default_columns ) {
	global $post;
	
	if ( ! isset( $post->post_type ) || EXTRA_LAYOUT_POST_TYPE !== $post->post_type ) {
		return $default_columns;
	}

	$columns = array(
		'specialty' => array(
			'1_2,1_2' => array(
				'position' => '1,0',
				'columns'  => '2',
			),
			'1_2,1_2' => array(
				'position' => '0,1',
				'columns'  => '2',
			),
			'1_4,3_4' => array(
				'position' => '0,1',
				'columns'  => '3',
			),
			'3_4,1_4' => array(
				'position' => '1,0',
				'columns'  => '3',
			),
			'1_4,1_2,1_4' => array(
				'position' => '0,1,0',
				'columns'  => '2',
			),
			'1_2,1_4,1_4' => array(
				'position' => '1,0,0',
				'columns'  => '2',
			),
			'1_4,1_4,1_2' => array(
				'position' => '0,0,1',
				'columns'  => '2',
			),
			'1_3,2_3' => array(
				'position' => '0,1',
				'columns'  => '2',
			),
			'2_3,1_3' => array(
				'position' => '1,0',
				'columns'  => '2',
			),
		),
		'regular' => array(
			'4_4',
			'1_2,1_2',
			'1_3,1_3,1_3',
			'1_4,1_4,1_4,1_4',
			'2_3,1_3',
			'1_3,2_3',
			'1_4,3_4',
			'3_4,1_4',
			'1_2,1_4,1_4',
			'1_4,1_4,1_2',
			'1_4,1_2,1_4',
		)
	);

	return $columns;
}
add_filter('et_builder_get_columns', 'extra_filter_category_builder_columns');
endif;