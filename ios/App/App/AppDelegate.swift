import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Optimize WebView for performance
        if let vc = window?.rootViewController as? CAPBridgeViewController {
            // Disable swipe-back gesture that intercepts horizontal scrolls
            vc.webView?.allowsBackForwardNavigationGestures = false
            // Ensure fast taps are registered
            vc.webView?.scrollView.delaysContentTouches = false
            vc.webView?.scrollView.canCancelContentTouches = true
            // Prevent safe area from adding extra padding
            if #available(iOS 11.0, *) {
                vc.webView?.scrollView.contentInsetAdjustmentBehavior = .never
            }
        }
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
