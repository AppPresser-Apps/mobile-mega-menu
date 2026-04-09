import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl, RangeControl, ColorPalette, BaseControl, __experimentalDivider as Divider } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';
import { createPortal, useEffect, useState, useRef } from '@wordpress/element'; // <-- Note the new imports

// 1. Component to Teleport the Preview into the Native Overlay
const OverlayInjector = ({ slug }) => {
    const anchorRef = useRef(null);
    const [targetNode, setTargetNode] = useState(null);

    useEffect(() => {
        if (!anchorRef.current) return;

        // Find the main nav block wrapper in the editor DOM
        const blockElement = anchorRef.current.closest('[data-block]');
        if (!blockElement) return;

        // Function to locate Gutenberg's inner responsive container
        const updateContainer = () => {
            const container = blockElement.querySelector('.wp-block-navigation__responsive-container-content');
            setTargetNode((prev) => (container !== prev ? container : prev));
        };

        // Run initially
        updateContainer();

        // Set up a MutationObserver to watch for DOM changes (in case Gutenberg rebuilds the node)
        const observer = new MutationObserver(updateContainer);
        observer.observe(blockElement, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* Hidden anchor point to find our block in the DOM */}
            <span ref={anchorRef} style={{ display: 'none' }} className="mmm-anchor" />

            {/* Teleport the preview into the native mobile overlay container once found */}
            {targetNode && createPortal(
                <div className="mmm-injected-mobile-menu" style={{ width: '100%', pointerEvents: 'none', opacity: 0.95 }}>
                    <ServerSideRender block="core/template-part" attributes={{ slug }} />
                </div>,
                targetNode
            )}
        </>
    );
};

// 2. Inspector Controls Panel
const MobileMenuPanel = ({ attributes, setAttributes }) => {
    const { templateParts } = useSelect((select) => {
        return {
            templateParts: select('core').getEntityRecords('postType', 'wp_template_part', { per_page: -1 }) || [],
        };
    }, []);

    const templateOptions = [
        { label: __('None', 'mobile-mega-menu'), value: '' },
        ...templateParts.map(part => ({
            label: part.title?.rendered || part.slug,
            value: part.slug
        }))
    ];

    return (
        <InspectorControls>
            <PanelBody title={__('Mobile Menu', 'mobile-mega-menu')} initialOpen={true}>
                <SelectControl
                    label={__('Mobile Menu Template', 'mobile-mega-menu')}
                    value={attributes.mobileMenuSlug || ''}
                    options={templateOptions}
                    onChange={(val) => setAttributes({ mobileMenuSlug: val })}
                />
                <Divider />
                <ToggleControl
                    label={__('Enable Custom Breakpoint', 'mobile-mega-menu')}
                    checked={!!attributes.mobileMenuBreakpointEnabled}
                    onChange={(val) => setAttributes({ mobileMenuBreakpointEnabled: val })}
                />
                {attributes.mobileMenuBreakpointEnabled && (
                    <RangeControl
                        label={__('Breakpoint (px)', 'mobile-mega-menu')}
                        value={attributes.mobileMenuBreakpoint || 600}
                        onChange={(val) => setAttributes({ mobileMenuBreakpoint: val })}
                        min={320}
                        max={1440}
                    />
                )}
                <Divider />
                <BaseControl label={__('Mobile Menu Background', 'mobile-mega-menu')}>
                    <ColorPalette
                        value={attributes.customMobileMenuBackgroundColor || ''}
                        onChange={(val) => setAttributes({ customMobileMenuBackgroundColor: val })}
                        clearable={true}
                    />
                </BaseControl>
                <BaseControl label={__('Mobile Icon Color', 'mobile-mega-menu')}>
                    <ColorPalette
                        value={attributes.customMobileIconColor || ''}
                        onChange={(val) => setAttributes({ customMobileIconColor: val })}
                        clearable={true}
                    />
                </BaseControl>
            </PanelBody>
        </InspectorControls>
    );
};

// 3. Main Block Editor Wrapper
const withMobileMenuControls = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        const isNavBlock = props.name === 'core/navigation';
        const hasTemplateSelected = props.attributes.mobileMenuSlug;

        if (!isNavBlock) {
            return <BlockEdit {...props} />;
        }

        return (
            <>
                <BlockEdit {...props} />

                <MobileMenuPanel
                    attributes={props.attributes}
                    setAttributes={props.setAttributes}
                />

                {hasTemplateSelected && (
                    <>
                        {/* Dynamically inject editor CSS specific to this exact block ID */}
                        <style>{`
                            /* Hide our custom menu by default in the editor */[data-block="${props.clientId}"] .mmm-injected-mobile-menu {
                                display: none !important;
                            }

                            /* WHEN TOGGLED OPEN: Show our custom template part */[data-block="${props.clientId}"] .wp-block-navigation__responsive-container.is-menu-open .mmm-injected-mobile-menu {
                                display: block !important;
                            }

                            /* WHEN TOGGLED OPEN: Hide the native WP links inside the editor */
                            [data-block="${props.clientId}"] .wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-content > .wp-block-navigation__container {
                                display: none !important;
                            }
                        `}</style>

                        {/* Fire up the React Portal to push the preview into the native modal */}
                        <OverlayInjector slug={props.attributes.mobileMenuSlug} />
                    </>
                )}
            </>
        );
    };
}, 'withMobileMenuControls');

addFilter('editor.BlockEdit', 'mobile-mega-menu/with-mobile-menu-controls', withMobileMenuControls);


// 4. Register Custom Attributes
function addNavigationAttributes(settings, name) {
    if (name === 'core/navigation') {
        settings.attributes = {
            ...settings.attributes,
            mobileMenuSlug: { type: 'string', default: '' },
            mobileMenuBreakpointEnabled: { type: 'boolean', default: false },
            mobileMenuBreakpoint: { type: 'number', default: 600 },
            customMobileMenuBackgroundColor: { type: 'string', default: '' },
            customMobileIconColor: { type: 'string', default: '' },
        };
    }
    return settings;
}

addFilter('blocks.registerBlockType', 'mobile-mega-menu/add-navigation-attributes', addNavigationAttributes);
