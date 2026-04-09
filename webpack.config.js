const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'mega-menu/index': path.resolve( process.cwd(), 'src/mega-menu/index.js' ),
		index: path.resolve( process.cwd(), 'src/index.js' ),
	},
};
