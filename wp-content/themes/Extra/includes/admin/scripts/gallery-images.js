(function ($) {

	$(document).ready(function () {

		var gallery_images_frame,
			$gallery_images = $('#et_gallery_images'),
			$gallery_images_ids = $('#et_gallery_images_ids');

		function reset_gallery_images_ids() {
			var gallery_images_ids = [];

			$gallery_images.find('li.gallery_image').each(function () {
				gallery_images_ids.push($(this).data('id'));
			});

			gallery_images_ids = gallery_images_ids.join(',');

			$gallery_images_ids.val(gallery_images_ids);
		}

		function gallery_images_sortable() {
			$gallery_images.sortable({
				items: '.gallery_image',
				cursor: 'move',
				forcePlaceholderSize: true,
				update: function () {
					reset_gallery_images_ids();
				}
			});
		}

		gallery_images_sortable();

		$gallery_images.on('click', 'span.delete', function (e) {
			var $this = $(this),
				$parent = $this.closest('li.gallery_image');

			e.preventDefault();

			$parent.slideUp('fast', function () {
				$parent.remove();
				reset_gallery_images_ids();
			});
		});

		$('#et_gallery_add_images').click(function (e) {
			var $this = $(this);

			e.preventDefault();

			if (typeof gallery_images_frame !== 'undefined') {
				gallery_images_frame.open();
				return;
			}

			gallery_images_frame = wp.media.frames.gallery_images = wp.media({
				title: $this.data('title'),
				button: {
					text: $this.data('title'),
				},
				states: [
					new wp.media.controller.Library({
						title: $this.data('title'),
						multiple: true
					})
				]
			});

			gallery_images_frame.open();

			gallery_images_frame.on('select', function () {

				var selection = gallery_images_frame.state().get('selection');

				selection.each(function (selection_item) {
					var thumb_sizes,
						thumb_url;

					if (selection_item.has('id')) {

						thumb_sizes = selection_item.get('sizes');

						if (thumb_sizes.hasOwnProperty('thumbnail')) {
							thumb_url = thumb_sizes.thumbnail.url;
						} else {
							thumb_url = thumb_sizes.full.url;
						}

						$gallery_images.append(
							'<li class="gallery_image" data-id="' + selection_item.get('id') + '">\
								<span class="delete">-</span>\
								<img src="' + thumb_url + '" />\
							</li>');
					}
				});

				reset_gallery_images_ids();
			});

			gallery_images_sortable();

		});

	}); // end $( document ).ready()

})(jQuery);
