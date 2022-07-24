package com.aparajita.capacitor.darkmode;

import android.content.res.Configuration;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DarkMode")
public class DarkMode extends Plugin {

  private int currentMode = Configuration.UI_MODE_NIGHT_UNDEFINED;
  private PluginCall listenerCall = null;

  @Override
  public void load() {
    currentMode = getUIMode();
  }

  private int getUIMode() {
    return (
      getActivity().getResources().getConfiguration().uiMode &
      Configuration.UI_MODE_NIGHT_MASK
    );
  }

  private boolean isDarkMode() {
    int mode = getUIMode();
    return mode == Configuration.UI_MODE_NIGHT_YES;
  }

  @PluginMethod
  public void isDarkMode(PluginCall call) {
    JSObject result = new JSObject();
    result.put("dark", isDarkMode());
    call.resolve(result);
  }

  @PluginMethod
  public void setNativeDarkModeListener(PluginCall call) {
    if (listenerCall != null) {
      getBridge().releaseCall(listenerCall);
    }

    listenerCall = call;
    call.setKeepAlive(true);
  }

  protected void handleOnConfigurationChanged(Configuration newConfig) {
    int mode = newConfig.uiMode & Configuration.UI_MODE_NIGHT_MASK;

    if (listenerCall != null && mode != currentMode) {
      currentMode = mode;
      JSObject data = new JSObject();
      data.put("dark", mode == Configuration.UI_MODE_NIGHT_YES);
      listenerCall.resolve(data);
    }
  }
}
