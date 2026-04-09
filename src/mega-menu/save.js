import { __, sprintf } from '@wordpress/i18n';
import { useBlockProps, RichText, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		label,
		url,
		opensInNewTab,
		rel,
		title
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: 'wp-block-navigation-item has-child wp-block-navigation-submenu'
	} );

	const relAttributes = [];
	if ( opensInNewTab ) {
		relAttributes.push( 'noopener' );
	}
	if ( rel ) {
		relAttributes.push( ...rel.split( ' ' ).filter( ( r ) => r && r !== 'noopener' ) );
	}
	const relString = relAttributes.length > 0 ? relAttributes.join( ' ' ) : undefined;

	return (
		<li { ...blockProps }>
			{ url ? (
				<a
					className="wp-block-navigation-item__content"
					href={ url }
					target={ opensInNewTab ? '_blank' : undefined }
					rel={ relString }
					title={ title }
				>
					<RichText.Content
						tagName="span"
						className="wp-block-navigation-item__label"
						value={ label }
					/>
				</a>
			) : (
				<div className="wp-block-navigation-item__content">
					<RichText.Content
						tagName="span"
						className="wp-block-navigation-item__label"
						value={ label }
					/>
				</div>
			) }
			<button
				aria-label={ label ? sprintf( __( '%s submenu' ), label ) : __( 'Submenu' ) }
				className="wp-block-navigation__submenu-icon wp-block-navigation-submenu__toggle"
				aria-expanded="false"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
					<path d="M1.50002 4L6.00002 8L10.5 4" stroke="currentColor" strokeWidth="1.5"></path>
				</svg>
			</button>
			<ul className="wp-block-navigation__submenu-container">
				<InnerBlocks.Content />
			</ul>
		</li>
	);
}
