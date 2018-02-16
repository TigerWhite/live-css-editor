#!/usr/bin/env node
/* eslint-env node */

var path = require("path");

var chalk = require("chalk"),
    jsonfile = require("jsonfile");

var generateManifest = function (whichBrowser) {
    var version = require("../package.json").version;
    var manifest = {
        "version": whichBrowser === "edge" ? version + ".0" : version,
        "manifest_version": 2,
        "author": "Priyank Parashar",
        "default_locale": "en",
        "name": "__MSG_Extension_Name__",
        "description": "__MSG_Extension_Description__",
        "homepage_url": "https://github.com/webextensions/live-css-editor",

        "icons": {
            "16": "icons/icon-16.png",
            "24": "icons/icon-24.png",
            "32": "icons/icon-32.png",
            "40": "icons/icon-40.png",
            "48": "icons/icon-48.png",
            "128": "icons/icon-128.png",
            "256": "icons/icon-256.png"
        },
        "permissions": (function () {
            var permissions = [
                "activeTab",
                "storage"
            ];
            if (whichBrowser === "edge") {
                permissions.push("<all_urls>");
            }
            return permissions;
        }()),
        "optional_permissions": [
            "webNavigation",
            "<all_urls>"
        ],
        "browser_action": {
            "default_icon": {
                "16": "icons/icon-16.png",
                "24": "icons/icon-24.png",
                "32": "icons/icon-32.png",
                "40": "icons/icon-40.png",
                "48": "icons/icon-48.png",
                "128": "icons/icon-128.png",
                "256": "icons/icon-256.png"
            }
        },
        "background": {
            "persistent": false,
            "page": "background-magicss.html"
        },
        "options_ui": {
            "page": "options.html",
            "chrome_style": true
        },
        "commands": {
            "_execute_browser_action": {
                "suggested_key": {
                    "default": "Alt+Shift+C"
                }
            }
        }
        /*
        // "web_accessible_resources" might be required on some platforms (but currently we are using data-uri for images, so no need yet)

        "web_accessible_resources": [
            "ui-images/*.*"
        ]
        /* */
    };

    if (whichBrowser !== "firefox") {
        manifest["offline_enabled"] = true;
    }

    if (whichBrowser === "firefox") {
        manifest["applications"] = {
            "gecko": {
                "id": "{a42eb16c-2fab-4c06-b1f3-5f15adebb0e3}",
                "strict_min_version": "48.0"
            }
        };
    }
    if (whichBrowser === "edge") {
        manifest["-ms-preload"] = {
            "backgroundScript": "backgroundScriptsAPIBridge.js",
            "contentScript": "contentScriptsAPIBridge.js"
        };
    }

    var targetFileName;
    switch (whichBrowser) {
        case "chrome":  targetFileName = "manifest-chrome.json";  break;
        case "edge":    targetFileName = "manifest-edge.json";    break;
        case "firefox": targetFileName = "manifest-firefox.json"; break;
        case "opera":   targetFileName = "manifest-opera.json";   break;
        default:        targetFileName = "manifest.json";         break;
    }
    process.stdout.write("Generating " + targetFileName + " : ");
    jsonfile.writeFileSync(path.join(__dirname, targetFileName), manifest, {spaces: 4});
    process.stdout.write(chalk.green(" ✓") + "\n");
};

generateManifest("default");
generateManifest("chrome");
generateManifest("edge");
generateManifest("firefox");
generateManifest("opera");
