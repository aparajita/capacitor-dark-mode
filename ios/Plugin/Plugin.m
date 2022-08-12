#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(DarkModeNative, "DarkModeNative",
  CAP_PLUGIN_METHOD(isDarkMode, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(setNativeDarkModeListener, CAPPluginReturnCallback);
)
