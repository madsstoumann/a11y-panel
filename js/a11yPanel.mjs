/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

/**
 * A11y Panel.
 * @module a11yPanel.mjs
 * @version 0.1.6
 * @summary 08-10-2019
 * @author Mads Stoumann
 * @description Accessibility Settings-panel: Adjust brightness, contrast, color-modes and more.
 */

export default class A11yPanel {
	constructor(wrapper, settings) {
		this.settings = Object.assign(
			{
				clsBody: 'a11y__body',
				clsBodyAll: 'a11y--all',
				clsClose: 'a11y-panel__close',
				clsDialog: 'a11y-panel',
				clsFocusable: 'a11y--focus',
				clsForm: 'a11y-panel__form',
				clsRoot: 'a11y',

				labelApply: 'Apply to images, or',
				labelBrightness: 'Brightness',
				labelClose: '&#10005;',
				labelColorMode: 'Color mode',
				labelContrast: 'Contrast',
				labelDefault: 'Default',
				labelFocusable: 'Tab-stops',
				labelFocusableHeader: 'Highlight',
				labelFontsize: 'Fontsize',
				labelGrayscale: 'Grayscale',
				labelAllContent: 'All content',
				labelInverted: 'Inverted',
				labelReset: 'Reset',
				labelSave: 'Save',
				labelZoom: 'Zoom',

				maxBrightness: 200,
				minBrightness: 0,
				valueBrightness: 100,

				maxContrast: 200,
				minContrast: 0,
				valueContrast: 100,

				maxFontsize: 300,
				minFontsize: 100,
				valueFontsize: 100,

				maxZoom: 300,
				minZoom: 100,
				valueZoom: 100,

				expiresAfter: 86400000,

				showApplyImages: true,
				showBrightness: true,
				showColorMode: true,
				showContrast: true,
				showFocusable: false,
				showFontsize: false,
				showZoom: false
			},
			this.datasetToObject(settings)
		);

		this.dialogSupported = typeof HTMLDialogElement === 'function';
		this.wrapper = wrapper;
		this.toggle = wrapper.firstElementChild;
		this.isEdge = /Edge/.test(navigator.userAgent);
		this.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
		if (this.isIE11) {
			wrapper.parentNode.removeChild(wrapper);
		}
		else {
			this.initState();
			this.init();
		}
	}

	/**
	 * @function datasetToObject
	 * @param {Object} dataset
	 * @description Convert a DOM node dataset to object with type convertions
	 */
	datasetToObject(dataset) {
		let obj = Object.assign({}, dataset);
		Object.keys(obj).forEach(key => {
			let val = obj[key];
			try {
				val = JSON.parse(val);
			} catch (err) {}
			obj[key] = val;
		});
		return obj;
	}

	/**
	 * @function init
	 * @description Create DOM-nodes, add event-listeners
	 */
	init() {
		/* Add info to all focusable items */
		this.focusable = document.querySelectorAll(
			'button, a[href], select, textarea, input:not([type="hidden"])'
		);
		this.focusable.forEach((item, index) => {
			item.dataset.focus = index;
			item.classList.add(this.settings.clsFocusable);
		});

		/* Create panel elements */
		this.close = document.createElement('button');
		this.close.classList.add(this.settings.clsClose);
		this.close.innerHTML = this.settings.labelClose;
		this.close.addEventListener('click', () => this.toggleDialog(false));

		this.form = document.createElement('form');
		this.form.classList.add(this.settings.clsForm);
		this.form.innerHTML = this.template();
		this.form.addEventListener('change', event => this.stateChange(event));
		this.form.addEventListener('reset', () => this.reset());
		this.form.addEventListener('submit', event => {
			event.preventDefault();
			this.save();
			this.toggleDialog(false);
		});

		this.dialog = document.createElement('dialog');
		this.dialog.classList.add(this.settings.clsDialog);
		this.dialog.appendChild(this.close);
		this.dialog.appendChild(this.form);
		this.dialog.addEventListener('close', () => this.dialog.close());

		this.toggle.addEventListener('click', () => {
			this.toggleDialog(true);
		});

		this.wrapper.appendChild(this.dialog);

		document.documentElement.classList.add(this.settings.clsRoot);
		document.body.classList.add(this.settings.clsBody);
		document.addEventListener('keydown', event => {
			switch (event.key) {
				case '?':
					if (event.getModifierState('Shift')) {
						this.toggleDialog(true);
					}
					break;
				case 'Escape':
					this.toggleDialog(false);
					break;
				default:
			}
		});

		this.load();
	}

	/**
	 * @function initState
	 * @description Init local state
	 */
	initState() {
		this.state = {
			allContent: false,
			brightness: this.settings.valueBrightness,
			colorMode: 0,
			contrast: this.settings.valueContrast,
			focusable: 0,
			fontsize: this.settings.valueFontsize,
			timestamp: new Date().getTime(),
			zoom: this.settings.valueZoom
		};
	}

