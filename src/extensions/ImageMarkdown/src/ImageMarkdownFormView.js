import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';

import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';
import '../theme/mediaform.css';

export default class ImageMarkdownFormView extends View {
	constructor() {
		super();

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.urlInputView = this._createUrlInput();
		this.saveButtonView = this._createButton( 'Save', checkIcon, 'ck-button-save' );
		this.saveButtonView.type = 'submit';

		this.cancelButtonView = this._createButton( 'Cancel', cancelIcon, 'ck-button-cancel', 'cancel' );
		this._focusables = new ViewCollection();
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'shift + tab',
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-media-form'
				],

				tabindex: '-1'
			},

			children: [
				this.urlInputView,
				this.saveButtonView,
				this.cancelButtonView
			]
		} );
	}

	render() {
		super.render();
		submitHandler( {
			view: this
		} );

		const childViews = [
			this.urlInputView,
			this.saveButtonView,
			this.cancelButtonView
		];
		childViews.forEach( v => {
			this._focusables.add( v );
			this.focusTracker.add( v.element );
		} );

		this.keystrokes.listenTo( this.element );
		const stopPropagation = data => data.stopPropagation();

		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );

		this.listenTo( this.urlInputView.element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
	}

	focus() {
		this._focusCycler.focusFirst();
	}

	get url() {
		return this.urlInputView.inputView.element.value.trim();
	}

	set url( url ) {
		this.urlInputView.inputView.element.value = url.trim();
	}

	isValid() {
		this.resetFormStatus();
		return true;
	}

	resetFormStatus() {
		this.urlInputView.errorText = null;
		this.urlInputView.infoText = this._urlInputViewInfoDefault;
	}

	_createUrlInput() {
		const labeledInput = new LabeledInputView( this.locale, InputTextView );
		const inputView = labeledInput.inputView;

		this._urlInputViewInfoDefault = 'Paste the image URL in the input.';
		this._urlInputViewInfoTip = 'Tip: Paste the URL into the content to embed faster.';

		labeledInput.label = 'Image URL';
		labeledInput.infoText = this._urlInputViewInfoDefault;
		inputView.placeholder = 'https://example.com';

		inputView.on( 'input', () => {
			labeledInput.infoText = inputView.element.value ? this._urlInputViewInfoTip : this._urlInputViewInfoDefault;
		} );

		return labeledInput;
	}

	_createButton( label, icon, className, eventName ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}
}