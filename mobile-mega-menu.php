<?php
/**
 * Plugin Name: Mobile Mega Menu
 * Description: A mobile menu solution that enhances WordPress navigation blocks with custom mobile menu functionality.
 * Version: 1.0.0
 * Author: Mercer County
 * Text Domain: mobile-mega-menu
 * Domain Path: /languages
 * Requires at least: 5.9
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * This plugin adds mobile menu functionality to WordPress navigation blocks,
 * allowing for custom mobile menu templates and styling options.
 *
 * @package MobileMegaMenu
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load the mobile menu functionality
 */
function mobile_mega_menu_load() {
	// Include the main mobile menu functionality.
	require_once plugin_dir_path( __FILE__ ) . 'mobile-menu.php';

	/**
	* Add "Mega Menu" to the Template Parts / Patterns sidebar
	*/
	add_filter(
		'default_wp_template_part_areas',
		function ( $areas ) {
			$areas[] = array(
				'area'        => 'mega-menu',
				'label'       => __( 'Mega Menu', 'mobile-mega-menu' ),
				'description' => __( 'Templates for the mega menu holder.', 'mobile-mega-menu' ),
				'icon'        => 'layout',
				'area_tag'    => 'div',
			);
			return $areas;
		}
	);
}
add_action( 'plugins_loaded', 'mobile_mega_menu_load' );


/**
 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
 * based on the registered block metadata. Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function mobile_mega_menu_block_init() {
	wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
}
add_action( 'init', 'mobile_mega_menu_block_init' );

register_block_type(
	'mobile-mega-menu/mega-menu-holder',
	array(
		'render_callback' => function () {
			// Query only template parts assigned to our custom "mega-menu" area
			$query_args = array(
				'post_type'      => 'wp_template_part',
				'posts_per_page' => -1,
				'tax_query'      => array(
					array(
						'taxonomy' => 'wp_template_part_area',
						'field'    => 'slug',
						'terms'    => 'mega-menu',
					),
				),
			);

			$templates = get_posts( $query_args );

			$output = '<div id="global-mega-menu-holder" class="mega-menu-holder">';

			foreach ( $templates as $template ) {
				// Render each template part, but keep it hidden inside the holder
				$content = do_blocks( $template->post_content );

				$output .= sprintf(
					'<div class="mega-content-section" data-menu-slug="%s" style="display:none;">%s</div>',
					esc_attr( $template->post_name ),
					$content
				);
			}

			$output .= '</div>';
			return $output;
		},
	)
);
