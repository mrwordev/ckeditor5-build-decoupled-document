import Command from '@ckeditor/ckeditor5-core/src/command';

export default class ImageMarkdownCommand extends Command {
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const position = selection.getFirstPosition();
		const selectedMedia = getSelectedImageMarkdownWidget( selection );

		let parent = position.parent;

		if ( parent != parent.root ) {
			parent = parent.parent;
		}

		this.value = selectedMedia ? selectedMedia.getAttribute( 'url' ) : null;
		this.isEnabled = schema.checkChild( parent, 'imagemarkdown' );
	}

	execute( url ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		model.change( writer => {
			const imageElement = writer.createElement(
				'image',
				{
					src: url
				}
			);
			// Insert the image in the current selection location.
			model.insertContent(
				imageElement,
				selection
			);
		} );
	}
}

function getSelectedImageMarkdownWidget( selection ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'imagemarkdown' ) ) {
		return selectedElement;
	}

	return null;
}
