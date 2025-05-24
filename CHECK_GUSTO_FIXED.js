// Check if Gusto is loaded
if (typeof Zotero.Gusto !== 'undefined') {
    console.log("✅ Gusto is loaded!");
    console.log("Gusto object:", Zotero.Gusto);
} else {
    console.log("❌ Gusto is NOT loaded");
}

if (typeof Zotero.GustoCreator !== 'undefined') {
    console.log("✅ GustoCreator is loaded!");
} else {
    console.log("❌ GustoCreator is NOT loaded");
}

// Check addons
(async function() {
    const { AddonManager } = ChromeUtils.import("resource://gre/modules/AddonManager.jsm");
    const addons = await AddonManager.getAllAddons();
    const extensions = addons.filter(a => a.type === "extension");
    
    console.log("\n📦 Total extensions:", extensions.length);
    
    const ourAddon = extensions.find(a => a.id === "zotero-robustlinks@mementoweb.org");
    
    if (ourAddon) {
        console.log("✅ Found Gusto extension!");
        console.log("   Status:", ourAddon.isActive ? 'Active' : 'Inactive');
        console.log("   Version:", ourAddon.version);
        console.log("   Path:", ourAddon.getResourceURI("").spec);
    } else {
        console.log("❌ Gusto extension not found in addon manager");
        console.log("Found these extensions:");
        extensions.forEach(e => console.log(`   - ${e.name} (${e.id})`));
    }
})();