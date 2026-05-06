import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	RichText,
	InspectorControls,
	BlockControls,
} from '@wordpress/block-editor';
import {
	Button,
	CheckboxControl,
	SelectControl,
	TextControl,
	TextareaControl,
	ToolbarButton,
	ToolbarGroup,
	Spinner,
	PanelBody, // Replaced ToolsPanel with PanelBody for better compatibility
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';
import { useState, useRef, useEffect } from '@wordpress/element';
import { link as linkIcon, external, pencil as editIcon } from '@wordpress/icons';

// ─── Icons ───────────────────────────────────────────────────────────────────

const PageIcon = () => (
	<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M7 5h10v14H7V5zm0-1.5A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V5A1.5 1.5 0 0 0 17 3.5H7z" fill="currentColor"/>
	</svg>
);

// ─── MiniLinkPicker ──────────────────────────────────────────────────────────

function MiniLinkPicker( { value, onChange, onRemove } ) {
	const { url } = value || {};
	const [ isEditing, setIsEditing ] = useState( ! url );
	const [ query, setQuery ] = useState( '' );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ results, setResults ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const inputRef = useRef();
	const wrapRef = useRef();

	useEffect( () => {
		if ( ! query || query.length < 2 ) {
			setResults( [] );
			return;
		}
		let cancelled = false;
		setIsLoading( true );
		apiFetch( {
			path: `/wp/v2/search?search=${ encodeURIComponent( query ) }&per_page=6&type=post&_fields=id,title,url,subtype`,
		} ).then( ( data ) => {
			if ( ! cancelled ) {
				setResults( data || [] );
				setIsLoading( false );
			}
		} ).catch( () => {
			if ( ! cancelled ) {
				setResults( [] );
				setIsLoading( false );
			}
		} );
		return () => { cancelled = true; };
	}, [ query ] );

	useEffect( () => {
		const handler = ( e ) => {
			if ( wrapRef.current && ! wrapRef.current.contains( e.target ) ) {
				setIsOpen( false );
			}
		};
		document.addEventListener( 'mousedown', handler );
		return () => document.removeEventListener( 'mousedown', handler );
	}, [] );

	const handleSelect = ( item ) => {
		onChange( {
			url: item.url,
			id: item.id,
			type: item.subtype,
			kind: 'post-type',
			title: item.title || '',
		} );
		setQuery( '' );
		setIsOpen( false );
		setIsEditing( false );
	};

	const handleUrlSubmit = () => {
		if ( ! query ) return;
		onChange( { url: query, title: query } );
		setQuery( '' );
		setIsOpen( false );
		setIsEditing( false );
	};

	if ( ! isEditing && url ) {
		const displayUrl = url.replace( /^https?:\/\/[^/]+/, '' ) || url;
		return (
			<div style={ {
				display: 'flex',
				alignItems: 'center',
				border: '1px solid #949494',
				borderRadius: '2px',
				padding: '0 8px',
				height: '40px',
				background: '#fff',
				gap: '4px',
				boxSizing: 'border-box',
				width: '100%',
			} }>
				<span style={ {
					flex: 1,
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					fontSize: '13px',
					color: '#1e1e1e',
				} }>
					{ displayUrl }
				</span>
				<Button
					icon={ editIcon }
					label={ __( 'Edit link', 'mobile-mega-menu' ) }
					onClick={ () => {
						setQuery( url );
						setIsEditing( true );
						setTimeout( () => inputRef.current?.focus(), 50 );
					} }
					isSmall
					style={ { minWidth: 'auto', padding: '4px', flexShrink: 0 } }
				/>
			</div>
		);
	}

	const isUrl = query.startsWith( 'http' ) || query.startsWith( '/' ) || query.startsWith( '#' );

	return (
		<div ref={ wrapRef } style={ { position: 'relative', width: '100%', boxSizing: 'border-box' } }>
			<div style={ {
				display: 'flex',
				alignItems: 'center',
				border: '1.5px solid #007cba',
				borderRadius: '2px',
				background: '#fff',
				boxSizing: 'border-box',
				width: '100%',
			} }>
				<input
					ref={ inputRef }
					type="text"
					value={ query }
					placeholder={ __( 'Search or type URL', 'mobile-mega-menu' ) }
					autoComplete="off"
					onChange={ ( e ) => {
						setQuery( e.target.value );
						setIsOpen( true );
					} }
					onFocus={ () => setIsOpen( true ) }
					onKeyDown={ ( e ) => {
						if ( e.key === 'Enter' ) handleUrlSubmit();
						if ( e.key === 'Escape' ) {
							setIsOpen( false );
							if ( url ) setIsEditing( false );
						}
					} }
					style={ {
						flex: 1,
						border: 'none',
						outline: 'none',
						padding: '0 10px',
						height: '40px',
						fontSize: '13px',
						background: 'transparent',
						minWidth: 0,
						boxSizing: 'border-box',
					} }
				/>
				{ isLoading && <div style={ { padding: '0 8px' } }><Spinner /></div> }
				{ url && ! isLoading && (
					<Button
						isSmall
						onClick={ onRemove }
						label={ __( 'Remove link', 'mobile-mega-menu' ) }
						style={ { flexShrink: 0, padding: '4px 8px', minWidth: 'auto', color: '#757575' } }
					>
						✕
					</Button>
				) }
			</div>

			{ isOpen && ( results.length > 0 || isUrl ) && (
				<div style={ {
					position: 'absolute',
					top: '100%',
					left: 0,
					right: 0,
					background: '#fff',
					border: '1px solid #ddd',
					borderTop: 'none',
					borderRadius: '0 0 2px 2px',
					zIndex: 9999,
					boxShadow: '0 4px 8px rgba(0,0,0,.1)',
					boxSizing: 'border-box',
					maxHeight: '240px',
					overflowY: 'auto',
				} }>
					{ isUrl && (
						<button
							onMouseDown={ ( e ) => { e.preventDefault(); handleUrlSubmit(); } }
							style={ {
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
								width: '100%',
								padding: '8px 12px',
								border: 'none',
								background: 'none',
								cursor: 'pointer',
								textAlign: 'left',
								fontSize: '13px',
								borderBottom: results.length ? '1px solid #eee' : 'none',
								boxSizing: 'border-box',
							} }
						>
							<span style={ { flexShrink: 0, color: '#757575', display: 'flex' } }>{ linkIcon }</span>
							<span style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>{ query }</span>
						</button>
					) }

					{ results.map( ( item ) => (
						<button
							key={ item.id }
							onMouseDown={ ( e ) => { e.preventDefault(); handleSelect( item ); } }
							style={ {
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
								width: '100%',
								padding: '8px 12px',
								border: 'none',
								background: 'none',
								cursor: 'pointer',
								textAlign: 'left',
								boxSizing: 'border-box',
							} }
						>
							<span style={ { flexShrink: 0, color: '#757575', display: 'flex' } }><PageIcon /></span>
							<span style={ { display: 'flex', flexDirection: 'column', minWidth: 0 } }>
								<span style={ { fontWeight: 500, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } dangerouslySetInnerHTML={ { __html: item.title } } />
								<span style={ { fontSize: '12px', color: '#757575', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>{ item.url?.replace( /^https?:\/\/[^/]+/, '' ) }</span>
							</span>
						</button>
					) ) }
				</div>
			) }
		</div>
	);
}

// ─── Edit ────────────────────────────────────────────────────────────────────

export default function Edit( { attributes, setAttributes } ) {
	const {
		label,
		url,
		opensInNewTab,
		rel,
		description,
		title,
		type,
		kind,
		id,
		customMenuSlug,
		customMenuBackgroundColor,
		showSubmenuIcon
	} = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-navigation-item has-child wp-block-navigation-submenu',
	} );

	const homeUrl = useSelect(
		( select ) => select( coreStore ).getEntityRecord( 'root', '__unstableBase' )?.home,
		[]
	);

	const isViewableUrl = !! url && ! url.startsWith( '#' ) && ! url.startsWith( './' );
	const viewUrl = isViewableUrl && url.startsWith( '/' ) && homeUrl ? homeUrl + url : url;

	const { templateParts } = useSelect( ( select ) => ( {
		templateParts: select( coreStore ).getEntityRecords( 'postType', 'wp_template_part', {
			per_page: -1,
			area: 'mega-menu'
		} ) || [],
	} ), [] );

	const templateOptions = [
		{ label: __( 'None', 'mobile-mega-menu' ), value: '' },
		...templateParts.map( ( part ) => ( {
			label: part.title?.rendered || part.slug,
			value: part.slug,
		} ) ),
	];

	const selectedPart = templateParts.find( ( part ) => part.slug === customMenuSlug );
	const editTemplateUrl = customMenuSlug && selectedPart
		? `${ homeUrl }/wp-admin/site-editor.php?p=%2Fwp_template_part%2F${ encodeURIComponent( selectedPart.theme ) }%2F%2F${ customMenuSlug }&canvas=edit`
		: null;

	const handleLinkChange = ( nextValue ) => {
		setAttributes( {
			url: nextValue?.url ?? '',
			id: nextValue?.id ?? undefined,
			type: nextValue?.type ?? undefined,
			kind: nextValue?.kind ?? undefined,
			opensInNewTab: nextValue?.opensInNewTab ?? opensInNewTab,
		} );
	};

	const handleMouseEnter = () => {
		if ( ! customMenuSlug ) return;
		const event = new CustomEvent( 'wp-mega-menu-preview', {
			detail: { slug: customMenuSlug, backgroundColor: customMenuBackgroundColor }
		} );
		window.dispatchEvent( event );
	};

	return (
		<>
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarButton
						icon={ linkIcon }
						title={ __( 'Link', 'mobile-mega-menu' ) }
						isPressed={ !! url }
					/>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				{ /* Use PanelBody instead of ToolsPanel to avoid blocking Core Styles */ }
				<PanelBody title={ __( 'Mega Menu Settings', 'mobile-mega-menu' ) }>
					<TextControl
						label={ __( 'Text', 'mobile-mega-menu' ) }
						value={ label || '' }
						onChange={ ( val ) => setAttributes( { label: val } ) }
						autoComplete="off"
					/>

					<div style={ { marginBottom: '16px' } }>
						<p style={ { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px' } }>
							{ __( 'LINK', 'mobile-mega-menu' ) }
						</p>
						<MiniLinkPicker
							value={ { url, opensInNewTab, title, type, kind, id } }
							onChange={ handleLinkChange }
							onRemove={ () => setAttributes( { url: undefined, id: undefined, type: undefined, kind: undefined } ) }
						/>
					</div>

					<CheckboxControl
						label={ __( 'Open in new tab', 'mobile-mega-menu' ) }
						checked={ opensInNewTab }
						onChange={ ( val ) => setAttributes( { opensInNewTab: val } ) }
					/>

					<CheckboxControl
						label={ __( 'Show Submenu Icon', 'mobile-mega-menu' ) }
						checked={ showSubmenuIcon }
						onChange={ ( val ) => setAttributes( { showSubmenuIcon: val } ) }
					/>

					<SelectControl
						label={ __( 'Mega Menu Template', 'mobile-mega-menu' ) }
						value={ customMenuSlug || '' }
						options={ templateOptions }
						onChange={ ( val ) => setAttributes( { customMenuSlug: val } ) }
					/>

					{ editTemplateUrl && (
						<Button href={ editTemplateUrl } target="_blank" icon={ editIcon } isSmall isLink>
							{ __( 'Edit Template', 'mobile-mega-menu' ) }
						</Button>
					) }

					<TextareaControl
						label={ __( 'Description', 'mobile-mega-menu' ) }
						value={ description || '' }
						onChange={ ( val ) => setAttributes( { description: val } ) }
					/>

					<TextControl
						label={ __( 'Rel attribute', 'mobile-mega-menu' ) }
						value={ rel || '' }
						onChange={ ( val ) => setAttributes( { rel: val } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<li { ...blockProps } onMouseEnter={ handleMouseEnter }>
				<div className="wp-block-navigation-item__content">
					<RichText
						tagName="span"
						className="wp-block-navigation-item__label"
						value={ label }
						onChange={ ( val ) => setAttributes( { label: val } ) }
						placeholder={ __( 'Add label...', 'mobile-mega-menu' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
					/>
				</div>
				{ showSubmenuIcon && (
					<button className="wp-block-navigation__submenu-icon wp-block-navigation-submenu__toggle">
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path d="M1.50002 4L6.00002 8L10.5 4" stroke="currentColor" strokeWidth="1.5"></path>
						</svg>
					</button>
				) }
				<ul className="wp-block-navigation__submenu-container">
					<InnerBlocks renderAppender={ InnerBlocks.ButtonBlockAppender } />
				</ul>
			</li>
		</>
	);
}
