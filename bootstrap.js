/* global Components */
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

// Import Services
Cu.import('resource://gre/modules/Services.jsm');

// Global reference to our addon data
var rootURI;
var addon;

/**
 * Plugin entry point for Zotero 7
 */
function startup(data, reason) {
    rootURI = data.rootURI || data.resourceURI.spec;
    
    // Ensure rootURI ends with a slash
    if (!rootURI.endsWith('/')) {
        rootURI += '/';
    }
    
    // Wait for Zotero to be ready
    waitForZotero(function() {
        // Load our scripts
        Services.scriptloader.loadSubScript(rootURI + 'chrome/content/gusto/GustoCreator.js');
        Services.scriptloader.loadSubScript(rootURI + 'chrome/content/gusto/ZoteroGusto.js');
        
        // Create and initialize our addon
        addon = new Zotero.Gusto({
            id: data.id,
            version: data.version,
            rootURI: rootURI,
            reason: reason
        });
    });
}

/**
 * Called when the plugin is disabled or when Zotero shuts down
 */
function shutdown(data, reason) {
    // Don't do anything on app shutdown
    if (reason === APP_SHUTDOWN) {
        return;
    }
    
    // Clean up our addon
    if (addon) {
        addon.shutdown();
        addon = undefined;
    }
    
    // Clear any cached scripts
    Cu.unload(rootURI + 'chrome/content/gusto/ZoteroGusto.js');
    Cu.unload(rootURI + 'chrome/content/gusto/GustoCreator.js');
    
    // Clear references
    if (typeof Zotero !== 'undefined') {
        if (Zotero.Gusto) delete Zotero.Gusto;
        if (Zotero.GustoCreator) delete Zotero.GustoCreator;
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
if (typeof onMainWindowLoad !== 'undefined') {
    var onMainWindowLoad = function({ window }) {
        if (!addon) return;
        addon.onMainWindowLoad(window);
    };
}

/**
 * Called when the main Zotero window unloads
 */
if (typeof onMainWindowUnload !== 'undefined') {
    var onMainWindowUnload = function({ window }) {
        if (!addon) return;
        addon.onMainWindowUnload(window);
    };
}

/**
 * Wait for Zotero to be ready
 */
function waitForZotero(callback) {
    if (typeof Zotero !== 'undefined') {
        callback();
    } else {
        // Load Zotero if not available
        try {
            Cu.import('chrome://zotero/content/include.js');
            callback();
        } catch (e) {
            // If that fails, try waiting
            var observerService = Cc["@mozilla.org/observer-service;1"].
                getService(Ci.nsIObserverService);
            
            var observer = {
                observe: function(subject, topic, data) {
                    if (topic === 'zotero-loaded') {
                        observerService.removeObserver(observer, 'zotero-loaded');
                        callback();
                    }
                }
            };
            
            observerService.addObserver(observer, 'zotero-loaded', false);
        }
    }
}

// Startup/shutdown reasons
const APP_STARTUP = 1;
const APP_SHUTDOWN = 2;
const ADDON_ENABLE = 3;
const ADDON_DISABLE = 4;
const ADDON_INSTALL = 5;
const ADDON_UNINSTALL = 6;
const ADDON_UPGRADE = 7;
const ADDON_DOWNGRADE = 8;