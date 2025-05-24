// Check addon system
(async function() {
    const { AddonManager } = ChromeUtils.import("resource://gre/modules/AddonManager.jsm");
    
    // Get all addons
    const addons = await AddonManager.getAllAddons();
    const extensions = addons.filter(a => a.type === "extension");
    
    console.log("Total extensions found:", extensions.length);
    
    // Look for our addon
    const ourAddon = extensions.find(a => a.id === "zotero-robustlinks@mementoweb.org");
    
    if (ourAddon) {
        return `Found Gusto! Status: ${ourAddon.isActive ? 'Active' : 'Inactive'}, Version: ${ourAddon.version}`;
    } else {
        // List all extension IDs to help debug
        const ids = extensions.map(a => a.id).join(", ");
        return `Gusto not found. Found these extensions: ${ids}`;
    }
})();