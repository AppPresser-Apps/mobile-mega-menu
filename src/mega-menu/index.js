import './style-index.css';
import './index.css';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, RichText, InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import edit from './edit';
import save from './save';

registerBlockType( metadata, {
	edit,
	save,
	deprecated: [
		{
			attributes: metadata.attributes,
			save( { attributes } ) {
				const { label, url } = attributes;
				return (
					<li className="wp-block-mobile-mega-menu-mega-menu wp-block-navigation-item has-child wp-block-navigation-submenu">
						<div className="wp-block-navigation-item__content">
							<RichText.Content
								tagName="span"
								className="wp-block-navigation-item__label"
								value={ label }
							/>
							<button aria-label="Submenu" className="wp-block-navigation-submenu__toggle" aria-expanded="false">
								<span className="wp-block-navigation__submenu-icon">
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
										<path d="M1.50002 4L6.00002 8L10.5 4" stroke="currentColor" strokeWidth="1.5"></path>
									</svg>
								</span>
							</button>
						</div>
						<ul className="wp-block-navigation__submenu-container">
							<InnerBlocks.Content />
						</ul>
					</li>
				);
			},
		},
		{
			attributes: metadata.attributes,
			save( { attributes } ) {
				const { label } = attributes;
				return (
					<li className="wp-block-mobile-mega-menu-mega-menu wp-block-navigation-item has-child open-on-hover-click mmm-mega-menu-item">
						<div className="wp-block-navigation-item__content">
							<RichText.Content
								tagName="span"
								className="wp-block-navigation-item__label"
								value={ label }
							/>
							<span className="wp-block-navigation__submenu-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
									<path d="M1.50002 4L6.00002 8L10.5 4" stroke="currentColor" strokeWidth="1.5"></path>
								</svg>
							</span>
						</div>
						<div className="mmm-mega-menu__container">
							<div className="mmm-mega-menu__inner">
								<InnerBlocks.Content />
							</div>
						</div>
					</li>
				);
			},
		},
	],
} );
