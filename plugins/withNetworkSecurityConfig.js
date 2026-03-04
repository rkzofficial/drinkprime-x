const { withAndroidManifest } = require("expo/config-plugins");
const { mkdirSync, copyFileSync } = require("fs");
const { resolve, join } = require("path");

module.exports = function withNetworkSecurityConfig(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults.manifest;

    // Copy network_security_config.xml to res/xml/
    const resXmlDir = join(
      config.modRequest.platformProjectRoot,
      "app/src/main/res/xml"
    );
    mkdirSync(resXmlDir, { recursive: true });
    copyFileSync(
      resolve(__dirname, "../network_security_config.xml"),
      join(resXmlDir, "network_security_config.xml")
    );

    // Add networkSecurityConfig to <application>
    const app = manifest.application[0];
    app.$["android:networkSecurityConfig"] =
      "@xml/network_security_config";

    return config;
  });
};
