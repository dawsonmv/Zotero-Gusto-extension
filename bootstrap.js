/* global Components, Services */
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof Services === 'undefined') {
    Cu.import('resource://gre/modules/Services.jsm');
}

// Global reference to our addon instance
let gusto;

/**
 * Plugin entry point for Zotero 7
 * Called when the plugin is installed, enabled, or when Zotero starts
 */
function startup({ id, version, rootURI, resourceURI }, reason) {
    // Handle Zotero 6 compatibility (resourceURI vs rootURI)
    if (!rootURI && resourceURI) {
        rootURI = resourceURI.spec;
    }
    
    // Ensure rootURI ends with a slash
    if (!rootURI.endsWith('/')) {
        rootURI += '/';
    }
    
    // Wait for Zotero to be available
    if (typeof Zotero === 'undefined') {
        Cu.import('chrome://zotero/content/include.js');
    }
    
    // Load our main extension code
    Services.scriptloader.loadSubScript(rootURI + 'chrome/content/gusto/ZoteroGusto.js', {});
    Services.scriptloader.loadSubScript(rootURI + 'chrome/content/gusto/GustoCreator.js', {});
    
    // Initialize our extension
    gusto = new Zotero.Gusto({
        id: id,
        version: version,
        rootURI: rootURI,
        reason: reason
    });
}

/**
 * Called when the plugin is disabled or when Zotero shuts down
 */
function shutdown({ id, version, rootURI }, reason) {
    // Don't do anything on app shutdown
    if (reason === APP_SHUTDOWN) {
        return;
    }
    
    // Clean up our extension
    if (gusto) {
        gusto.shutdown();
        gusto = undefined;
    }
    
    // Clear any cached scripts
    if (typeof Zotero !== 'undefined' && Zotero.Gusto) {
        delete Zotero.Gusto;
    }
    if (typeof Zotero !== 'undefined' && Zotero.GustoCreator) {
        delete Zotero.GustoCreator;
    }
}

/**
 * Called when the plugin is first installed
 */
function install(data, reason) {
    // Installation tasks if needed
}

/**
 * Called when the plugin is uninstalled
 */
function uninstall(data, reason) {
    // Uninstallation tasks if needed
}

/**
 * Window hooks for Zotero 7
 * Called when the main Zotero window loads
 */
function onMainWindowLoad({ window }) {
    if (!gusto) return;
    gusto.onMainWindowLoad(window);
}

/**
 * Called when the main Zotero window unloads
 */
function onMainWindowUnload({ window }) {
    if (!gusto) return;
    gusto.onMainWindowUnload(window);
}

// Startup reasons
const APP_STARTUP = 1;
const APP_SHUTDOWN = 2;
const ADDON_ENABLE = 3;
const ADDON_DISABLE = 4;
const ADDON_INSTALL = 5;
const ADDON_UNINSTALL = 6;
const ADDON_UPGRADE = 7;
const ADDON_DOWNGRADE = 8;