# Zotero 7 Implementation Guide for Gusto Extension

## Step-by-Step Implementation Plan

This guide provides detailed implementation steps with code examples and solutions for migrating the Gusto extension from Zotero 6 to Zotero 7.

## Phase 1: Project Setup (Days 1-3)

### Step 1: Create manifest.json
```json
{
  "manifest_version": 2,
  "name": "Gusto - Robust Links for Zotero",
  "version": "3.0.0",
  "description": "Archive web references using Memento Web framework",
  "author": "Los Alamos National Laboratory",
  "applications": {
    "zotero": {
      "id": "zotero-robustlinks@mementoweb.org",
      "strict_min_version": "6.999",
      "strict_max_version": "7.0.*",
      "update_url": "https://raw.githubusercontent.com/[repo]/releases/latest/update.json"
    }
  },
  "icons": {
    "48": "icon.png",
    "96": "icon@2x.png"
  },
  "main": "bootstrap.js",
  "preferences": {
    "url": "chrome://zotero-robustlinks/content/preferences.html"
  }
}
```

### Step 2: Create bootstrap.js foundation
```javascript
// bootstrap.js
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");

let zoteroRobustLinks;

function startup({ id, version, rootURI }, reason) {
    // Handle Zotero 6 compatibility (resourceURI vs rootURI)
    if (!rootURI) {
        rootURI = resourceURI.spec;
    }
    
    // Wait for Zotero to be ready
    if (typeof Zotero == 'undefined') {
        Services.scriptloader.loadSubScript("chrome://zotero/content/include.js");
    }
    
    // Load main plugin script
    Services.scriptloader.loadSubScript(rootURI + "src/zoteroRobustLinks.js");
    
    // Initialize plugin
    zoteroRobustLinks = new ZoteroRobustLinks();
    zoteroRobustLinks.init({ id, version, rootURI });
}

function shutdown({ id, version, rootURI }, reason) {
    if (reason == APP_SHUTDOWN) {
        return;
    }
    
    // Clean up
    if (zoteroRobustLinks) {
        zoteroRobustLinks.uninit();
        zoteroRobustLinks = undefined;
    }
}

function install(data, reason) {
    // Installation logic if needed
}

function uninstall(data, reason) {
    // Uninstallation logic if needed
}

// Window hooks for Zotero 7
function onMainWindowLoad({ window }) {
    if (zoteroRobustLinks) {
        zoteroRobustLinks.onMainWindowLoad(window);
    }
}

function onMainWindowUnload({ window }) {
    if (zoteroRobustLinks) {
        zoteroRobustLinks.onMainWindowUnload(window);
    }
}
```

### Step 3: Create directory structure
```bash
zotero-gusto-extension/
├── manifest.json
├── bootstrap.js
├── prefs.js
├── update.json
├── icon.png
├── icon@2x.png
├── src/
│   ├── zoteroRobustLinks.js
│   ├── robustLinksCreator.js
│   ├── content/
│   │   └── preferences.html
│   └── locale/
│       └── en-US/
│           └── robustlinks.properties
├── translators/
└── build/
```

## Phase 2: Core Plugin Implementation (Days 4-7)

### Step 4: Convert main plugin class
```javascript
// src/zoteroRobustLinks.js
class ZoteroRobustLinks {
    constructor() {
        this.id = 'zotero-robustlinks@mementoweb.org';
        this.windows = [];
        this.menuItems = [];
        this.observers = [];
    }
    
    init({ id, version, rootURI }) {
        this.rootURI = rootURI;
        this.version = version;
        
        // Load RobustLinksCreator
        Services.scriptloader.loadSubScript(
            rootURI + "src/robustLinksCreator.js"
        );
        
        // Register observer for new items
        this.registerObserver();
        
        // Initialize preferences
        this.initPreferences();
    }
    
    uninit() {
        // Remove all observers
        this.observers.forEach(observer => {
            Zotero.Notifier.unregisterObserver(observer);
        });
        this.observers = [];
        
        // Clean up windows
        this.windows.forEach(win => {
            this.removeFromWindow(win);
        });
        this.windows = [];
    }
    
    onMainWindowLoad(window) {
        if (!window.ZoteroPane) return;
        
        this.windows.push(window);
        this.addToWindow(window);
    }
    
    onMainWindowUnload(window) {
        this.removeFromWindow(window);
        this.windows = this.windows.filter(w => w !== window);
    }
    
    addToWindow(window) {
        const doc = window.document;
        
        // Add menu items
        this.addContextMenuItems(window);
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts(window);
    }
    
    removeFromWindow(window) {
        // Remove all menu items from this window
        this.menuItems
            .filter(item => item.ownerDocument === window.document)
            .forEach(item => {
                item.remove();
            });
        
        // Clean up references
        this.menuItems = this.menuItems.filter(
            item => item.ownerDocument !== window.document
        );
    }
}
```

