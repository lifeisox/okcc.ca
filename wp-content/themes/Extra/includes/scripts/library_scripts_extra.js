(function($){
	$( document ).ready( function() {
		// hide unneeded options if Extra layout selected
		$( 'body' ).on( 'change', '#et_pb_extra_layout', function() {
			var $template_type_container = $( '#new_template_type' ),
				$not_supported_options = $template_type_container.find( 'option[value="fullwidth_section"], option[value="fullwidth_module"]' );

			if ( $( this ).is( ':checked' ) ) {
				$( '#et_builder_layout_built_for_post_type' ).val( 'layout' );
				// reset the value to Module if selected option is not supported by Extra layout
				if ( 'fullwidth_section' === $template_type_container.val() || 'fullwidth_module' === $template_type_container.val() ) {
					$template_type_container.val( 'module' );
					$template_type_container.change();
				}
				$not_supported_options.hide();
			} else {
				$( '#et_builder_layout_built_for_post_type' ).val( 'page' );
				$not_supported_options.show();
			}
		} );
	});
})(jQuery)