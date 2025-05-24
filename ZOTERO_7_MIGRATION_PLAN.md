# Zotero 7 Migration Plan for Gusto Extension

## Overview
This document outlines the comprehensive plan for migrating the Zotero Gusto (Robust Links) extension from Zotero 6 to Zotero 7. The migration involves significant architectural changes due to Zotero 7's move away from XUL overlays to a modern plugin architecture.

## Migration Phases

### Phase 1: Project Setup and Structure (Week 1)

#### 1.1 Create New Plugin Structure
- [ ] Create `manifest.json` to replace `install.rdf`
- [ ] Create `bootstrap.js` with lifecycle methods
- [ ] Create `src/` directory for organized code structure
- [ ] Set up modern build process (webpack/esbuild)
- [ ] Create development environment configuration

#### 1.2 Manifest Configuration
```json
{
  "manifest_version": 1,
  "name": "Gusto - Robust Links for Zotero",
  "version": "3.0.0",
  "description": "Archive web references using Memento Web",
  "author": "Los Alamos National Laboratory",
  "id": "zotero-robustlinks@mementoweb.org",
  "applications": {
    "zotero": {
      "update_url": "https://github.com/user/repo/releases/latest/download/update.json",
      "strict_min_version": "7.0"
    }
  },
  "main": "bootstrap.js",
  "preferences": {
    "url": "chrome://zotero-robustlinks/content/preferences.html"
  }
}
```

### Phase 2: Core Functionality Migration (Week 2-3)

#### 2.1 Bootstrap Implementation
- [ ] Implement `startup()` function
  - Initialize plugin
  - Register with Zotero
  - Add menu items programmatically
  - Set up event listeners
- [ ] Implement `shutdown()` function
  - Remove all menu items
  - Unregister event listeners
  - Clean up resources
- [ ] Implement `install()` and `uninstall()` functions
- [ ] Add proper error handling and logging

#### 2.2 Menu Integration
Convert XUL overlay menu items to programmatic insertion:
- [ ] Create menu factory class
- [ ] Add context menu for items
- [ ] Add context menu for collections
- [ ] Implement menu click handlers
- [ ] Add keyboard shortcuts

#### 2.3 Core Logic Migration
- [ ] Port `RobustLinksCreator.js` with minimal changes
- [ ] Update `ZoteroRobustLinks.js` for new architecture
- [ ] Convert event handling from XUL to programmatic
- [ ] Update Zotero API calls for v7 compatibility

### Phase 3: UI Modernization (Week 3-4)

#### 3.1 Preferences Dialog
- [ ] Create `preferences.html` to replace `options.xul`
- [ ] Implement preference storage/retrieval
- [ ] Add CSS styling for native look
- [ ] Implement preference change handlers
- [ ] Add validation and error messages

#### 3.2 User Interface Elements
- [ ] Convert dialog windows to HTML/CSS
- [ ] Implement progress indicators
- [ ] Add status notifications
- [ ] Create error dialogs
- [ ] Ensure accessibility compliance

### Phase 4: Localization Update (Week 4)

#### 4.1 Convert Localization Files
- [ ] Convert DTD files to properties format
- [ ] Create localization structure for Zotero 7
- [ ] Update all string references in code
- [ ] Test with multiple languages
- [ ] Add missing translations

### Phase 5: Translator Updates (Week 5)

#### 5.1 Verify Translator Compatibility
- [ ] Test each translator with Zotero 7
- [ ] Update translator APIs if needed
- [ ] Ensure robust link generation works
- [ ] Update translator installation process
- [ ] Add translator auto-update mechanism

### Phase 6: Build and Distribution (Week 5-6)

#### 6.1 Build Process
- [ ] Create modern build script (Node.js based)
- [ ] Add source mapping for debugging
- [ ] Implement version management
- [ ] Add automated testing setup
- [ ] Create release automation

#### 6.2 Distribution Setup
- [ ] Create `update.json` for auto-updates
- [ ] Set up GitHub releases
- [ ] Create installation documentation
- [ ] Add troubleshooting guide
- [ ] Update README for Zotero 7

### Phase 7: Testing and Quality Assurance (Week 6-7)

#### 7.1 Functional Testing
- [ ] Test all menu items and actions
- [ ] Verify archiving functionality
- [ ] Test preference persistence
- [ ] Check translator exports
- [ ] Validate error handling

#### 7.2 Compatibility Testing
- [ ] Test on Windows, macOS, Linux
- [ ] Verify Zotero 7.0+ compatibility
- [ ] Test with various item types
- [ ] Check memory usage
- [ ] Performance benchmarking

#### 7.3 User Acceptance Testing
- [ ] Beta release to select users
- [ ] Collect feedback
- [ ] Fix reported issues
- [ ] Update documentation
- [ ] Final release preparation

## Technical Considerations

### API Changes
1. **Element Creation**: Use `createXULElement()` instead of `createElement()` for XUL
2. **Window Access**: Use `Services.wm` for window management
3. **Preferences**: Use `Zotero.Prefs` API
4. **Localization**: Use `Zotero.getString()` for localized strings
5. **Events**: Register/unregister all event listeners properly

### Code Organization
```
zotero-gusto-extension/
├── manifest.json
├── bootstrap.js
├── update.json
├── src/
│   ├── content/
│   │   ├── robustLinksCreator.js
│   │   ├── zoteroRobustLinks.js
│   │   └── preferences.html
│   ├── locale/
│   │   └── en-US/
│   │       └── robustlinks.properties
│   └── styles/
│       └── preferences.css
├── translators/
├── build/
└── docs/
```

### Bootstrap.js Structure
```javascript
// Key lifecycle methods
function startup({ id, version, rootURI }, reason) {
    // Initialize plugin
    Services.scriptloader.loadSubScript(rootURI + 'src/content/zoteroRobustLinks.js');
    Zotero.RobustLinks.init();
}

function shutdown({ id, version, rootURI }, reason) {
    // Clean up
    Zotero.RobustLinks.uninit();
}

function install({ id, version, rootURI }, reason) {
    // First-time setup
}

function uninstall({ id, version, rootURI }, reason) {
    // Complete removal
}
```

## Risk Mitigation

### Identified Risks
1. **XUL Deprecation**: Complete UI rewrite required
2. **API Breaking Changes**: Extensive testing needed
3. **Performance Impact**: Monitor memory and CPU usage
4. **User Migration**: Clear upgrade path required

### Mitigation Strategies
1. Reference `dawsonmv/zotero-moment-o7` for patterns
2. Implement comprehensive error logging
3. Create rollback mechanism
4. Provide migration guide for users
5. Maintain Zotero 6 version during transition

## Timeline Summary
- **Total Duration**: 6-7 weeks
- **Phase 1-2**: Core migration (3 weeks)
- **Phase 3-5**: Feature parity (2-3 weeks)
- **Phase 6-7**: Polish and release (1-2 weeks)

## Success Criteria
1. All Zotero 6 features working in Zotero 7
2. No performance degradation
3. Smooth upgrade experience
4. Positive user feedback
5. Stable auto-update mechanism

## Next Steps
1. Set up Zotero 7 development environment
2. Create project branch for migration
3. Begin Phase 1 implementation
4. Set up CI/CD pipeline
5. Recruit beta testers