import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jamialkamil.app",
  appName: "Jāmiʿ al-Kāmil",
  webDir: "capacitor-shell",
  server: {
    url: "https://jami-al-kamil.com",
    cleartext: false,
  },
};

export default config;
