/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { assign, debounce } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormTextInput from 'components/forms/form-text-input';
import wpcom from 'lib/wp';
import { getSelectedSiteId } from 'state/ui/selectors';

/*
 * Shows the URL and preview of an embed, and allows it to be edited.
 */
export class EmbedDialog extends React.Component {
	static propTypes = {
		embedUrl: PropTypes.string,
		isVisible: PropTypes.bool,

		// Event handlers
		onCancel: PropTypes.func.isRequired,
		onUpdate: PropTypes.func.isRequired,

		// Inherited
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		embedUrl: '',
		isVisible: false,
	};

	state = {
		embedUrl: this.props.embedUrl,
		previewUrl: this.props.embedUrl,
		// might be nice if don't need a second field here, but i think it's introduce extra unnecessary render() calls if only used props.embedUrl
			// might not be needed now that using previewMarkup

		previewMarkup: [],
	};

	componentWillMount() {
		/**
		 * Update the preview of the new embed URL
		 *
		 * @todo: Making an API request directly is a bit of a hack. The ideal solution would be to
		 *        reuse EmbedViewManager/EmbedView, but that leads to misery and resignation. When
		 *        pasting
		 *        a new URL into the input field, all instances of wpcom-views/embed on the screen
		 *        would be refreshed, causing TinyMCE's selection to be unset. Because of that,
		 *        the new URL would be inserted at the beginning of the editor body, rather than
		 *        replacing the old URL. See `p1507898606000351-slack-delta-samus` for more details.
		 */
		this.debouncedUpdateEmbedPreview = debounce( function() {
			this.setState( { previewUrl: this.state.embedUrl } );

			// maybe add a animated loading block so the user gets some visual feedback while they wait for the new embed to load
				// throttle connection to see how bad/long it takes


			// Use cached data if it's available
			if ( this.state.previewMarkup[ this.state.embedUrl ] ) {
				return;
			}

			wpcom.undocumented().site( this.props.siteId ).embeds(
				{ embed_url: this.state.embedUrl },
				( error, data ) => {
					//const { previewMarkup, embedUrl } = this.props;
						// update to use ^^^ instead of writing out this.props each time

					let cachedMarkup;

					if ( data && data.result ) {
						cachedMarkup = data.result;
					} else {
						console.log(error);
							// add details? or just generic error message

						cachedMarkup = 'error foo';

						// todo handle errors (both in xhr in `error` and app layer in `data.error` or whatever
						// make sure data.result exists and is valid
						// unit tests for those. mock the xhr

						// show an error in the preview box if fetching the embed failed / it's an invalid URL
							// right now it just continues showing the last valid preview
							// don't wanna do if they're still typing though. debounce might be enough to fix that, but still could be annoying.
							// need to play with
							//  how to detect from the markup if it was an error? it'll be dependent on the service etc, right?
					}

					this.setState( {
						previewMarkup: assign(
							this.state.previewMarkup,
							{ [ this.state.embedUrl ]: cachedMarkup }
						),
						// merge or other function would be better than assign?
					} );
				}
			);
		}, 500 );
		// this doesn't need to be inside compwillmount? can just be regular function below?

		// Set the initial preview
		this.debouncedUpdateEmbedPreview();
		// maybe do this later in lifecycle?
		// call it immediately instead of debouncing for 500ms?
	}

	/**
	 * Reset `state.embedUrl` whenever the component's dialog is opened or closed.
	 *
	 * If this were not done, then switching back and forth between multiple embeds would result in
	 * `state.embedUrl` being incorrect. For example, when the second embed was opened,
	 * `state.embedUrl` would equal the value of the first embed, since it initially set the
	 * state.
	 *
	 * and previewurl for all the above. update ^^^
	 *
	 * @param {object} nextProps The properties that will be received.
	 */
	componentWillReceiveProps = nextProps => {
		this.setState( {
			embedUrl: nextProps.embedUrl,
			previewUrl: nextProps.embedUrl,
		}, () => {
			// refresh the preview
			this.debouncedUpdateEmbedPreview();
				// call immediately instead of waiting for debounce
				// maybe pass new value directly instead of waiting for setstate?
				// only call if props.isvisible? otherwise calling when closing the dialog, which don't want
		} );

		// this whole flow is getting a little complicated.
		// state is updated here, updated in the debounced function, maybe other places. and the functions are dependent on whether or not the state has been updated, etc.`
		// try to simplify everything
	};

