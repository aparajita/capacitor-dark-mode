//
//  TraitsView.swift
//  AparajitaCapacitorDarkMode
//
//  Created by Aparajita on 7/9/22.
//

import Capacitor

// We use this view to get notified when the appearance changes
class TraitsView: UIView {
  var appearanceListener: ((UIUserInterfaceStyle) -> Void)?
  private var interfaceStyle = UIScreen.main.traitCollection.userInterfaceStyle

  init(withBridge bridge: CAPBridgeProtocol?) {
    super.init(frame: CGRect.zero)
    isHidden = true

    if let view = bridge?.viewController?.view {
      view.insertSubview(self, belowSubview: view)
    }
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    super.traitCollectionDidChange(previousTraitCollection)

    // For some reason we get userInterfaceStyle changes when the app goes
    // into the background. Ignore those.
    guard UIApplication.shared.applicationState != .background else {
      return
    }

    if let previous = previousTraitCollection,
       previous.userInterfaceStyle != traitCollection.userInterfaceStyle {
      interfaceStyle = traitCollection.userInterfaceStyle

      if let listener = appearanceListener {
        listener(traitCollection.userInterfaceStyle)
      }
    }
  }
}
