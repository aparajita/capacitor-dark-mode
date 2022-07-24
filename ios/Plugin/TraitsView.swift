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

  /*
   For some reason the userInterfaceStyle changes twice during suspend.
   We want to ignore that. This flag is set to true on willResignActiveNotification
   and set to false on willEnterForegroundNotification.
   */
  private var ignoreTraitChanges = false

  init(withBridge bridge: CAPBridgeProtocol?) {
    super.init(frame: CGRect.zero)
    isHidden = true

    NotificationCenter.default.addObserver(
      forName: UIApplication.willResignActiveNotification,
      object: nil,
      queue: OperationQueue.main
    ) { [weak self] _ in
      self?.ignoreTraitChanges = true
    }

    NotificationCenter.default.addObserver(
      forName: UIApplication.willEnterForegroundNotification,
      object: nil,
      queue: OperationQueue.main
    ) { [weak self] _ in
      self?.ignoreTraitChanges = false
    }

    if let view = bridge?.viewController?.view {
      view.insertSubview(self, belowSubview: view)
    }
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    super.traitCollectionDidChange(previousTraitCollection)

    guard !ignoreTraitChanges else {
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
