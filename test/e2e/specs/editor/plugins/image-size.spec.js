/**
 * External dependencies
 */
const path = require( 'path' );

/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'changing image size', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activatePlugin( 'gutenberg-test-image-size' );
		await requestUtils.deleteAllMedia();
	} );

	test.afterEach( async ( { requestUtils } ) => {
		await requestUtils.deleteAllMedia();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deactivatePlugin( 'gutenberg-test-image-size' );
	} );

	test( 'should insert and change my image size', async ( {
		page,
		pageUtils,
		requestUtils,
	} ) => {
		const filename = '1024x768_e2e_test_image_size.jpeg';
		const filepath = path.join( './test/e2e/assets', filename );

		await pageUtils.createNewPost();
		const media = await requestUtils.uploadMedia( filepath );

		await pageUtils.insertBlock( {
			name: 'core/image',
			attributes: {
				// Specify alt text so that it can be queried by role selectors.
				alt: filename,
				id: media.id,
				url: media.source_url,
			},
		} );

		// Select the new size updated with the plugin.
		await pageUtils.openDocumentSettingsSidebar();
		await page.selectOption( 'role=combobox[name="Image size"i]', {
			label: 'Custom Size One',
		} );

		// Verify that the custom size was applied to the image.
		await expect(
			page.locator( `role=img[name="${ filename }"]` )
		).toHaveCSS( 'width', '499px' );
		await expect(
			page.locator( 'role=spinbutton[name="Width"i]' )
		).toHaveValue( '499' );
	} );
} );
