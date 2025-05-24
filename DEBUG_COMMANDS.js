// Run these commands in Zotero's JavaScript console (Tools → Developer → Run JavaScript)

// Check if bootstrap.js loaded
console.log("Checking for Gusto extension...");
console.log("Zotero.Gusto:", typeof Zotero.Gusto);
console.log("Zotero.GustoCreator:", typeof Zotero.GustoCreator);

// Check loaded extensions
console.log("\nLoaded extensions:");
Services.obs.notifyObservers(null, "startupcache-invalidate", null);

// Check if our extension ID is recognized
var addon = await Zotero.addons.get("zotero-robustlinks@mementoweb.org");
console.log("Extension found:", addon);

// Try to manually load bootstrap if needed
if (typeof Zotero.Gusto === 'undefined') {
    console.log("\nTrying manual load...");
    try {
        Services.scriptloader.loadSubScript("file:///Users/dawsonvaldes/zotero-plugin-repos/zotero-gusto-extension/bootstrap.js");
        console.log("Bootstrap loaded manually");
    } catch (e) {
        console.error("Error loading bootstrap:", e);
    }
}

// Check preferences
console.log("\nPreferences:");
console.log("archiveonadd:", Zotero.Prefs.get('extensions.gusto.archiveonadd'));
console.log("whatarchive:", Zotero.Prefs.get('extensions.gusto.whatarchive'));