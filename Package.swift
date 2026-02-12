// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AparajitaCapacitorDarkMode",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "AparajitaCapacitorDarkMode",
            targets: ["AparajitaCapacitorDarkMode"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "AparajitaCapacitorDarkMode",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/DarkModeNative")
    ]
)
