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
	// Include the main mobile menu functionality
	require_once plugin_dir_path( __FILE__ ) . 'mobile-menu.php';
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