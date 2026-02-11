<div class="markdown-body">

# capacitor-dark-mode demo&nbsp;&nbsp;[![GitHub version](https://badge.fury.io/gh/aparajita%2Fcapacitor-dark-mode.svg)](https://badge.fury.io/gh/aparajita%2Fcapacitor-dark-mode)

This [Ionic](https://ionicframework.com) application provides a demo of all of the capabilities of the [capacitor-dark-mode](https://github.com/aparajita/capacitor-dark-mode) Capacitor 7 plugin. It has been tested on iOS 15-26 and Android API 29-36.

## Installation

```shell
git clone https://github.com/aparajita/capacitor-dark-mode.git
cd capacitor-dark-mode
pnpm install # npm install
pnpm build # npm run build
```

## Usage

### Web

To launch the demo in a browser:

```shell
pnpm demo.dev  # npm run demo.dev
```

Once the demo is open, you can switch between appearance modes. When the appearance is `System`, switching the system between dark and light mode will change the appearance of the app and display an alert to confirm the change.

### Native

To launch the demo in Xcode or Android Studio:

```shell
pnpm demo.ios.dev  # npm run demo.ios.dev
pnpm demo.android.dev  # npm run demo.android.dev
```

Once Xcode/Android Studio opens, select the device or simulator you wish to run the demo on (since you are running in Vite’s dev mode, be sure to use a recent OS version). Once the app is open, it behaves as it does on the web.

On Android, you can choose whether to sync the status bar with the appearance. By default they are synced.

Enjoy!

</div>
