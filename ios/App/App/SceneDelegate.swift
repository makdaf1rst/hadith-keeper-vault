import UIKit
import WebKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = AppViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

class AppViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(PdfPlugin())
        if #available(iOS 26.0, *) {
            webView?.scrollView.topEdgeEffect.isHidden = true
        }
    }
}

// window.print() hangs in WKWebView. WebKit's print formatter paginates the same HTML and keeps the Arabic shaping.
// ponytail: renders on the main thread. Largest export is 487 pages, 7s on simulator; chunk it off-screen if a real device stalls.
@objc(PdfPlugin)
class PdfPlugin: CAPPlugin, CAPBridgedPlugin, WKNavigationDelegate {
    let identifier = "PdfPlugin"
    let jsName = "Pdf"
    let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "write", returnType: CAPPluginReturnPromise)]

    private let paper = CGRect(x: 0, y: 0, width: 595.28, height: 841.89) // A4
    private var printView: WKWebView?
    private var pending: CAPPluginCall?
    private var fileName = ""

    @objc func write(_ call: CAPPluginCall) {
        guard let html = call.getString("html"), let fileName = call.getString("fileName") else {
            return call.reject("html and fileName are required")
        }
        DispatchQueue.main.async {
            guard self.pending == nil else { return call.reject("A PDF is already being prepared") }
            let printView = WKWebView(frame: self.paper)
            printView.navigationDelegate = self
            self.printView = printView
            self.pending = call
            self.fileName = (fileName as NSString).lastPathComponent
            printView.loadHTMLString(html, baseURL: nil)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard let call = pending else { return }
        let renderer = UIPrintPageRenderer()
        renderer.addPrintFormatter(webView.viewPrintFormatter(), startingAtPageAt: 0)
        renderer.setValue(NSValue(cgRect: paper), forKey: "paperRect")
        renderer.setValue(NSValue(cgRect: paper.insetBy(dx: 51, dy: 57)), forKey: "printableRect") // 18mm, 20mm
        renderer.prepare(forDrawingPages: NSRange(location: 0, length: renderer.numberOfPages))

        let url = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        do {
            try UIGraphicsPDFRenderer(bounds: paper).writePDF(to: url) { context in
                for page in 0..<renderer.numberOfPages {
                    context.beginPage()
                    renderer.drawPage(at: page, in: context.pdfContextBounds)
                }
            }
            finish { call.resolve(["uri": url.absoluteString]) }
        } catch {
            finish { call.reject(error.localizedDescription) }
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        fail(error.localizedDescription)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        fail("The document was too large to prepare")
    }

    private func fail(_ message: String) {
        guard let call = pending else { return }
        finish { call.reject(message) }
    }

    private func finish(_ settle: () -> Void) {
        settle()
        pending = nil
        printView = nil
    }
}
