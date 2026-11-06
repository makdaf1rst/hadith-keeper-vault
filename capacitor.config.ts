import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jamialkamil.app",
  appName: "Jāmiʿ al-Kāmil",
  webDir: "capacitor-shell",
  server: {
    url: "https://jami-al-kamil.com",
    cleartext: false,
  },
  ios: {
    // iOS only runs service workers (offline reading, saved audio) in an app's WebView for
    // App-Bound Domains. The list lives in ios/App/App/Info.plist under WKAppBoundDomains.
    limitsNavigationsToAppBoundDomains: true,
  },
};

export default config;
