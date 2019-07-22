# a11y-panel
Accessibility-panel with contrast/brightness, font-size/zoom, color-modes and highlight of links / focusable elements.

*Default configuration:*

![A11y Panel](/docs/a11y.png)

*All features enabled (not recommended, read on):*

![A11y Panel](/docs/a11y__all.png)

## Keyboard shortcuts
Open the panel with `shift + ?`, close it with `Esc`.

## Features
All the panel's features are configurable and can be shown/hidden via the options-object or `data`-attributes.

### Contrast
Updates a global CSS-variable, `--contrast`, and applies that to a CSS-filter, targetting all images and background-images.

### Brightness
Updates a global CSS-variable, `--brightness`, and applies that to a CSS-filter, targetting all images and background-images.

### Apply to images
Adds the class defined in `clsBodyAll` (default `a11y--all`) to `<body>`, targetting *all* elements with brightness/contrast instead of just images.

### Color mode
Updates two global CSS-variables, `--invert` and `--grayscale`, and applies these to a CSS-filter, changing the overall colors of the page. When both is set to `0` it equals `default`.

### Font-size
Updates a global CSS-variable, `--fontsize`, and applies that to `<body>`.  
Font-sizes must be defined in relative units, like `em` or `rem`, for this to work.  
Disabled by default.

### Zoom
Updates a global CSS-variable, `--zoom`, and applies that to `<body>`.  
This method scales everything via CSS, and is only recommended if font-size-scaling can't be used (see above).  
Not reccomended.  
Disabled by default.

## Focusable (highlight tab-stops)
Adds the class defined in `clsFocusable` (default `a11y--focus`) to all focusable elements, and a counter to a `::before`-pseudo-element, numbering all focusable elements in order.  
Disabled by default.

*Below: Example of configuration with focusable elements / tab-stops (yellow squares with numbers):*

![A11y Panel](/docs/a11y__focusable.png)

## Install
Copy `a11yPanel.mjs` and `a11y.css` to a location of your choice within your project, and integrate them in your webpack/parcel-setup.

You need a small chunk of HTML around the button/link you'll use to trigger the panel:

```html
<!-- Begin A11y Panel -->
<nav
  class="a11y-panel__wrapper"
  data-js="a11yPanel">
  <button
    aria-label="Toggle Accessibility Settings, use shift + ?"
    class="a11y-panel__toggle"
    role="button">
    Text here ...
  </button>
</nav>
<!-- End A11y Panel -->
```

To load the panel, use this (or copy it to your main JavaScript-file):

```js
import A11yPanel from './yourLocation/a11yPanel.mjs';
const panel = document.querySelector('[data-js*="a11yPanel"]');
if (panel) new A11yPanel(panel, panel.dataset);
``` 

If the CSS is not a part of your build, add it to `<head>`:

```html
<link href="/yourLocation/a11y.css" rel="stylesheet">
```

## Settings
Settings can either be defined as an object:

```js
new A11yPanel(panel, { showContrast: false });
```

Or as data-attributes (note the data-prefix as well as k-e-b-a-b-case instead of camelCase):

```html
<nav
  class="a11y-panel__wrapper"
  data-js="a11yPanel"
  data-show-contrast="false"
  data-show-fontsize="true">
```

```js
new A11yPanel(panel, panel.dataset);
```

## Options

### CSS Classes

| Setting              | Default              |
| :------------------- | :------------------- |
| clsBody              | 'a11y'               |
| clsBodyAll           | 'a11y--all'          |
| clsClose             | 'a11y-panel__close'  |
| clsDialog            | 'a11y-panel'         |
| clsFocusable         | 'a11y--focus'        |
| clsForm              | 'a11y-panel__form'   |

### Labels

| Setting              | Default                  |
| :------------------- | :----------------------- |
| labelApply           | 'Apply to images, or'    |
| labelBrightness      | 'brightness'             |
| labelClose           | '&#10005;'               |
| labelColorMode       | 'Color mode'             |
| labelContrast        | 'Contrast'               |
| labelDefault         | 'Default'                |
| labelFocusable       | 'tab-stops'              |
| labelFocusableHeader | 'Highlight'              |
| labelFontsize        | 'Fontsize'               |
| labelGrayscale       | 'Grayscale'              |
| labelAllContent      | 'All content'            |
| labelInverted        | 'Inverted'               |
| labelReset           | 'Reset'                  |
| labelSave            | 'Save'                   |
| labelZoom            | 'Zoom'                   |

### Brightness

| Setting          | Default    |
| :--------------- | :--------- |
| maxBrightness    | 200        |
| minBrightness    | 100        |
| valueBrightness  | 0          |

### Contrast

| Setting          | Default    |
| :--------------- | :--------- |
| maxContrast      | 200        |
| minContrast      | 100        |
| valueContrast    | 0          |

### Font-size

| Setting          | Default    |
| :--------------- | :--------- |
| maxFontsize      | 300        |
| minFontsize      | 100        |
| valueFontsize    | 0          |

### Zoom

| Setting          | Default    |
| :--------------- | :--------- |
| maxZoom          | 300        |
| minZoom          | 100        |
| valueZoom        | 0          |

## Show / Hide features

| Setting          | Default    |
| :--------------- | :--------- |
| showApplyImages  | true       |
| showBrightness   | true       |
| showColorMode    | true       |
| showContrast     | true       |
| showFocusable    | false      |
| showFontsize     | false      |
| showZoom         | false      |

### Expires after
Deletes local settings after this amount of milliseconds (default: one day)

| Setting          | Default         |
| :--------------- | :-------------- |
| expiresAfter     | 86400000        |