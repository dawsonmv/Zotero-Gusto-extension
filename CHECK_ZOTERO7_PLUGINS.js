// Check Zotero 7 plugin system
console.log("=== Zotero 7 Plugin System Check ===");
console.log("Zotero version:", Zotero.version);

// Check if addon manager exists
try {
    const { AddonManager } = ChromeUtils.import("resource://gre/modules/AddonManager.jsm");
    console.log("✅ AddonManager available");
} catch (e) {
    console.log("❌ AddonManager error:", e);
}

// Check Zotero's addon system
if (Zotero.Plugins) {
    console.log("✅ Zotero.Plugins exists");
    console.log("Plugins:", Zotero.Plugins);
} else {
    console.log("❌ Zotero.Plugins not found");
}

// Check for our specific addon
try {
    Zotero.getActiveZoteroPane().document.getElementById('menu_Tools').click();
    console.log("✅ Tools menu accessible");
} catch (e) {
    console.log("Tools menu error:", e);
}

// List profile extensions directory
console.log("\n📁 Extensions directory:", Zotero.Profile.dir);

// Check bootstrap loading
if (typeof startup !== 'undefined') {
    console.log("✅ Bootstrap startup function exists");
} else {
    console.log("❌ Bootstrap startup function not found");
}