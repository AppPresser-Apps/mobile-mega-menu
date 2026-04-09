<?php
// This file is generated. Do not modify it manually.
return array(
	'mega-menu' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'mobile-mega-menu/mega-menu',
		'version' => '1.0.0',
		'title' => 'Mega Menu',
		'category' => 'design',
		'parent' => array(
			'core/navigation',
			'core/navigation-submenu'
		),
		'icon' => 'menu',
		'description' => 'A navigation menu item that contains a mega menu layout.',
		'attributes' => array(
			'label' => array(
				'type' => 'string',
				'role' => 'content'
			),
			'url' => array(
				'type' => 'string'
			),
			'opensInNewTab' => array(
				'type' => 'boolean',
				'default' => false
			),
			'rel' => array(
				'type' => 'string'
			),
			'title' => array(
				'type' => 'string'
			),
			'description' => array(
				'type' => 'string'
			),
			'type' => array(
				'type' => 'string'
			),
			'kind' => array(
				'type' => 'string'
			),
			'id' => array(
				'type' => 'number'
			),
			'isTopLevelItem' => array(
				'type' => 'boolean'
			),
			'anchor' => array(
				'type' => 'string'
			),
			'customMenuSlug' => array(
				'type' => 'string',
				'default' => ''
			),
			'customMenuBreakpointEnabled' => array(
				'type' => 'boolean',
				'default' => false
			),
			'customMenuBreakpoint' => array(
				'type' => 'number',
				'default' => 600
			),
			'customMenuBackgroundColor' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'usesContext' => array(
			'textColor',
			'customTextColor',
			'backgroundColor',
			'customBackgroundColor',
			'overlayTextColor',
			'customOverlayTextColor',
			'overlayBackgroundColor',
			'customOverlayBackgroundColor',
			'fontSize',
			'customFontSize',
			'showSubmenuIcon',
			'openSubmenusOnClick',
			'style'
		),
		'supports' => array(
			'html' => false,
			'reusable' => false,
			'anchor' => true,
			'align' => array(
				'wide',
				'full'
			),
			'color' => array(
				'gradients' => true,
				'link' => true,
				'text' => true,
				'background' => true,
				'__experimentalDefaultControls' => array(
					'text' => true,
					'background' => true
				)
			),
			'typography' => array(
				'fontSize' => true,
				'lineHeight' => true,
				'__experimentalFontFamily' => true,
				'__experimentalFontWeight' => true,
				'__experimentalFontStyle' => true,
				'__experimentalTextTransform' => true,
				'__experimentalTextDecoration' => true,
				'__experimentalLetterSpacing' => true,
				'__experimentalDefaultControls' => array(
					'fontSize' => true
				)
			),
			'spacing' => array(
				'blockGap' => true,
				'margin' => true,
				'padding' => true,
				'__experimentalDefaultControls' => array(
					'margin' => true,
					'padding' => true
				)
			)
		),
		'textdomain' => 'mobile-mega-menu',
		'editorScript' => 'file:./index.js',
		'style' => 'file:./index.css'
	)
);
