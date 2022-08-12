import Capacitor

@objc(DarkModeNative)
public class DarkModeNative: CAPPlugin {
  private var traitsView: TraitsView?
  private var listenerCall: CAPPluginCall?
  private var resumeObserver: NSObjectProtocol?

  override public func load() {
    // Dark mode is only supported in iOS 13+, so there is no point
    // in trying to observe a change to the mode on earlier versions.
    if #available(iOS 13.0, *) {
      // Make a hidden, zero size view that we hide behind the main view.
      // Its purpose is to receive notifications when the system appearance changes
      // and notify the app accordingly.
      traitsView = TraitsView(withBridge: bridge)
    }
  }

  /*
   * isDarkMode() plugin call
   */
  @objc public func isDarkMode(_ call: CAPPluginCall) {
    var dark = false

    if #available(iOS 13.0, *) {
      dark = UITraitCollection.current.userInterfaceStyle == .dark
    }

    call.resolve(["dark": dark])
  }

  /*
   * setNativeDarkModeListener() plugin call
   */
  @objc public func setNativeDarkModeListener(_ call: CAPPluginCall) {
    if #available(iOS 13.0, *) {
      func appearanceDidChange(interfaceStyle: UIUserInterfaceStyle) {
        call.resolve(["dark": interfaceStyle == .dark])
      }

      if let listenerCall = self.listenerCall {
        bridge?.releaseCall(listenerCall)
      }

      listenerCall = call
      call.keepAlive = true
      traitsView?.appearanceListener = appearanceDidChange
    }
  }
}
