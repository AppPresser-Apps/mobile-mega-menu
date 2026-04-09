<?php
/**
 * Enqueue the JavaScript for the block editor
 */
function enqueue_mobile_menu_editor_script() {
	$script_path = plugin_dir_path( __FILE__ ) . 'build/index.js';
	$script_url  = plugin_dir_url( __FILE__ ) . 'build/index.js';

	// Only enqueue if the file actually exists
	if ( file_exists( $script_path ) ) {
		wp_enqueue_script(
			'mobile-menu-editor',
			$script_url,
			array(
				'wp-blocks',
				'wp-element',
				'wp-components',
				'wp-compose',
				'wp-data',
				'wp-plugins',
				'wp-edit-post',
				'wp-i18n',
				'wp-block-editor',
			),
			filemtime( $script_path ),
			true
		);

		// Enqueue editor styles
		$editor_style_path = plugin_dir_path( __FILE__ ) . 'build/index.css';
		$editor_style_url  = plugin_dir_url( __FILE__ ) . 'build/index.css';
		if ( file_exists( $editor_style_path ) ) {
			wp_enqueue_style(
				'mobile-mega-menu-editor-style',
				$editor_style_url,
				array(),
				filemtime( $editor_style_path )
			);
		}

		// Localize script to make sure dependencies are available
		wp_add_inline_script(
			'mobile-menu-editor',
			'window.wp = window.wp || {};'
		);
	}
}
add_action( 'enqueue_block_editor_assets', 'enqueue_mobile_menu_editor_script' );

/**
 * Enqueue frontend styles
 */
function enqueue_mobile_mega_menu_frontend_assets() {
	$style_path = plugin_dir_path( __FILE__ ) . 'build/style-index.css';
	$style_url  = plugin_dir_url( __FILE__ ) . 'build/style-index.css';

	if ( file_exists( $style_path ) ) {
		wp_enqueue_style(
			'mobile-mega-menu-frontend-style',
			$style_url,
			array(),
			filemtime( $style_path )
		);
	}
}
add_action( 'wp_enqueue_scripts', 'enqueue_mobile_mega_menu_frontend_assets' );

add_filter( 'register_block_type_args', 'mobile_mega_menu_register_nav_attributes', 10, 2 );

function mobile_mega_menu_register_nav_attributes( $args, $name ) {
	if ( 'core/navigation' === $name ) {
		$args['attributes']['mobileMenuSlug']                  = array(
			'type'    => 'string',
			'default' => '',
		);
		$args['attributes']['mobileMenuBreakpointEnabled']     = array(
			'type'    => 'boolean',
			'default' => false,
		);
		$args['attributes']['mobileMenuBreakpoint']            = array(
			'type'    => 'number',
			'default' => 600,
		);
		$args['attributes']['customMobileMenuBackgroundColor'] = array(
			'type'    => 'string',
			'default' => '',
		);
		$args['attributes']['customMobileIconColor']           = array(
			'type'    => 'string',
			'default' => '',
		);
	}
	return $args;
}

add_filter( 'render_block_core/navigation', 'mobile_mega_menu_render_custom_mobile_menu', 10, 2 );

function mobile_mega_menu_render_custom_mobile_menu( $block_content, $block ) {
	$attrs       = $block['attrs'] ?? array();
	$mobile_slug = $attrs['mobileMenuSlug'] ?? '';

	if ( empty( $mobile_slug ) ) {
		return $block_content;
	}

	// Parse the template part
	$template_part_content = do_blocks( '<!-- wp:template-part {"slug":"' . esc_attr( $mobile_slug ) . '"} /-->' );

	if ( empty( trim( $template_part_content ) ) ) {
		return $block_content;
	}

	// Add unique ID to the nav block
	$unique_id = uniqid( 'mmm-nav-' );
	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( $processor->next_tag( array( 'tag_name' => 'nav' ) ) ) {
		$processor->add_class( $unique_id );
		$block_content = $processor->get_updated_html();
	}

	// Inject our template part inside the native responsive content container
	$search_token = 'class="wp-block-navigation__responsive-container-content"';
	$parts        = explode( $search_token, $block_content, 2 );

	if ( count( $parts ) === 2 ) {
		$close_bracket_pos = strpos( $parts[1], '>' );

		if ( $close_bracket_pos !== false ) {
			$before              = $parts[0] . $search_token . substr( $parts[1], 0, $close_bracket_pos + 1 );
			$after               = substr( $parts[1], $close_bracket_pos + 1 );
			$mobile_html_wrapper = '<div class="mmm-custom-mobile-menu">' . $template_part_content . '</div>';
			$block_content       = $before . $mobile_html_wrapper . $after;
		}
	}

	// Determine Breakpoint
	$breakpoint = ( ! empty( $attrs['mobileMenuBreakpointEnabled'] ) && ! empty( $attrs['mobileMenuBreakpoint'] ) )
		? (int) $attrs['mobileMenuBreakpoint']
		: 600;

	$bg_color   = $attrs['customMobileMenuBackgroundColor'] ?? '';
	$icon_color = $attrs['customMobileIconColor'] ?? '';

	// Generate CSS
	$css = "<style>
        /* --- MOBILE VIEW --- */
        @media (max-width: {$breakpoint}px) {
            /* Hide ONLY the default core navigation links */
            .{$unique_id} .wp-block-navigation__responsive-container-content > .wp-block-navigation__container {
                display: none !important;
            }

            /* Show our injected template part inside the native WP modal */
            .{$unique_id} .mmm-custom-mobile-menu {
                display: block !important;
                width: 100%;
            }";

	// Handle Custom Breakpoint logic for mobile
	if ( ! empty( $attrs['mobileMenuBreakpointEnabled'] ) ) {
		$css .= "
            .{$unique_id} > .wp-block-navigation__responsive-container-open {
                display: flex !important;
            }
            .{$unique_id} > .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) {
                display: none !important;
            }";
	}

	$css .= '}

        /* --- DESKTOP VIEW --- */
        @media (min-width: ' . ( $breakpoint + 1 ) . "px) {
            /* Hide template part on desktop */
            .{$unique_id} .mmm-custom-mobile-menu {
                display: none !important;
            }
            /* Show default core navigation on desktop */
            .{$unique_id} .wp-block-navigation__responsive-container-content > .wp-block-navigation__container {
                display: flex !important;
            }";

	// Handle Custom Breakpoint logic for desktop
	if ( ! empty( $attrs['mobileMenuBreakpointEnabled'] ) ) {
		$css .= "
            .{$unique_id} > .wp-block-navigation__responsive-container-open {
                display: none !important;
            }
            .{$unique_id} > .wp-block-navigation__responsive-container {
                display: block !important;
                position: static !important;
                z-index: auto !important;
                background-color: transparent !important;
            }";
	}

	$css .= '}';

	// Handle Custom Colors selected in the inspector panel
	if ( $bg_color || $icon_color ) {
		if ( $bg_color ) {
			$css .= "\n.{$unique_id} .wp-block-navigation__responsive-container.is-menu-open,
                     .{$unique_id} .wp-block-navigation__responsive-dialog { background-color: {$bg_color} !important; }";
		}
		if ( $icon_color ) {
			$css .= "\n.{$unique_id} .wp-block-navigation__responsive-container-open svg,
                     .{$unique_id} .wp-block-navigation__responsive-container-close svg { fill: {$icon_color} !important; }";
		}
	}

	$css .= '</style>';

	return $css . $block_content;
}
