/**
 * Gusto extension for Zotero 7
 * Main extension class that handles initialization, window management, and core functionality
 */

if (!Zotero.Gusto) {
    Zotero.Gusto = function(config) {
        this.id = config.id;
        this.version = config.version;
        this.rootURI = config.rootURI;
        this.initialized = false;
        this.windows = [];
        this.notifierID = null;
        
        // Initialize the extension
        this.init();
    };
    
    Zotero.Gusto.prototype = {
        /**
         * Initialize the extension
         */
        init: function() {
            if (this.initialized) return;
            
            Zotero.debug('Gusto: Initializing extension');
            
            // Register preferences defaults
            this.registerPreferences();
            
            // Register notifier for new items
            this.notifierID = Zotero.Notifier.registerObserver(this.notifierCallback, ['item']);
            
            this.initialized = true;
            Zotero.debug('Gusto: Initialization complete');
        },
        
        /**
         * Shutdown the extension
         */
        shutdown: function() {
            Zotero.debug('Gusto: Shutting down');
            
            // Unregister notifier
            if (this.notifierID) {
                Zotero.Notifier.unregisterObserver(this.notifierID);
                this.notifierID = null;
            }
            
            // Clean up all windows
            for (let win of this.windows) {
                this.removeFromWindow(win);
            }
            this.windows = [];
            
            this.initialized = false;
            Zotero.debug('Gusto: Shutdown complete');
        },
        
        /**
         * Register default preferences
         */
        registerPreferences: function() {
            const defaults = {
                'extensions.gusto.archiveonadd': 'yes',
                'extensions.gusto.whatarchive': 'random',
                'extensions.gusto.alwaysurir': 'no'
            };
            
            for (let [pref, value] of Object.entries(defaults)) {
                if (typeof Zotero.Prefs.get(pref) === 'undefined') {
                    Zotero.Prefs.set(pref, value);
                }
            }
        },
        
        /**
         * Called when main window loads
         */
        onMainWindowLoad: function(window) {
            if (!window.ZoteroPane) return;
            
            Zotero.debug('Gusto: Adding to window');
            this.windows.push(window);
            this.addToWindow(window);
        },
        
        /**
         * Called when main window unloads
         */
        onMainWindowUnload: function(window) {
            Zotero.debug('Gusto: Removing from window');
            this.removeFromWindow(window);
            
            let index = this.windows.indexOf(window);
            if (index > -1) {
                this.windows.splice(index, 1);
            }
        },
        
        /**
         * Add extension elements to a window
         */
        addToWindow: function(window) {
            let doc = window.document;
            
            // Add context menu items
            this.addContextMenuItems(window);
            
            // Store reference for preferences dialog
            window.Zotero.Gusto = this;
        },
        
        /**
         * Remove extension elements from a window
         */
        removeFromWindow: function(window) {
            let doc = window.document;
            
            // Remove our menu items
            let menuItems = doc.querySelectorAll('[id^="gusto-"]');
            for (let item of menuItems) {
                item.remove();
            }
            
            // Clean up references
            if (window.Zotero && window.Zotero.Gusto) {
                delete window.Zotero.Gusto;
            }
        },
        
        /**
         * Add context menu items
         */
        addContextMenuItems: function(window) {
            let doc = window.document;
            
            // Item context menu
            let itemMenu = doc.getElementById('zotero-itemmenu');
            if (itemMenu) {
                // Add separator
                let separator = doc.createXULElement('menuseparator');
                separator.id = 'gusto-separator';
                itemMenu.appendChild(separator);
                
                // Add menu with submenu
                let menu = doc.createXULElement('menu');
                menu.id = 'gusto-menu';
                menu.setAttribute('label', 'Robustify This Resource');
                menu.className = 'menu-iconic';
                
                let menuPopup = doc.createXULElement('menupopup');
                
                // Default archive option
                let defaultItem = doc.createXULElement('menuitem');
                defaultItem.setAttribute('label', 'Default Web Archive');
                defaultItem.addEventListener('command', () => {
                    Zotero.GustoCreator.makeRobustLink('default', null, true);
                });
                menuPopup.appendChild(defaultItem);
                
                // Any archive option
                let anyItem = doc.createXULElement('menuitem');
                anyItem.setAttribute('label', 'Any Web Archive');
                anyItem.addEventListener('command', () => {
                    Zotero.GustoCreator.makeRobustLink(null, null, true);
                });
                menuPopup.appendChild(anyItem);
                
                // Internet Archive option
                let iaItem = doc.createXULElement('menuitem');
                iaItem.setAttribute('label', 'Internet Archive');
                iaItem.addEventListener('command', () => {
                    Zotero.GustoCreator.makeRobustLink('archive.org', null, true);
                });
                menuPopup.appendChild(iaItem);
                
                // Archive.Today option
                let atItem = doc.createXULElement('menuitem');
                atItem.setAttribute('label', 'Archive.Today');
                atItem.addEventListener('command', () => {
                    Zotero.GustoCreator.makeRobustLink('archive.today', null, true);
                });
                menuPopup.appendChild(atItem);
                
                menu.appendChild(menuPopup);
                itemMenu.appendChild(menu);
            }
            
            // Tools menu
            let toolsMenu = doc.getElementById('menu_ToolsPopup');
            if (toolsMenu) {
                let prefsItem = doc.createXULElement('menuitem');
                prefsItem.id = 'gusto-preferences';
                prefsItem.setAttribute('label', 'Gusto Preferences...');
                prefsItem.addEventListener('command', () => {
                    this.openPreferences(window);
                });
                
                // Insert after Zotero preferences
                let zoteroPrefs = doc.getElementById('menu_preferences');
                if (zoteroPrefs && zoteroPrefs.nextSibling) {
                    toolsMenu.insertBefore(prefsItem, zoteroPrefs.nextSibling);
                } else {
                    toolsMenu.appendChild(prefsItem);
                }
            }
        },
        
        /**
         * Open preferences dialog
         */
        openPreferences: function(window) {
            if (!this._preferencesWindow || this._preferencesWindow.closed) {
                let featureStr = 'chrome,titlebar,toolbar=yes,resizable,centerscreen,';
                let modalStr = Services.prefs.getBoolPref('browser.preferences.instantApply') ? 'dialog=no' : 'modal';
                featureStr = featureStr + modalStr;
                
                this._preferencesWindow = window.openDialog(
                    'chrome://gusto/content/options.xul',
                    'gusto-prefs',
                    featureStr
                );
            }
            
            this._preferencesWindow.focus();
        },
        
        /**
         * Notifier callback for new items
         */
        notifierCallback: {
            notify: async function(event, type, ids, extraData) {
                if (event !== 'add' || type !== 'item') return;
                
                // Check if auto-archive is enabled
                let archiveOnAdd = Zotero.Prefs.get('extensions.gusto.archiveonadd');
                if (archiveOnAdd === 'no') return;
                
                let items = await Zotero.Items.getAsync(ids);
                
                for (let item of items) {
                    // Skip attachments and notes
                    if (item.isAttachment() || item.isNote()) continue;
                    
                    // Get default archive
                    let archiveName = Zotero.Prefs.get('extensions.gusto.whatarchive');
                    if (archiveName === 'random') {
                        archiveName = null;
                    }
                    
                    Zotero.debug('Gusto: Auto-archiving item ' + item.id);
                    Zotero.GustoCreator.makeRobustLink(archiveName, item, false);
                }
            }
        }
    };
}