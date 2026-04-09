import './style-index.css';
import './index.css';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, RichText, InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import edit from './edit';
import save from './save';

registerBlockType( metadata.name, {
	edit,
	save,
	deprecated: [
		// v3 — nested <span> wrapping RichText.Content (no tagName)
		{
			attributes: metadata.attributes,
			save( { attributes } ) {
				const { label, url, opensInNewTab, rel, title } = attributes;
				const blockProps = useBlockProps.save( {
					className: 'wp-block-navigation-item has-child wp-block-navigation-submenu'
				} );
				const relAttributes = [];
				if ( opensInNewTab ) relAttributes.push( 'noopener' );
				if ( rel ) relAttributes.push( rel );
				const relString = relAttributes.length > 0 ? relAttributes.join( ' ' ) : undefined;
				return (
					<li { ...blockProps }>
						{ url ? (
							<a className="wp-block-navigation-item__content" href={ url } target={ opensInNewTab ? '_blank' : undefined } rel={ relString } title={ title }>
								<span className="wp-block-navigation-item__label">
									<RichText.Content value={ label } />
								</span>
							</a>
						) : (
							<div className="wp-block-navigation-item__content">
								<span className="wp-block-navigation-item__label">
									<RichText.Content value={ label } />
								</span>
							</div>
						) }
						<button aria-label="Submenu" className="wp-block-navigation__submenu-icon wp-block-navigation-submenu__toggle" aria-expanded="false">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
								<path d="M1.50002 4L6.00002 8L10.5 4" stroke="currentColor" strokeWidth="1.5"></path>
							</svg>
						</button>
						<ul className="wp-block-navigation__submenu-container">
							<InnerBlocks.Content />
						</ul>
					</li>
				);
			},
		},
		// v2 — button + submenu-icon inside content div
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
		// v1 — original mmm-mega-menu-item layout
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
