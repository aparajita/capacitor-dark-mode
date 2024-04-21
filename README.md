<div class="markdown-body">

# capacitor-dark-mode&nbsp;&nbsp;[![npm version](https://badge.fury.io/js/@aparajita%2Fcapacitor-dark-mode.svg)](https://badge.fury.io/js/@aparajita%2Fcapacitor-dark-mode)

This [Capacitor 6](https://capacitorjs.com) plugin is a complete dark mode solution for Ionic web, iOS and Android.

### ❗️Breaking changes

In order to conform to Ionic 8’s built in dark mode support when importing `@ionic/vue/css/palettes/dark.class.css`, two changes have been made:

- When running on Ionic 8+, the default dark mode class is now `.ion-palette-dark`. If you were using the default `.dark` class, replace all usages of `.dark` in your CSS with `.ion-palette-dark`.

- The dark mode class is now applied to the `html` element instead of the `body`.

In order to conform with the Capacitor 6 listener interface, [`addAppearanceListener`](#addappearancelistener) now returns only a Promise and must be awaited.

## Motivation

On the web and iOS, dark mode works easily with Ionic because browsers and WKWebView correctly handle the `prefers-color-scheme` CSS property. On Android, on the other hand, `prefers-color-scheme` is [well and truly broken](https://developer.android.com/guide/webapps/dark-theme). I have never seen it work reliably in an Ionic app, even with Capacitor 5 and the Android DayNight theme.

With this plugin, you can easily enable and control dark mode in your app across **all** platforms, guaranteed! This means that on Android versions prior to 10 (API 29), which is the first version to support system dark mode, you can allow the user to toggle dark mode.

### Keep it DRY

If you implement dark mode as a user preference, you cannot rely solely on the CSS `prefers-color-scheme` query anyway; you have to use a class to indicate whether or not you are in dark mode. Maintaining an identical set of CSS variables for `prefers-color-scheme: dark` and a dark class selector is error-prone, extra maintenance, and in general violates the DRY principle.

This plugin relies solely on a dark class selector to indicate whether or not you are in dark mode, and manages the dark class for you based on the system dark mode and/or the user preference.

[Installation](#installation) | [Configuration](#configuration) | [Usage](#usage) | [API](#api)

## Features

- Uniform API for enabling and controlling dark mode across all platforms. 👏
- Automatic dark mode detection (in systems that support dark mode). 👀
- Support for user dark mode switching. ☀️🌛
- Support for custom dark mode preference storage. 💾
- Updates the status bar to match the dark mode, even on Android. 🚀
- Custom status bar colors on Android. 🌈
- Register listeners for system dark mode changes. 🔥
- Extensive documentation. 📚

## Installation

In your app:

```shell
pnpm add @aparajita/capacitor-dark-mode
```

## Configuration

Once the plugin is installed, you need to:

- Provide a dark mode in your CSS if using Ionic < 8, or `import '@ionic/vue/css/palettes/dark.class.css'` in Ionic 8+.
- Initialize the plugin.

### Dark mode CSS

This plugin adds or removes a CSS class to the `html` element when necessary. By default, the class is `.dark` on Ionic < 8 and `.ion-palette-dark` on Ionic 8+, but you can configure it to be whatever you want.

> 👉🏽 **Note:** If you are using Tailwind’s [dark mode support](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually), set `darkMode: 'class'` in your Tailwind config file.

It is up to you to configure your CSS to actually implement dark mode when that class is present. A good place to start is the standard [Ionic dark mode](https://ionicframework.com/docs/theming/dark-mode#ionic-dark-theme), which relies on the CSS variables that control Ionic component appearance.

If you have an existing CSS dark theme which relies on `prefers-color-scheme`, you should remove all `@media (prefers-color-scheme: dark)` rules and instead use `html.dark` (or simply `.dark`) as the dark mode selector. There is NO need to duplicate the dark mode in both a `@media (prefers-color-scheme: dark)` block and a `html.dark` block. That’s one of the advantages of using this plugin!

```css
/* Remove all prefers-color-scheme selectors! */
@media (prefers-color-scheme: dark) {
  html {
    --ion-color-primary: #428cff;
    /* ... */
  }
}

/* Replace with this */
html.dark {
  --ion-color-primary: #428cff;
  /* ... */
}
```

### Plugin configuration

If you are using the default dark mode CSS class and you don’t allow the user to manually set light or dark mode — and thus don’t need to store a preference — you are all set! The plugin does all of the hard work for you.

If you are using a dark mode CSS class other than the default, you need to configure the plugin. You will want to do this just before the app is mounted to avoid any visual glitches. For example, if your app uses a dark mode CSS class of `.dark-mode`, you would configure the plugin like this in a Vue-based Ionic app:

**main.ts**

```typescript
const app = createApp(App).use(IonicVue, config).use(router)

router
  .isReady()
  .then(() => {
    // configure() is a synonym for init()
    DarkMode.init({ cssClass: 'dark-mode' })
      .then(() => {
        app.mount('#app')
      })
      .catch(console.error)
  })
  .catch(console.error)
```

Use the equivalent in a React or Angular-based Ionic app.

> 👉🏽 **Note:** Using a custom dark mode class will not work on Ionic 8+ if you are importing `@ionic/vue/css/palettes/dark.class.css` You must use the default (`.ion-palette-dark`) in that case.

#### Custom preference storage

If you want to store the user’s dark mode preference in a custom location (such as `localStorage`), you must create a getter function that returns the preference and a setter that stores the preference, and pass those functions to the `init` or `configure` method.

**prefs.ts**

```typescript
import type { DarkModeGetterResult } from '@aparajita/capacitor-dark-mode'
import { DarkModeAppearance } from '@aparajita/capacitor-dark-mode'

const kDarkModePref = 'dark-mode'

export function getAppearancePref(): DarkModeGetterResult {
  return localStorage.getItem(kDarkModePref)
}

export function setAppearancePref(appearance: DarkModeAppearance) {
  localStorage.setItem(kDarkModePref, appearance)
}
```

**main.ts**

```typescript
import { getAppearancePref, setAppearancePref } from './prefs'

router
  .isReady()
  .then(() => {
    DarkMode.init({
      cssClass: 'dark-mode',
      getter: getAppearancePref,
      setter: setAppearancePref,
    })
      .then(() => {
        app.mount('#app')
      })
      .catch(console.error)
  })
  .catch(console.error)
```

The example above uses a synchronous function, but you may also use an async getter that returns a Promise, so there are no constraints on how or where you store the preference.

#### Android status bar customization

On Android, there are several additional options you can pass to `init()/configure()` that control what happens to the status bar when dark mode is toggled.

**syncStatusBar**<br>
If `syncStatusBar` is `true`, the status bar will be updated to match the dark mode. This is the default behavior.

**statusBarBackgroundVariable**<br>
When `syncStatusBar` is `true`, by default the status bar background will set to the value of the `--background` CSS variable on the `ion-content` element, which is defined by `ion-content` as:

```css
ion-content {
  /*
    The stock Ionic theme sets --ion-background-color
    in dork mode.
   */
  --background: var(--ion-background-color, #fff);
}
```

If you want to use a different color for the status bar, you can set `statusBarBackgroundVariable` to the name of a different CSS variable. You can then set that variable accordingly in your CSS.

If the value of the variable is not a valid 3 or 6-digit '#'-prefixed hex color, no change is made.

**statusBarStyleGetter**<br>
When `syncStatusBar` is `true` and a valid background color is set, by default the status bar style will be set according to the luminance of the background color:

```typescript
// Default threshold is 0.5
const statusBarStyle = isDarkColor(color) ? Style.Dark : Style.Light
```

If you want to use a different style, you can set `statusBarStyleGetter` to a function that returns the style to use. The function will be called with the current `Style` (based on the appearance setting, not the background color) and the status bar background color, and should return the `Style` that the status bar should be set to.

For example, you could use `isDarkColor()` (which is exported by the plugin) with a different threshold:

```typescript
import { Style } from '@capacitor/status-bar'

const statusBarStyleGetter = (style?: Style, color?: string) => {
  if (color) {
    const isDark = isDarkColor(color, 0.4)
    return isDark ? Style.Dark : Style.Light
  }

  return style
}
```

> 👉🏽 **Note:** The getter is also called when `syncStatusBar` is `'textOnly'`.

## Usage

I could spend a lot of time explaining detailed usage, but perhaps the best explanation is a full example that uses the entire plugin API and shows how to handle user dark mode preference changes. Check out the demo app [here](https://github.com/aparajita/capacitor-dark-mode-demo). You will especially want to look at [`prefs.ts`](https://github.com/aparajita/capacitor-dark-mode-demo/blob/main/src/prefs.ts) and [`DarkModeDemo.vue`](https://github.com/aparajita/capacitor-dark-mode-demo/blob/main/src/components/DarkModeDemo.vue).

## API

<docgen-index>

- [`init(...)`](#init)
- [`configure(...)`](#configure)
- [`isDarkMode()`](#isdarkmode)
- [`setNativeDarkModeListener(...)`](#setnativedarkmodelistener)
- [`addAppearanceListener(...)`](#addappearancelistener)
- [`update(...)`](#update)
- [Interfaces](#interfaces)
- [Type Aliases](#type-aliases)
- [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### init(...)

```typescript
init(options?: DarkModeOptions) => Promise<void>
```

Initializes the plugin and optionally configures the dark mode class and getter used to retrieve the current dark mode state. This should be done BEFORE the app is mounted but AFTER the dom is defined (e.g. at the end of the &lt;body&gt;) to avoid a flash of the wrong mode.

| Param   | Type                                           |
| :------ | :--------------------------------------------- |
| options | <a href="#darkmodeoptions">DarkModeOptions</a> |

---

### configure(...)

```typescript
configure(options?: DarkModeOptions) => Promise<void>
```

A synonym for `init`.

| Param   | Type                                           |
| :------ | :--------------------------------------------- |
| options | <a href="#darkmodeoptions">DarkModeOptions</a> |

---

### isDarkMode()

```typescript
isDarkMode() => Promise<IsDarkModeResult>
```

web: Returns the result of the `prefers-color-scheme: dark` media query.<br><br>native: Returns whether the system is currently in dark mode.

**Returns:** Promise&lt;<a href="#isdarkmoderesult">IsDarkModeResult</a>&gt;

---

### setNativeDarkModeListener(...)

```typescript
setNativeDarkModeListener(options: Record<string, unknown>, callback: DarkModeListener) => Promise<string>
```

| Param    | Type                                                |
| :------- | :-------------------------------------------------- |
| options  | <a href="#record">Record</a>&lt;string, unknown&gt; |
| callback | <a href="#darkmodelistener">DarkModeListener</a>    |

**Returns:** Promise&lt;string&gt;

---

### addAppearanceListener(...)

```typescript
addAppearanceListener(listener: DarkModeListener) => Promise<DarkModeListenerHandle>
```

Adds a listener that will be called whenever the system appearance changes, whether or not the system appearance matches your current appearance. The listener is called AFTER the dark mode class and status bar are updated by the plugin. The listener will be called with <a href="#darkmodelistenerdata">`DarkModeListenerData`</a> indicating if the current system appearance is dark.<br><br>The returned handle contains a `remove` function which you should be sure to call when the listener is no longer needed, for example when a component is unmounted (which happens a lot with HMR). Otherwise there will be a memory leak and multiple listeners executing the same function.

| Param    | Type                                             |
| :------- | :----------------------------------------------- |
| listener | <a href="#darkmodelistener">DarkModeListener</a> |

**Returns:** Promise&lt;<a href="#darkmodelistenerhandle">DarkModeListenerHandle</a>&gt;

---

### update(...)

```typescript
update(data?: DarkModeListenerData) => Promise<DarkModeAppearance>
```

Adds or removes the dark mode class on the html element depending on the dark mode state. You do NOT need to call this when the system appearance changes.<br><br>If you are manually setting the appearance and you have specified a getter function, you should call this method AFTER the value returned by the configured getter changes.<br><br>Returns the current appearance.

| Param | Type                                                     |
| :---- | :------------------------------------------------------- |
| data  | <a href="#darkmodelistenerdata">DarkModeListenerData</a> |

**Returns:** Promise&lt;<a href="#darkmodeappearance">DarkModeAppearance</a>&gt;

---

### Interfaces

#### DarkModeOptions

The options passed to `configure`.

| Prop                        | Type                                                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :-------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cssClass                    | string                                                     | The CSS class name to use to toggle dark mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| getter                      | <a href="#darkmodegetter">DarkModeGetter</a>               | If set, this function will be called to retrieve the current dark mode state instead of `isDarkMode`. For example, you might want to let the user set dark/light mode manually and store that preference somewhere. If the function wants to signal that no value can be retrieved, it should return null or undefined, in which case `isDarkMode` will be used.<br><br>If you are not providing any storage of the dark mode state, don't pass this in the options.                                                                                          |
| setter                      | <a href="#darkmodesetter">DarkModeSetter</a>               | If set, this function will be called to set the current dark mode state when `update` is called. For example, you might want to let the user set dark/light mode manually and store that preference somewhere, such as localStorage.                                                                                                                                                                                                                                                                                                                          |
| disableTransitions          | boolean                                                    | If true, the plugin will automatically disable all transitions when dark mode is toggled. This is to prevent different elements from switching between light and dark mode at different rates. &lt;ion-item&gt;, for example, by default has a transition on all of its properties.<br><br>Set this to false if you want to handle transitions yourself.                                                                                                                                                                                                      |
| syncStatusBar               | <a href="#darkmodesyncstatusbar">DarkModeSyncStatusBar</a> | Android only<br><br>If `statusBarStyleGetter` is set, this option is unused.<br><br>If true, on Android the status bar background and content will be synced with the current <a href="#darkmodeappearance">`DarkModeAppearance`</a>.<br><br>If 'textOnly', on Android only the status bar content will be synced with the current <a href="#darkmodeappearance">`DarkModeAppearance`</a>: a light color when the appearance is dark and vice versa.<br><br>On iOS this option is not used, the status bar background is synced with dark mode by the system. |
| statusBarBackgroundVariable | string                                                     | Android only<br><br>If set, this CSS variable will be used instead of '--background' to set the status bar background color.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| statusBarStyleGetter        | <a href="#statusbarstylegetter">StatusBarStyleGetter</a>   | Android only<br><br>If set, and `syncStatusBar` is true, this function will be called to retrieve the current status bar style instead of basing it on the dark mode. If the function wants to signal that no value can be retrieved, it should return a falsey value, in which case the current appearance will be used to determine the style.                                                                                                                                                                                                              |

#### IsDarkModeResult

Result returned by `isDarkMode`.

| Prop | Type    |
| :--- | :------ |
| dark | boolean |

#### DarkModeListenerData

Your appearance listener callback will receive this data, indicating whether the system is in dark mode or not.

| Prop | Type    |
| :--- | :------ |
| dark | boolean |

#### DarkModeListenerHandle

When you call `addAppearanceListener`, you get back a handle that you can use to remove the listener. See [addAppearanceListener](#addappearancelistener) for more details.

| Method     | Signature     |
| :--------- | :------------ |
| **remove** | () =&gt; void |

### Type Aliases

#### DarkModeGetter

The type of your appearance getter function.

<code>(): <a href="#darkmodegetterresult">DarkModeGetterResult</a> | Promise&lt;<a href="#darkmodegetterresult">DarkModeGetterResult</a>&gt;</code>

#### DarkModeGetterResult

Your appearance getter function should return (directly or as a Promise) either:<br><br>- A <a href="#darkmodeappearance">DarkModeAppearance</a> to signify that is the appearance you want<br><br>- null or undefined to signify the system appearance should be used

<code><a href="#darkmodeappearance">DarkModeAppearance</a> | null</code> |

#### DarkModeSetter

The type of your appearance setter function.

<code>(appearance: <a href="#darkmodeappearance">DarkModeAppearance</a>): void | Promise&lt;void&gt;</code>

#### DarkModeSyncStatusBar

Possible values for the syncStatusBar option.

<code>boolean | 'textOnly'</code>

#### StatusBarStyleGetter

The type of your status bar style getter function.

<code>(style?: <a href="#style">Style</a>, backgroundColor?: string): <a href="#statusbarstylegetterresult">StatusBarStyleGetterResult</a> | Promise&lt;<a href="#statusbarstylegetterresult">StatusBarStyleGetterResult</a>&gt;</code>

#### StatusBarStyleGetterResult

Your style getter function should return (directly or as a Promise) either:<br><br>- A <a href="#style">Style</a> to signify that is the style you want<br><br>- null or undefined to signify the default behavior should be used

<code><a href="#style">Style</a> | null</code> |

#### Record

Construct a type with a set of properties K of type T

<code>{
[P in K]: T;
}</code>

#### DarkModeListener

The type of your appearance listener callback.

<code>(data: <a href="#darkmodelistenerdata">DarkModeListenerData</a>): void</code>

### Enums

#### DarkModeAppearance

| Members | Value    |
| :------ | :------- |
| dark    | 'dark'   |
| light   | 'light'  |
| system  | 'system' |

#### Style

| Members | Value     | Description                                                                                                                                                                                                                                            |
| :------ | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dark    | "DARK"    | Light text for dark backgrounds.                                                                                                                                                                                                                       |
| Light   | "LIGHT"   | Dark text for light backgrounds.                                                                                                                                                                                                                       |
| Default | "DEFAULT" | The style is based on the device appearance. If the device is using Dark mode, the statusbar text will be light. If the device is using Light mode, the statusbar text will be dark. On Android the default will be the one the app was launched with. |

</docgen-api>

</div>