### Step 5: Implement menu integration
```javascript
// Add to zoteroRobustLinks.js
addContextMenuItems(window) {
    const doc = window.document;
    
    // Item context menu
    const itemMenu = doc.getElementById('zotero-itemmenu');
    if (itemMenu) {
        // Create separator
        const separator = doc.createXULElement('menuseparator');
        separator.setAttribute('id', 'zotero-robustlinks-separator');
        itemMenu.appendChild(separator);
        this.menuItems.push(separator);
        
        // Create menu item
        const menuItem = doc.createXULElement('menuitem');
        menuItem.setAttribute('id', 'zotero-robustlinks-archive');
        menuItem.setAttribute('label', this.getString('archive.label'));
        menuItem.addEventListener('command', () => {
            this.archiveSelected();
        });
        itemMenu.appendChild(menuItem);
        this.menuItems.push(menuItem);
    }
    
    // Collection context menu
    const collectionMenu = doc.getElementById('zotero-collectionmenu');
    if (collectionMenu) {
        const menuItem = doc.createXULElement('menuitem');
        menuItem.setAttribute('id', 'zotero-robustlinks-archive-collection');
        menuItem.setAttribute('label', this.getString('archiveCollection.label'));
        menuItem.addEventListener('command', () => {
            this.archiveCollection();
        });
        collectionMenu.appendChild(menuItem);
        this.menuItems.push(menuItem);
    }
}
```

### Step 6: Handle preferences
```javascript
// src/content/preferences.html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Gusto Preferences</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
            padding: 20px;
        }
        .preference-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
        }
        select, input[type="checkbox"] {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="preference-group">
        <label for="archive-service">Default Archive Service:</label>
        <select id="archive-service" preference="extensions.zotero.robustlinks.archiveService">
            <option value="internetarchive">Internet Archive</option>
            <option value="archivetoday">Archive.today</option>
            <option value="both">Both</option>
        </select>
    </div>
    
    <div class="preference-group">
        <label>
            <input type="checkbox" id="auto-archive" 
                   preference="extensions.zotero.robustlinks.autoArchive">
            Automatically archive items when added
        </label>
    </div>
    
    <div class="preference-group">
        <label>
            <input type="checkbox" id="include-snapshot" 
                   preference="extensions.zotero.robustlinks.includeSnapshot">
            Include web page snapshot with archive
        </label>
    </div>
    
    <script>
        // Bind preferences to form elements
        document.querySelectorAll('[preference]').forEach(element => {
            const pref = element.getAttribute('preference');
            
            // Load preference value
            if (element.type === 'checkbox') {
                element.checked = Zotero.Prefs.get(pref);
            } else {
                element.value = Zotero.Prefs.get(pref);
            }
            
            // Save on change
            element.addEventListener('change', () => {
                if (element.type === 'checkbox') {
                    Zotero.Prefs.set(pref, element.checked);
                } else {
                    Zotero.Prefs.set(pref, element.value);
                }
            });
        });
    </script>
</body>
</html>
```

### Step 7: Create prefs.js for default preferences
```javascript
// prefs.js
pref("extensions.zotero.robustlinks.archiveService", "internetarchive");
pref("extensions.zotero.robustlinks.autoArchive", true);
pref("extensions.zotero.robustlinks.includeSnapshot", false);
```

## Phase 3: Migration of Core Functionality (Days 8-10)

### Step 8: Update RobustLinksCreator
```javascript
// src/robustLinksCreator.js
// Minimal changes needed - mostly updating API calls
if (typeof Zotero === 'undefined') {
    var Zotero = Components.classes["@zotero.org/Zotero;1"]
        .getService(Components.interfaces.nsISupports).wrappedJSObject;
}

// Update notification registration
registerObserver() {
    const notifierID = Zotero.Notifier.registerObserver({
        notify: async (event, type, ids, extraData) => {
            if (type === 'item' && event === 'add') {
                if (Zotero.Prefs.get('extensions.zotero.robustlinks.autoArchive')) {
                    for (let id of ids) {
                        await this.archiveItem(id);
                    }
                }
            }
        }
    }, ['item']);
    
    this.observers.push(notifierID);
}
```

### Step 9: Implement localization
```properties
# src/locale/en-US/robustlinks.properties
archive.label=Create Robust Link
archiveCollection.label=Create Robust Links for Collection
archive.progress=Creating robust link...
archive.success=Robust link created successfully
archive.error=Failed to create robust link: %S
```

```javascript
// Add to zoteroRobustLinks.js
getString(name, params) {
    if (params) {
        return Zotero.getString(`robustlinks.${name}`, params);
    }
    return Zotero.getString(`robustlinks.${name}`);
}
```

## Phase 4: Build System (Days 11-12)

