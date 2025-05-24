// Check if Gusto extension is loaded
console.log("=== Checking Gusto Extension ===");

// Check if our objects exist
console.log("Zotero.Gusto exists:", typeof Zotero.Gusto !== 'undefined');
console.log("Zotero.GustoCreator exists:", typeof Zotero.GustoCreator !== 'undefined');

// Try to get addon info
(async () => {
    try {
        const addon = await Zotero.AddOns.getAddonByID("zotero-robustlinks@mementoweb.org");
        console.log("Addon found:", addon);
    } catch (e) {
        console.log("Error getting addon:", e);
    }
})();

// Check preferences
console.log("\n=== Preferences ===");
console.log("archiveonadd:", Zotero.Prefs.get('extensions.gusto.archiveonadd'));
console.log("whatarchive:", Zotero.Prefs.get('extensions.gusto.whatarchive'));

// List all loaded extensions
console.log("\n=== All Extensions ===");
Components.utils.import("resource://gre/modules/AddonManager.jsm");
AddonManager.getAllAddons(function(addons) {
    addons.forEach(addon => {
        if (addon.type === "extension") {
            console.log(`- ${addon.name} (${addon.id}) - ${addon.isActive ? 'Active' : 'Inactive'}`);
        }
    });
});