var Gusto;

function log(msg) {
    Zotero.debug("Gusto: " + msg);
}

function install() {
    log("Installed 3.0");
}

async function startup({ id, version, rootURI }) {
    log("Starting 3.0");
    
    // TODO: Register preferences pane when we convert to XHTML
    // Zotero.PreferencePanes.register({
    //     pluginID: 'zotero-robustlinks@mementoweb.org',
    //     src: rootURI + 'preferences.xhtml',
    //     scripts: [rootURI + 'preferences.js']
    // });
    
    // Load required scripts
    Services.scriptloader.loadSubScript(rootURI + 'chrome/content/gusto/GustoCreator.js');
    Services.scriptloader.loadSubScript(rootURI + 'chrome/content/gusto/ZoteroGusto.js');
    
    // Initialize Gusto
    Gusto = new Zotero.Gusto();
    Gusto.init({ id, version, rootURI });
    Gusto.addToAllWindows();
    await Gusto.main();
}

function onMainWindowLoad({ window }) {
    if (Gusto) {
        Gusto.addToWindow(window);
    }
}

function onMainWindowUnload({ window }) {
    if (Gusto) {
        Gusto.removeFromWindow(window);
    }
}

function shutdown() {
    log("Shutting down 3.0");
    if (Gusto) {
        Gusto.removeFromAllWindows();
        Gusto = undefined;
    }
}

function uninstall() {
    log("Uninstalled 3.0");
    // Clean up preferences if permanent uninstall
    Services.prefs.deleteBranch('extensions.gusto.');
}