	onChangeEmbedUrl = event => {
		this.setState( { embedUrl: event.target.value }, () => {
			this.debouncedUpdateEmbedPreview();
			// i think this should wait until state is updated, b/c debounced function expected this.state.embedurl to have been updated when its called
			// it seems to work being called immediately, but that could just be b/c fast enough to usually win race condition?
			// alternate might be to pass the new url as param, instead of waiting. that might be better
		} );

		// the focus is jumping back to the start of the editor, probably caused by the selection problem described in debouncedUpdateEmbedPreview()
		// once that's fixed, test to make sure it goes back to the selected view like it should

		//event.target.focus();
			//todo hack to avoid focus stealiing
			// this might have performance issues, but probably not if this entire function is debounced?
				// see https://github.com/Automattic/wp-calypso/pull/17152#discussion_r142263113
			// don't even need this anymore?
	};

	onUpdate = () => {
		this.props.onUpdate( this.state.embedUrl );
	};

	onKeyDownEmbedUrl = event => {
		if ( 'Enter' !== event.key ) {
			return;
		}

		event.preventDefault();
		this.onUpdate();
	};

	render() {
		const { translate } = this.props;
		const dialogButtons = [
			<Button onClick={ this.props.onCancel }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.onUpdate }>
				{ translate( 'Update' ) }
			</Button>,
		];

		return (
			<Dialog
				autoFocus={ false }
				buttons={ dialogButtons }
				additionalClassNames="embed__modal"
				isVisible={ this.props.isVisible }
				onCancel={ this.props.onCancel }
				onClose={ this.props.onCancel }
			>
				<h3 className="embed__title">{ translate( 'Embed URL' ) }</h3>

				<FormTextInput
					autoFocus={ true }
					className="embed__url"
					defaultValue={ this.state.embedUrl }
					onChange={ this.onChangeEmbedUrl }
					onKeyDown={ this.onKeyDownEmbedUrl }
				/>

				{/* This is safe because previewMarkup comes from our API endpoint */}
					{/* are you sure that makes it safe? */}
				<div className="embed__preview" dangerouslySetInnerHTML={ { __html: this.state.previewMarkup[ this.state.previewUrl ] } } />


				{/*
				html should be safe, but really wanna put it inside sandboxed iframe just to be cautious

				<iframe className="embed__preview" srcdoc={ this.state.previewMarkup[ this.state.previewUrl ] } />
				can't set iframe content inside tag, have to use srcdoc attribute, but react strips it out or something?
				have to set it via js like ResizableIframe does?
				maybe try again to just use EmbedView, even if you have to modify it to accept a url prop or something

				sandbox everything except allow-scripts?

				figure out better way than dangerouslysetinnerhtml?
				should put it inside an iframe
				can maybe use EmbedView but not EmbedViewManager?
				get security review
				*/}
			</Dialog>
		);

		{/*
			do we have any non-video embeds? if so, test those too

			exception thrown when change it twice in a row. - only in FF
				maybe related to needing to debounce?

			Warning: unmountComponentAtNode(): The node you're attempting to unmount was rendered by another copy of React.
				wrapConsole/<
				app:///./client/components/webpack-build-monitor/index.jsx:174:3
				printWarning
				app:///./node_modules/fbjs/lib/warning.js:35:7
				warning
				app:///./node_modules/fbjs/lib/warning.js:59:7
				unmountComponentAtNode
				app:///./node_modules/react-dom/lib/ReactMount.js:443:15
				wpview/</<
		   >>>	app:///./client/components/tinymce/plugins/wpcom-view/plugin.js:287:5
				...
			*/}
	}
}

const connectedLocalizedEmbedDialog = connect( ( state, { siteId } ) => {
	siteId = siteId ? siteId : getSelectedSiteId( state );

	return { siteId };
} )( localize( EmbedDialog ) );

export default localize( connectedLocalizedEmbedDialog );
