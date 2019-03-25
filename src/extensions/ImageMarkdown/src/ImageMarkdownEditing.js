import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ImageMarkdownCommand from './ImageMarkdownCommand';

import '../theme/mediaembedediting.css';

export default class ImageMarkdownEditing extends Plugin {
	static get pluginName() {
		return 'ImageMarkdownEditing';
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		editor.commands.add( 'imageMarkdown', new ImageMarkdownCommand( editor ) );

		schema.register( 'imagemarkdown', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'url' ]
		} );
	}
}