### Step 10: Create modern build script
```javascript
// build.js
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const version = JSON.parse(fs.readFileSync('manifest.json')).version;
const xpiName = `gusto-${version}.xpi`;

const output = fs.createWriteStream(path.join('build', xpiName));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
    console.log(`Created ${xpiName} (${archive.pointer()} bytes)`);
});

archive.on('error', (err) => {
    throw err;
});

archive.pipe(output);

// Add files
archive.file('manifest.json', { name: 'manifest.json' });
archive.file('bootstrap.js', { name: 'bootstrap.js' });
archive.file('prefs.js', { name: 'prefs.js' });
archive.directory('src/', 'src');
archive.directory('translators/', 'translators');

// For Zotero 6 compatibility
archive.file('install.rdf', { name: 'install.rdf' });
archive.file('chrome.manifest', { name: 'chrome.manifest' });

archive.finalize();
```

### Step 11: Create update.json
```json
{
  "addons": {
    "zotero-robustlinks@mementoweb.org": {
      "updates": [
        {
          "version": "3.0.0",
          "update_link": "https://github.com/[repo]/releases/download/v3.0.0/gusto-3.0.0.xpi",
          "applications": {
            "zotero": {
              "strict_min_version": "6.999"
            }
          }
        }
      ]
    }
  }
}
```

## Phase 5: Testing Strategy (Days 13-14)

### Step 12: Create test checklist
```markdown
## Testing Checklist

### Basic Functionality
- [ ] Plugin installs without errors
- [ ] Plugin can be enabled/disabled
- [ ] Plugin uninstalls cleanly
- [ ] No errors in Zotero console

### Menu Integration
- [ ] Context menu appears on items
- [ ] Context menu appears on collections
- [ ] Menu items trigger correct actions
- [ ] Menu items removed on shutdown

### Core Features
- [ ] Manual archive creation works
- [ ] Auto-archive on item add works
- [ ] Robust link HTML generated correctly
- [ ] Archive services respond correctly

### Preferences
- [ ] Preferences window opens
- [ ] Settings save correctly
- [ ] Settings persist across restarts
- [ ] Default values applied

### Memory Leaks
- [ ] Windows closed properly
- [ ] Event listeners removed
- [ ] No dangling references
```

## Common Issues and Solutions

### Issue 1: Script Loading Cache
**Problem**: Changes to scripts not reflected due to caching
**Solution**: Use timestamp parameter for development
```javascript
Services.scriptloader.loadSubScript(
    rootURI + "src/script.js?" + Date.now()
);
```

### Issue 2: Window Reference Leaks
**Problem**: Memory leaks from window references
**Solution**: Always clean up in onMainWindowUnload
```javascript
onMainWindowUnload(window) {
    // Remove all references to window objects
    this.windows = this.windows.filter(w => w !== window);
    // Cancel any window-specific timers
    if (window._robustLinksTimer) {
        window.clearTimeout(window._robustLinksTimer);
    }
}
```

### Issue 3: Preference Binding
**Problem**: Preferences not updating in UI
**Solution**: Use proper event listeners
```javascript
// In preferences.html
element.addEventListener('change', () => {
    Zotero.Prefs.set(pref, element.value);
    // Notify other windows of change
    Zotero.Notifier.trigger('modify', 'setting', [pref]);
});
```

### Issue 4: XUL Element Creation
**Problem**: createElement doesn't work for XUL in Zotero 7
**Solution**: Use createXULElement
```javascript
// Wrong
const menuitem = doc.createElement('menuitem');

// Correct
const menuitem = doc.createXULElement('menuitem');
```

## Development Workflow

1. **Setup Development Environment**
   ```bash
   # Install Zotero 7 beta
   # Clone repository
   # Install Node.js dependencies
   npm install
   ```

2. **Development Mode**
   ```bash
   # Create symbolic link for development
   ln -s /path/to/dev/folder /path/to/zotero/profiles/extensions/
   ```

3. **Build for Distribution**
   ```bash
   npm run build
   # Creates .xpi in build/ directory
   ```

4. **Debug Tools**
   - Zotero Debug Console: Tools → Developer → Run JavaScript
   - Browser Console: Tools → Developer → Error Console
   - About:config for preference inspection

## Resources

1. **Documentation**
   - [Zotero 7 Developer Guide](https://www.zotero.org/support/dev/zotero_7_for_developers)
   - [Plugin Template](https://github.com/windingwind/zotero-plugin-template)

2. **Example Plugins**
   - Zutilo (bootstrap conversion)
   - Better BibTeX (complex plugin)
   - ZotFile (file management)

3. **Community**
   - Zotero Forums
   - zotero-dev Google Group
   - GitHub Discussions

## Next Steps

1. Begin with Phase 1 setup
2. Test each component incrementally
3. Maintain backward compatibility during transition
4. Gather user feedback through beta testing
5. Plan phased rollout strategy