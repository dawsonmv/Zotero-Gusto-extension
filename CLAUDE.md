# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Robust Links Extension for Zotero (currently for version 6, needs migration to version 7). The extension helps organize and manage archived web-page-links to references for academic research papers using the Memento Web framework.

## Build Commands

```bash
# Build the extension XPI file
./build.sh

# Update version number (adds timestamp)
./raiseversion.sh

# Install translators to local Zotero
./install-translators.sh
```

## Architecture Overview

### Core Components

1. **RobustLinksCreator.js** - Handles creation of robust links via Memento Web API
   - Creates archived versions of web resources
   - Generates HTML snippets with both original and archived URLs
   - Handles DOI conversion to https://doi.org/ format

2. **ZoteroRobustLinks.js** - Main plugin initialization and Zotero integration
   - Registers with Zotero's notification system
   - Manages auto-archive functionality
   - Handles context menu actions

3. **XUL Overlays** (Zotero 6 style)
   - `overlay.xul` - Adds context menu items to Zotero UI
   - `options.xul` - Preferences dialog for archive selection

### Custom Translators

The extension includes modified Zotero translators in `translators/` that support robust links:
- BibLaTex.js
- MlaWithArchived.js
- RobustLink.js
- Wikipedia Citation Templates.js
- Bookmarks.js

### Migration Notes for Zotero 7

Zotero 7 requires significant changes:
- XUL overlays are deprecated; need to migrate to modern JavaScript/React
- Extension manifest format has changed from install.rdf to manifest.json
- API changes for UI integration and event handling
- New bootstrap.js entry point required

A similar migration was completed in the repository `dawsonmv/zotero-moment-o7` which can serve as a reference for:
- Zotero 7 plugin structure and manifest format
- Modern UI integration patterns
- API migration strategies
- Build process updates

