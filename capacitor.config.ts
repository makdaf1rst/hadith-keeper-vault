import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jamialkamil.app",
  appName: "Jāmiʿ al-Kāmil",
  webDir: "dist-ios",
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#faf7ef",
    },
  },
};

export default config;
