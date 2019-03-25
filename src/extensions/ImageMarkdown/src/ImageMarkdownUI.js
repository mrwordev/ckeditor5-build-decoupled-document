import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ImageMarkdownFormView from './ImageMarkdownFormView';
import ImageMarkdownEditing from './ImageMarkdownEditing';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

export default class ImageMarkdownUI extends Plugin {

	static get requires() {
		return [ ImageMarkdownEditing ];
	}

	static get pluginName() {
		return 'ImageMarkdownUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageMarkdown' );

		this.form = new ImageMarkdownFormView();
		editor.ui.componentFactory.add( 'imageMarkdown', locale => {
			const dropdown = createDropdown( locale );
			this._setUpDropdown( dropdown, this.form, command, editor );
			this._setUpForm( this.form, dropdown, command );
			return dropdown;
		} );
	}

	_setUpDropdown( dropdown, form, command ) {
		const editor = this.editor;
		const t = editor.t;
		const button = dropdown.buttonView;

		dropdown.bind( 'isEnabled' ).to( command );
		dropdown.panelView.children.add( form );

		button.set( {
			label: t( 'Insert media' ),
			icon: imageIcon,
			tooltip: true
		} );

		button.on( 'open', () => {
			form.url = command.value || '';
			form.urlInputView.select();
			form.focus();
		}, { priority: 'low' } );

		dropdown.on( 'submit', () => {
			if ( form.isValid() ) {
				editor.execute( 'imageMarkdown', form.url );
				closeUI();
			}
		} );

		dropdown.on( 'change:isOpen', () => form.resetFormStatus() );
		dropdown.on( 'cancel', () => closeUI() );

		function closeUI() {
			editor.editing.view.focus();
			dropdown.isOpen = false;
		}
	}

	_setUpForm( form, dropdown, command ) {
		form.delegate( 'submit', 'cancel' ).to( dropdown );
		form.urlInputView.bind( 'value' ).to( command, 'value' );
		form.urlInputView.bind( 'isReadOnly' ).to( command, 'isEnabled', value => !value );
		form.saveButtonView.bind( 'isEnabled' ).to( command );
	}
}
