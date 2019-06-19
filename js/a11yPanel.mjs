/**
 * A11y Panel.
 * @module a11yPanel.mjs
 * @version 0.1.1
 * @author Mads Stoumann
 * @description Accessibility Settings-panel: Adjust brightness, contrast, color-modes and more.
 * TODO: TEST IN ALL BROWSERS
 * TODO: Mobile panbel with scroll
 */

export default class A11yPanel {
  constructor(wrapper, settings) {
    this.settings = Object.assign(
      {
        clsBody: 'a11y',
        clsBodyAll: 'a11y--all',
        clsClose: 'a11y-panel__close',
        clsDialog: 'a11y-panel',
        clsForm: 'a11y-panel__form',

        labelApply: 'Apply to images, or',
        labelBrightness: 'Brightness',
        labelClose: '&#10005;',
        labelColorMode: 'Color mode',
        labelContrast: 'Contrast',
        labelDefault: 'Default',
        labelGrayscale: 'Grayscale',
        labelAllContent: 'All content',
        labelInverted: 'Inverted',
        labelReset: 'Reset',
        labelSave: 'Save',
        labelZoomBrowser:
          'Use <kbd>Ctrl+</kbd> to zoom in and <kbd>Ctrl-</kbd> to zoom out.',
        labelZoomLevel: 'Current Zoom-level',

        maxBrightness: 200,
        minBrightness: 0,
        optionsBrightness: 5,
        valueBrightness: 100,

        maxContrast: 200,
        minContrast: 0,
        optionsContrast: 5,
        valueContrast: 100
      },
      settings
    );

    this.currentZoomLevel = 100;
    this.dialogSupported = typeof HTMLDialogElement === 'function';
    this.wrapper = wrapper;
    this.toggle = wrapper.firstElementChild;
    this.initState();
    this.init();
  }

  /**
   * @function createOptions
   * @description Adds optiosn to a <datalist>
   * @param {Number} total
   * @param {Number} min
   * @param {Number} max
   */
  createOptions(total, min, max) {
    return new Array(total + 1)
      .fill(undefined)
      .map(
        (option, index) => `<option>${((max - min) / total) * index}</option>`
      )
      .join('');
  }

  /**
   * @function getZoomLevel
   * @description Returns current zoomLevel
   */
  getZoomLevel() {
    if (this.zoomLevel) {
      this.zoomLevel.innerText = Math.round(window.devicePixelRatio * 100);
    }
  }

  /**
   * @function init
   * @description Create DOM-nodes, add event-listeners
   */
  init() {
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
    });

    this.zoomLevel = this.form.querySelector('[data-zoom-level]');
    this.dialog = document.createElement('dialog');
    this.dialog.classList.add(this.settings.clsDialog);
    this.dialog.appendChild(this.close);
    this.dialog.appendChild(this.form);
    this.dialog.addEventListener('close', () => this.dialog.close());

    this.toggle.addEventListener('click', () => {
      this.toggleDialog(true);
    });

    this.wrapper.appendChild(this.dialog);

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
    window.addEventListener('resize', () => this.getZoomLevel());
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
      contrast: this.settings.valueContrast
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
        this.state = state;
        this.form['a11y-panel-brightness'].value = this.state.brightness;
        this.form['a11y-panel-contrast'].value = this.state.contrast;
        this.form['a11y-panel-allContent'].checked = this.state.allContent;
        this.form.elements.colormode.value = this.state.colorMode;
        this.setProperties();
      }
    } catch (err) {}
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
    this.setProperty('grayscale', this.state.colorMode === 2 ? 1 : 0);
    this.setProperty('invert', this.state.colorMode === 1 ? 1 : 0);
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
    <div class="a11y-panel-field">
      <label class="a11y-panel-field__label o-icon__label o-icon--contrast" for="a11y-panel-contrast">
        <strong class="a11y-panel-field__label-text">${
          this.settings.labelContrast
        }</strong>
      </label>
      <input
        autofocus
        class="a11y-panel-field__range"
        data-state="contrast"
        id="a11y-panel-contrast"
        list="a11y-panel-contrast-list"
        min="${this.settings.minContrast}"
        max="${this.settings.maxContrast}"
        type="range"
        value="${this.settings.valueContrast}"
        />
      <datalist id="a11y-panel-contrast-list" class="a11y-panel-field__range-ticks">
        ${this.createOptions(
          this.settings.optionsContrast,
          this.settings.minContrast,
          this.settings.maxContrast
        )}
      </datalist>
    </div>

    <div class="a11y-panel-field">
      <label class="a11y-panel-field__label o-icon__label o-icon--brightness" for="a11y-panel-brightness">
        <strong class="a11y-panel-field__label-text">${
          this.settings.labelBrightness
        }</strong>
      </label>
      <input
        class="a11y-panel-field__range"
        data-state="brightness"
        id="a11y-panel-brightness"
        list="a11y-panel-brightness-list"
        min="${this.settings.minBrightness}"
        max="${this.settings.maxBrightness}"
        type="range"
        value="${this.settings.valueBrightness}"
      />
      <datalist class="a11y-panel-field__range-ticks" id="a11y-panel-brightness-list">
      ${this.createOptions(
        this.settings.optionsBrightness,
        this.settings.minBrightness,
        this.settings.maxBrightness
      )}
      </datalist>
    </div>

    <div class="a11y-panel-field--noborder">
    <fieldset class="a11y-panel-field__group">
      <legend class="a11y-panel-field__legend a11y-panel-field__label">
        <strong class="a11y-panel-field__label-text">${
          this.settings.labelApply
        }</strong>
      </legend>

      <label class="a11y-panel-field__checkbox a11y-panel-field__checkbox--switch">
        <input type="checkbox" id="a11y-panel-allContent" class="u-visually-hidden" data-state="allContent" />
        <span class="a11y-panel-field__group-item a11y-panel-field__checkbox-text">${
          this.settings.labelAllContent
        }</span>
      </label>
    </fieldset>
  </div>

    <div class="a11y-panel-field  a11y-panel-field--noborder">
      <fieldset class="a11y-panel-field__group">
        <legend class="a11y-panel-field__legend a11y-panel-field__label o-icon__label o-icon--color">
            <strong class="a11y-panel-field__label-text">${
              this.settings.labelColorMode
            }</strong>
        </legend>
        <label class="a11y-panel-field__radio">
            <input type="radio" name="colormode" class="u-visually-hidden" value="0" data-state="colorMode" checked />
            <span class="a11y-panel-field__group-item a11y-panel-field__radio-text">${
              this.settings.labelDefault
            }</span>
        </label>
        <label class="a11y-panel-field__radio">
            <input type="radio" name="colormode" class="u-visually-hidden" value="1" data-state="colorMode" />
            <span class="a11y-panel-field__group-item a11y-panel-field__radio-text">${
              this.settings.labelInverted
            }</span>
        </label>
        <label class="a11y-panel-field__radio">
            <input type="radio" name="colormode" class="u-visually-hidden" value="2" data-state="colorMode" />
            <span class="a11y-panel-field__group-item a11y-panel-field__radio-text">${
              this.settings.labelGrayscale
            }</span>
        </label>
      </fieldset>
    </div>

    <div class="a11y-panel-field a11y-panel-field--noborder a11y-panel-field__label">
      <strong class="a11y-panel-field__label-text">${
        this.settings.labelZoomLevel
      }:
      </strong>
      <span data-zoom-level>${this.currentZoomLevel}</span>%
    </div>

    <p hidden>${this.settings.labelZoomBrowser}</p>

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
