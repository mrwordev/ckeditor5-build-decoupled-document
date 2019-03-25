/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/automediaembed
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import LiveRange from '@ckeditor/ckeditor5-engine/src/model/liverange';
import LivePosition from '@ckeditor/ckeditor5-engine/src/model/liveposition';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;

export default class ImageMarkdownAutoResolve extends Plugin {
	static get requires() {
		return [
			Clipboard,
			Undo
		];
	}

	static get pluginName() {
		return 'ImageMarkdownAutoResolve';
	}

	constructor(
		editor
	) {
		super(
			editor
		);

		this._timeoutId = null;
		this._positionToInsert = null;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this
			.editor;
		const modelDocument =
			editor
				.model
				.document;

		this.listenTo(
			editor.plugins.get(
				Clipboard
			),
			'inputTransformation',
			() => {
				const firstRange = modelDocument.selection.getFirstRange();

				const leftLivePosition = LivePosition.fromPosition(
					firstRange.start
				);
				leftLivePosition.stickiness =
					'toPrevious';

				const rightLivePosition = LivePosition.fromPosition(
					firstRange.end
				);
				rightLivePosition.stickiness =
					'toNext';

				modelDocument.once(
					'change:data',
					() => {
						this._embedMediaBetweenPositions(
							leftLivePosition,
							rightLivePosition
						);

						leftLivePosition.detach();
						rightLivePosition.detach();
					},
					{
						priority:
							'high'
					}
				);
			}
		);

		editor.commands
			.get(
				'undo'
			)
			.on(
				'execute',
				() => {
					if (
						this
							._timeoutId
					) {
						global.window.clearTimeout(
							this
								._timeoutId
						);
						this._positionToInsert.detach();

						this._timeoutId = null;
						this._positionToInsert = null;
					}
				},
				{
					priority:
						'high'
				}
			);
	}

	_embedMediaBetweenPositions(
		leftPosition,
		rightPosition
	) {
		const editor = this
			.editor;
		const urlRange = new LiveRange(
			leftPosition,
			rightPosition
		);
		const walker = urlRange.getWalker(
			{
				ignoreElementEnd: true
			}
		);

		let url =
			'';

		for ( const node of walker ) {
			if (
				node.item.is(
					'textProxy'
				)
			) {
				url +=
					node
						.item
						.data;
			}
		}

		url = url.trim();
		if (
			!url.match(
				URL_REGEXP
			)
		) {
			return;
		}

		const mediaEmbedCommand = editor.commands.get(
			'imageMarkdown'
		);
		if (
			!mediaEmbedCommand.isEnabled
		) {
			return;
		}

		this._positionToInsert = LivePosition.fromPosition(
			leftPosition
		);
		this._timeoutId = global.window.setTimeout(
			() => {
				editor.model.change(
					writer => {
						this._timeoutId = null;

						writer.remove(
							urlRange
						);
						let insertionPosition;

						if (
							this
								._positionToInsert
								.root
								.rootName !==
							'$graveyard'
						) {
							insertionPosition = this
								._positionToInsert;
						}
						insertMedia(
							editor.model,
							url,
							insertionPosition
						);
						this._positionToInsert.detach();
						this._positionToInsert = null;
					}
				);
			},
			100
		);
	}
}

function insertMedia( model, url, insertPosition ) {
	model.change(
		writer => {
			const imageElement = writer.createElement(
				'image',
				{
					src: url
				}
			);
			model.insertContent(
				imageElement,
				insertPosition
			);
			writer.setSelection(
				imageElement,
				'on'
			);
		}
	);
}
