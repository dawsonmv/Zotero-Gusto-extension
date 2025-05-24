/**
 * Gusto extension for Zotero 7
 * Main extension class that handles initialization, window management, and core functionality
 */

Zotero.Gusto = function() {
    this.id = null;
    this.version = null;
    this.rootURI = null;
    this.initialized = false;
    this.addedElementIDs = [];
    this.notifierID = null;
};

Zotero.Gusto.prototype = {
    init({ id, version, rootURI }) {
        if (this.initialized) return;
        this.id = id;
        this.version = version;
        this.rootURI = rootURI;
        this.initialized = true;
        
        this.log('Initializing extension');
        
        // Register notifier for new items
        this.notifierID = Zotero.Notifier.registerObserver(this.notifierCallback, ['item']);
    },
    
    log(msg) {
        Zotero.debug("Gusto: " + msg);
    },
    
    addToWindow(window) {
        let doc = window.document;
        
        // Use Fluent for localization
        window.MozXULElement.insertFTLIfNeeded("gusto.ftl");
        
        // Add context menu items
        this.addContextMenuItems(window);
        
        // Store reference for access from other parts of the code
        window.Zotero.Gusto = this;
    },
    
    addToAllWindows() {
        var windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (!win.ZoteroPane) continue;
            this.addToWindow(win);
        }
    },
    
    storeAddedElement(elem) {
        if (!elem.id) {
            throw new Error("Element must have an id");
        }
        this.addedElementIDs.push(elem.id);
    },
    
    removeFromWindow(window) {
        var doc = window.document;
        // Remove all elements added to DOM
        for (let id of this.addedElementIDs) {
            doc.getElementById(id)?.remove();
        }
        
        // Remove Fluent localization link if it exists
        doc.querySelector('[href="gusto.ftl"]')?.remove();
        
        // Clean up references
        if (window.Zotero && window.Zotero.Gusto) {
            delete window.Zotero.Gusto;
        }
    },
    
    removeFromAllWindows() {
        var windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (!win.ZoteroPane) continue;
            this.removeFromWindow(win);
        }
        
        // Unregister notifier
        if (this.notifierID) {
            Zotero.Notifier.unregisterObserver(this.notifierID);
            this.notifierID = null;
        }
    },
    
    async main() {
        // Register default preferences
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
        
        this.log(`Archive on add: ${Zotero.Prefs.get('extensions.gusto.archiveonadd', true)}`);
    },
    
    /**
     * Add context menu items using modern approach
     */
    addContextMenuItems(window) {
        let doc = window.document;
        
        // Item context menu
        let itemMenu = doc.getElementById('zotero-itemmenu');
        if (itemMenu) {
            // Add separator
            let separator = doc.createXULElement('menuseparator');
            separator.id = 'gusto-separator';
            itemMenu.appendChild(separator);
            this.storeAddedElement(separator);
            
            // Add menu with submenu
            let menu = doc.createXULElement('menu');
            menu.id = 'gusto-menu';
            menu.setAttribute('data-l10n-id', 'gusto-menu-robustify');
            
            let menupopup = doc.createXULElement('menupopup');
            
            // Archive now menu item
            let archiveNow = doc.createXULElement('menuitem');
            archiveNow.id = 'gusto-archive-now';
            archiveNow.setAttribute('data-l10n-id', 'gusto-archive-now');
            archiveNow.addEventListener('command', () => {
                this.archiveNow(window);
            });
            menupopup.appendChild(archiveNow);
            
            // Submit to all archives menu item
            let submitAll = doc.createXULElement('menuitem');
            submitAll.id = 'gusto-submit-all';
            submitAll.setAttribute('data-l10n-id', 'gusto-submit-all');
            submitAll.addEventListener('command', () => {
                this.submitToAllArchives(window);
            });
            menupopup.appendChild(submitAll);
            
            // Add separator
            let menuSeparator = doc.createXULElement('menuseparator');
            menupopup.appendChild(menuSeparator);
            
            // Find Robustified menu item
            let findRobustified = doc.createXULElement('menuitem');
            findRobustified.id = 'gusto-find-robustified';
            findRobustified.setAttribute('data-l10n-id', 'gusto-find-robustified');
            findRobustified.addEventListener('command', () => {
                this.findRobustified(window);
            });
            menupopup.appendChild(findRobustified);
            
            // Preferences menu item
            let preferences = doc.createXULElement('menuitem');
            preferences.id = 'gusto-preferences';
            preferences.setAttribute('data-l10n-id', 'gusto-preferences');
            preferences.addEventListener('command', () => {
                this.openPreferences(window);
            });
            menupopup.appendChild(preferences);
            
            menu.appendChild(menupopup);
            itemMenu.appendChild(menu);
            this.storeAddedElement(menu);
        }
        
        // Tools menu
        let toolsMenu = doc.getElementById('menu_ToolsPopup');
        if (toolsMenu) {
            let toolsItem = doc.createXULElement('menuitem');
            toolsItem.id = 'gusto-tools-preferences';
            toolsItem.setAttribute('data-l10n-id', 'gusto-tools-preferences');
            toolsItem.addEventListener('command', () => {
                this.openPreferences(window);
            });
            toolsMenu.appendChild(toolsItem);
            this.storeAddedElement(toolsItem);
        }
    },
    
    /**
     * Archive now action
     */
    archiveNow(window) {
        let items = window.ZoteroPane.getSelectedItems();
        if (!items || items.length === 0) {
            window.alert("Please select at least one item to archive.");
            return;
        }
        
        for (let item of items) {
            this.robustifyItem(item);
        }
    },
    
    /**
     * Submit to all archives action
     */
    submitToAllArchives(window) {
        let items = window.ZoteroPane.getSelectedItems();
        if (!items || items.length === 0) {
            window.alert("Please select at least one item to archive.");
            return;
        }
        
        for (let item of items) {
            this.submitItemToAllArchives(item);
        }
    },
    
    /**
     * Find robustified URLs action
     */
    findRobustified(window) {
        let items = window.ZoteroPane.getSelectedItems();
        if (!items || items.length === 0) {
            window.alert("Please select at least one item to check.");
            return;
        }
        
        this.findRobustifiedForItems(items, window);
    },
    
    /**
     * Open preferences dialog
     */
    openPreferences(window) {
        window.openDialog(
            this.rootURI + 'chrome/content/gusto/options.xul',
            'gusto-preferences',
            'chrome,centerscreen'
        );
    },
    
    /**
     * Notifier callback for new items
     */
    notifierCallback: {
        notify: function(event, type, ids, extraData) {
            if (event !== 'add' || type !== 'item') return;
            
            // Check if auto-archive is enabled
            if (Zotero.Prefs.get('extensions.gusto.archiveonadd') !== 'yes') return;
            
            // Process new items
            Zotero.setTimeout(() => {
                for (let id of ids) {
                    let item = Zotero.Items.get(id);
                    if (item && !item.isNote() && !item.isAttachment()) {
                        Zotero.Gusto.prototype.robustifyItem.call(this, item);
                    }
                }
            }, 1000);
        }.bind(this)
    },
    
    /**
     * Robustify a single item
     */
    robustifyItem: async function(item) {
        let url = item.getField('url');
        if (!url) return;
        
        this.log('Robustifying item: ' + item.getField('title'));
        
        // Use GustoCreator to create robust links
        let creator = new Zotero.GustoCreator();
        let archiveUrl = await creator.robustifyUrl(url);
        
        if (archiveUrl) {
            // Add archive URL to extra field
            let extra = item.getField('extra') || '';
            if (!extra.includes(archiveUrl)) {
                extra += (extra ? '\n' : '') + 'Archive: ' + archiveUrl;
                item.setField('extra', extra);
                await item.saveTx();
            }
        }
    },
    
    /**
     * Submit item to all archives
     */
    submitItemToAllArchives: async function(item) {
        let url = item.getField('url');
        if (!url) return;
        
        this.log('Submitting to all archives: ' + item.getField('title'));
        
        let creator = new Zotero.GustoCreator();
        await creator.submitToAllArchives(url);
    },
    
    /**
     * Find robustified URLs for items
     */
    findRobustifiedForItems: async function(items, window) {
        let results = [];
        
        for (let item of items) {
            let url = item.getField('url');
            if (!url) continue;
            
            let creator = new Zotero.GustoCreator();
            let archives = await creator.findArchives(url);
            
            if (archives && archives.length > 0) {
                results.push({
                    title: item.getField('title'),
                    url: url,
                    archives: archives
                });
            }
        }
        
        if (results.length > 0) {
            let message = "Found robustified URLs:\n\n";
            for (let result of results) {
                message += result.title + "\n";
                for (let archive of result.archives) {
                    message += "  - " + archive + "\n";
                }
                message += "\n";
            }
            window.alert(message);
        } else {
            window.alert("No robustified URLs found for the selected items.");
        }
    }
};