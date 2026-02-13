package com.aparajita.capacitor.darkmode;

import android.content.res.Configuration;
import android.graphics.Color;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DarkModeNative")
public class DarkModeNative extends Plugin {

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

  @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
  public void setNativeDarkModeListener(PluginCall call) {
    if (listenerCall != null) {
      getBridge().releaseCall(listenerCall);
    }

    listenerCall = call;
    call.setKeepAlive(true);
  }

  @PluginMethod
  public void setBackgroundColor(PluginCall call) {
    String color = call.getString("color", "");

    if (color.isEmpty()) {
      call.reject("color is required");
      return;
    }

    try {
      int parsedColor = Color.parseColor(color);
      getActivity().runOnUiThread(() -> {
        getActivity().getWindow().getDecorView().setBackgroundColor(parsedColor);
      });
      call.resolve();
    } catch (IllegalArgumentException e) {
      call.reject("Invalid color: " + color);
    }
  }

  @PluginMethod
  public void setStyle(PluginCall call) {
    String style = call.getString("style", "");

    getActivity().runOnUiThread(() -> {
      Window window = getActivity().getWindow();
      WindowInsetsControllerCompat controller =
        WindowCompat.getInsetsController(window, window.getDecorView());

      // "DARK" style = dark-themed bar (light icons) = not light status bars
      // "LIGHT" style = light-themed bar (dark icons) = light status bars
      controller.setAppearanceLightStatusBars(style.equals("LIGHT"));
    });

    call.resolve();
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
