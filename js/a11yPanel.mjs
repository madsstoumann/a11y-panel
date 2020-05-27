/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

/**
 * A11y Panel.
 * @module a11yPanel.mjs
 * @version 0.3.0
 * @summary 10-03-2020
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
				clsToggle: 'a11y-panel__toggle',

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

		this.config = {};
		this.elements = {};
		this.config.dialogSupported = typeof HTMLDialogElement === 'function';
		this.elements.wrapper = wrapper;
		this.elements.toggle = document.querySelector(`.${this.settings.clsToggle}`) || wrapper.firstElementChild;
		this.config.isEdge = /Edge/.test(navigator.userAgent);
		this.config.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

		/* Delete instance/self if Internet Explorer */
		if (this.config.isIE11) {
			wrapper.parentNode.removeChild(wrapper);
		}
		else {
			this.initState();
			this.init();
		}
		console.log(this);
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
		/* Add index to all focusable items */
		this.focusable = document.querySelectorAll(
			'button, a[href], select, textarea, input:not([type="hidden"])'
		);
		this.focusable.forEach((item, index) => {
			item.dataset.focus = index;
			item.classList.add(this.settings.clsFocusable);
		});

		/* Create panel elements, add eventListeners */
		this.elements.close = document.createElement('button');
		this.elements.close.classList.add(this.settings.clsClose);
		this.elements.close.innerHTML = this.settings.labelClose;
		this.elements.close.addEventListener('click', () => this.toggleDialog(false));

		this.elements.form = document.createElement('form');
		this.elements.form.classList.add(this.settings.clsForm);
		this.elements.form.innerHTML = this.template();
		this.elements.form.addEventListener('change', event => this.stateChange(event));
		this.elements.form.addEventListener('reset', () => this.reset());
		this.elements.form.addEventListener('submit', event => {
			event.preventDefault();
			this.save();
			this.toggleDialog(false);
		});

		this.elements.dialog = document.createElement('dialog');
		this.elements.dialog.classList.add(this.settings.clsDialog);
		this.elements.dialog.appendChild(this.elements.close);
		this.elements.dialog.appendChild(this.elements.form);
		this.elements.dialog.addEventListener('close', () => this.elements.dialog.close());

		this.elements.toggle.addEventListener('click', () => {
			this.toggleDialog(true);
		});

		this.elements.wrapper.appendChild(this.elements.dialog);

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
				const timestamp = state.hasOwnProperty('timestamp') ? state.timestamp : 0;

				if (this.state.timestamp - this.settings.expiresAfter > timestamp) {
					throw new Error('Timestamp too old: Cleaning up');
				}

				this.state = state;

				const content = this.elements.form['a11y-panel-allContent'];
				if (content) {
					content.checked = this.state.allContent;
				}
				const brightness = this.elements.form['a11y-panel-brightness'];
				if (brightness) {
					brightness.value = this.state.brightness;
				}

				const contrast = this.elements.form['a11y-panel-contrast'];
				if (contrast) {
					contrast.value = this.state.contrast;
				}

				const focusable = this.elements.form['a11y-panel-focusable'];
				if (focusable) {
					focusable.checked = this.state.focusable === 1;
				}

				const fontsize = this.elements.form['a11y-panel-fontsize'];
				if (fontsize) {
					fontsize.value = this.state.fontsize;
				}

				const zoom = this.elements.form['a11y-panel-zoom'];
				if (zoom) {
					zoom.value = this.state.zoom;
				}

				this.elements.form.elements.colormode.value = this.state.colorMode;
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
			`--${property}`, `${value}${suffix}`
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
		${this.settings.showContrast ?
			this.tmplInputRange(
			{
				id: 'a11y-panel-contrast',
				label: this.settings.labelContrast,
				state: 'contrast',
				value: this.settings.valueContrast,
				icon: 'o-icon--contrast',
				min: this.settings.minContrast,
				max: this.settings.maxContrast
			}) : ''
		}

		${this.settings.showBrightness ?
			this.tmplInputRange(
			{
				id: 'a11y-panel-brightness',
				label: this.settings.labelBrightness,
				state: 'brightness',
				value: this.settings.valueBrightness,
				icon: 'o-icon--brightness',
				min: this.settings.minBrightness,
				max: this.settings.maxBrightness
			}): ''
		}

		${this.settings.showApplyImages ?
			this.tmplInputCheckbox(
			{
				id: 'a11y-panel-allContent',
				label: this.settings.labelApply,
				state: 'allContent',
				value: this.settings.labelAllContent
			}): ''
		}

		${this.settings.showFontsize ? 
			this.tmplInputRange(
			{
				id: 'a11y-panel-fontsize',
				label: this.settings.labelFontsize,
				state: 'fontsize',
				value: this.settings.valueFontsize,
				icon: 'o-icon--fontsize',
				min: this.settings.minFontsize,
				max: this.settings.maxFontsize
			}) : ''
		}

		${this.settings.showZoom ?
			this.tmplInputRange(
			{
				id: 'a11y-panel-zoom',
				label: this.settings.labelZoom,
				state: 'zoom',
				value: this.settings.valueZoom,
				icon: 'o-icon--zoom',
				min: this.settings.minZoom,
				max: this.settings.maxZoom
			}) : ''
		}

		${this.settings.showColorMode ?
			this.tmplInputRadio(
			{
				elements: [
					{ label: this.settings.labelDefault },
					{ label: this.settings.labelInverted },
					{ label: this.settings.labelGrayscale }
				],
				group: 'colormode',
				groupHeader: this.settings.labelColorMode,
				state: 'colorMode'
			})  : ''
		}

		${this.settings.showFocusable ?
			this.tmplInputCheckbox(
			{
				id: 'a11y-panel-focusable',
				label: this.settings.labelFocusableHeader,
				state: 'focusable',
				value: this.settings.labelFocusable
			}) : ''
		}

		<nav class="a11y-panel__buttons">
			<button type="reset" class="a11y-panel__reset">${this.settings.labelReset}</button>
			<button type="submit" class="a11y-panel__save">${this.settings.labelSave}</button>
		</nav>
		`;
	}

	/**
	 * @function tmplInputCheckbox
	 * @description Renders an input checkbox/switch
	*/
	tmplInputCheckbox(args) {
		return `
		<div class="a11y-panel-field--noborder">
			<fieldset class="a11y-panel-field__group">
				<legend class="a11y-panel-field__legend a11y-panel-field__label">
					<strong class="a11y-panel-field__label-text">${args.label}</strong>
				</legend>
				<label class="a11y-panel-field__checkbox a11y-panel-field__checkbox--switch">
					<input type="checkbox" id="${args.id}" class="u-visually-hidden" data-state="${args.state}" />
					<span class="a11y-panel-field__group-item a11y-panel-field__checkbox-text">${args.value}</span>
				</label>
			</fieldset>
		</div>`
	}

	/**
	 * @function tmplInputRadio
	 * @description Renders an input radio-group
	*/
	tmplInputRadio(args) {
		return `
		<div class="a11y-panel-field  a11y-panel-field--noborder">
			<fieldset class="a11y-panel-field__group">
				<legend class="a11y-panel-field__legend a11y-panel-field__label">
						<strong class="a11y-panel-field__label-text">${args.groupHeader}</strong>
				</legend>
				${args.elements.map((element, index) => `
				<label class="a11y-panel-field__radio">
						<input type="radio" name="${args.group}" class="u-visually-hidden" value="${index}" data-state="${args.state}" checked />
						<span class="a11y-panel-field__group-item a11y-panel-field__radio-text">${element.label}</span>
				</label>`).join('')}
			</fieldset>
		</div>`
	}

	/**
	 * @function tmplInputRange
	 * @description Renders an input range-control
	*/
	tmplInputRange(args) {
		return `
		<div class="a11y-panel-field">
			<label class="a11y-panel-field__label ${args.icon || ''}" for="${args.id}">
				<strong class="a11y-panel-field__label-text">${args.label}</strong>
			</label>
			<input
				class="a11y-panel-field__range${this.config.isEdge ? '--edge' : ''}"
				data-state="${args.state}"
				id="${args.id}"
				min="${args.min}"
				max="${args.max}"
				type="range"
				value="${args.value}"
			/>
		</div>`
	}

	/**
	 * @function toggleDialog
	 * @description Open/Close the a11y-panel
	 * @param {Boolean} open
	 */
	toggleDialog(open) {
		if (open) {
			this.elements.active = document.activeElement;
			this.elements.toggle.setAttribute('aria-expanded', true);
			if (!this.config.dialogSupported) {
				this.dialog.setAttribute('open', 'open');
				return;
			}
			this.elements.dialog.showModal();
		} else {
			this.elements.toggle.setAttribute('aria-expanded', false);
			if (!this.config.dialogSupported) {
				this.elements.dialog.removeAttribute('open');
				return;
			}
			this.elements.dialog.close();
			this.elements.active.focus();
		}
	}
}
