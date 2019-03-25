import ImageMarkdownEditing from './ImageMarkdownEditing';
import ImageMarkdownAutoResolve from './ImageMarkdownAutoResolve';
import ImageMarkdownUI from './ImageMarkdownUI';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import '../theme/ImageMarkdown.css';

export default class ImageMarkdown extends Plugin {
	static get requires() {
		return [
			ImageMarkdownEditing,
			ImageMarkdownAutoResolve,
			ImageMarkdownUI,
			Widget
		];
	}

	static get pluginName() {
		return 'ImageMarkdown';
	}
}