	/**
	 * @function load
	 * @description Load settings from localStorage
	 */
	load() {
		try {
			const state = JSON.parse(window.localStorage.getItem('a11ypanel'));
			if (state) {
				/* Check timestamp, make sure to clear panel after a day */
				const timestamp = state.hasOwnProperty('timestamp')
					? state.timestamp
					: 0;

				if (this.state.timestamp - this.settings.expiresAfter > timestamp) {
					throw new Error('Timestamp too old: Cleaning up');
				}

				this.state = state;

				const content = this.form['a11y-panel-allContent'];
				if (content) {
					content.checked = this.state.allContent;
				}
				const brightness = this.form['a11y-panel-brightness'];
				if (brightness) {
					brightness.value = this.state.brightness;
				}

				const contrast = this.form['a11y-panel-contrast'];
				if (contrast) {
					contrast.value = this.state.contrast;
				}

				const focusable = this.form['a11y-panel-focusable'];
				if (focusable) {
					focusable.checked = this.state.focusable === 1;
				}

				const fontsize = this.form['a11y-panel-fontsize'];
				if (fontsize) {
					fontsize.value = this.state.fontsize;
				}

				const zoom = this.form['a11y-panel-zoom'];
				if (zoom) {
					zoom.value = this.state.zoom;
				}

				this.form.elements.colormode.value = this.state.colorMode;
				this.setProperties();
			}
		} catch (err) {
			window.localStorage.removeItem('a11ypanel');
		}
	}

	/**
	 * @function reset
	 * @description Resets values to defaults
	 */
	reset() {
		this.initState();
		this.setProperties();
	}

	/**
	 * @function save
	 * @description Save current state to localStorage
	 */
	save() {
		window.localStorage.setItem('a11ypanel', JSON.stringify(this.state));
	}

	/**
	 * @function setProperty
	 * @description Helper-function for setting a custom CSS property
	 * @param {String} property
	 * @param {String | Number} value
	 * @param {String} [suffix]
	 */
	setProperty(property, value, suffix = '') {
		document.documentElement.style.setProperty(
			`--${property}`,
			`${value}${suffix}`
		);
	}

	/**
	 * @function setProperties
	 * @description Updates CSS Custom properties with state
	 */
	setProperties() {
		this.setProperty('brightness', this.state.brightness, '%');
		this.setProperty('contrast', this.state.contrast, '%');
		this.setProperty('focusable', this.state.focusable);
		this.setProperty('fontsize', this.state.fontsize, '%');
		this.setProperty('grayscale', this.state.colorMode === 2 ? 1 : 0);
		this.setProperty('invert', this.state.colorMode === 1 ? 1 : 0);
		this.setProperty('zoom', this.state.zoom, '%');
		document.body.classList.toggle(
			this.settings.clsBodyAll,
			this.state.allContent
		);
	}

	/**
	 * @function stateChange
	 * @description Triggers whenever an element within the a11y-form changes state/value
	 * @param {Event} event
	 */
	stateChange(event) {
		const target = event.target;
		const value = target.value - 0;

		switch (target.dataset.state) {
			case 'allContent':
				this.state.allContent = target.checked;
				break;
			case 'brightness':
				this.state.brightness = value;
				break;
			case 'contrast':
				this.state.contrast = value;
				break;
			case 'colorMode':
				this.state.colorMode = value;
				break;
			case 'focusable':
				this.state.focusable = target.checked ? 1 : 0;
				break;
			case 'fontsize':
				this.state.fontsize = value;
				break;
			case 'zoom':
				this.state.zoom = value;
				break;
			default:
				break;
		}
		this.setProperties();
	}

	/**
	 * @function template
	 * @description Renders the inner part of the a11y-panel
	 */
	template() {
		return `
		${
			this.settings.showContrast
				? `
		<div class="a11y-panel-field">
			<label class="a11y-panel-field__label o-icon__label o-icon--contrast" for="a11y-panel-contrast">
				<strong class="a11y-panel-field__label-text">${
					this.settings.labelContrast
				}</strong>
			</label>
			<input
				autofocus
				class="a11y-panel-field__range${this.isEdge ? '--edge' : ''}"
				data-state="contrast"
				id="a11y-panel-contrast"
				min="${this.settings.minContrast}"
				max="${this.settings.maxContrast}"
				type="range"
				value="${this.settings.valueContrast}"
				/>
		</div>`
				: ''
		}
		${
			this.settings.showBrightness
				? `
		<div class="a11y-panel-field">
			<label class="a11y-panel-field__label o-icon__label o-icon--brightness" for="a11y-panel-brightness">
				<strong class="a11y-panel-field__label-text">${
					this.settings.labelBrightness
				}</strong>
			</label>
			<input
				class="a11y-panel-field__range${this.isEdge ? '--edge' : ''}"
				data-state="brightness"
				id="a11y-panel-brightness"
				min="${this.settings.minBrightness}"
				max="${this.settings.maxBrightness}"
				type="range"
				value="${this.settings.valueBrightness}"
			/>
		</div>`
				: ''
		}
		${
			this.settings.showApplyImages
				? `
		<div class="a11y-panel-field--noborder">
			<fieldset class="a11y-panel-field__group">
				<legend class="a11y-panel-field__legend a11y-panel-field__label">
					<strong class="a11y-panel-field__label-text">${this.settings.labelApply}</strong>
				</legend>
				<label class="a11y-panel-field__checkbox a11y-panel-field__checkbox--switch">
					<input type="checkbox" id="a11y-panel-allContent" class="u-visually-hidden" data-state="allContent" />
					<span class="a11y-panel-field__group-item a11y-panel-field__checkbox-text">${this.settings.labelAllContent}</span>
				</label>
			</fieldset>
		</div>`
				: ''
		}
		${
			this.settings.showFontsize
				? `
		<div class="a11y-panel-field">
			<label class="a11y-panel-field__label o-icon__label o-icon--fontsize" for="a11y-panel-fontsize">
				<strong class="a11y-panel-field__label-text">${
					this.settings.labelFontsize
				}</strong>
			</label>
			<input
				class="a11y-panel-field__range${this.isEdge ? '--edge' : ''}"
				data-state="fontsize"
				id="a11y-panel-fontsize"
				min="${this.settings.minFontsize}"
				max="${this.settings.maxFontsize}"
				type="range"
				value="${this.settings.valueFontsize}"
			/>
		</div>`
				: ''
		}
		${
			this.settings.showZoom
				? `
		<div class="a11y-panel-field">
			<label class="a11y-panel-field__label o-icon__label o-icon--zoom" for="a11y-panel-zoom">
				<strong class="a11y-panel-field__label-text">${
					this.settings.labelZoom
				}</strong>
			</label>
			<input
				class="a11y-panel-field__range${this.isEdge ? '--edge' : ''}"
				data-state="zoom"
				id="a11y-panel-zoom"
				min="${this.settings.minZoom}"
				max="${this.settings.maxZoom}"
				type="range"
				value="${this.settings.valueZoom}"
			/>
		</div>`
				: ''
		}
		${
			this.settings.showColorMode
				? `
		<div class="a11y-panel-field  a11y-panel-field--noborder">
			<fieldset class="a11y-panel-field__group">
				<legend class="a11y-panel-field__legend a11y-panel-field__label">
						<strong class="a11y-panel-field__label-text">${this.settings.labelColorMode}</strong>
				</legend>
				<label class="a11y-panel-field__radio">
						<input type="radio" name="colormode" class="u-visually-hidden" value="0" data-state="colorMode" checked />
						<span class="a11y-panel-field__group-item a11y-panel-field__radio-text">${this.settings.labelDefault}</span>
				</label>
				<label class="a11y-panel-field__radio">
						<input type="radio" name="colormode" class="u-visually-hidden" value="1" data-state="colorMode" />
						<span class="a11y-panel-field__group-item a11y-panel-field__radio-text">${this.settings.labelInverted}</span>
				</label>
				<label class="a11y-panel-field__radio">
						<input type="radio" name="colormode" class="u-visually-hidden" value="2" data-state="colorMode" />
						<span class="a11y-panel-field__group-item a11y-panel-field__radio-text">${this.settings.labelGrayscale}</span>
				</label>
			</fieldset>
		</div>`
				: ''
		}
		${
			this.settings.showFocusable
				? `
		<div class="a11y-panel-field--noborder">
			<fieldset class="a11y-panel-field__group">
				<legend class="a11y-panel-field__legend a11y-panel-field__label">
					<strong class="a11y-panel-field__label-text">${this.settings.labelFocusableHeader}</strong>
				</legend>
				<label class="a11y-panel-field__checkbox a11y-panel-field__checkbox--switch">
					<input type="checkbox" id="a11y-panel-focusable" class="u-visually-hidden" data-state="focusable" />
					<span class="a11y-panel-field__group-item a11y-panel-field__checkbox-text">${this.settings.labelFocusable}</span>
				</label>
			</fieldset>
		</div>`
				: ''
		}
		<nav class="a11y-panel__buttons">
			<button type="reset" class="a11y-panel__reset">${
				this.settings.labelReset
			}</button>
			<button type="submit" class="a11y-panel__save">${
				this.settings.labelSave
			}</button>
		</nav>
		`;
	}

	/**
	 * @function toggleDialog
	 * @description Open/Close the a11y-panel
	 * @param {Boolean} open
	 */
	toggleDialog(open) {
		if (open) {
			this.active = document.activeElement;
			this.toggle.setAttribute('aria-expanded', true);
			if (!this.dialogSupported) {
				this.dialog.setAttribute('open', 'open');
				return;
			}
			this.dialog.showModal();
		} else {
			this.toggle.setAttribute('aria-expanded', false);
			if (!this.dialogSupported) {
				this.dialog.removeAttribute('open');
				return;
			}
			this.dialog.close();
			this.active.focus();
		}
	}
}
