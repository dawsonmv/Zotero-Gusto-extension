# Zotero 7 Development Environment Setup

## Environment Configuration

### Zotero Beta Installation
- **Application**: `/Applications/Zotero Beta.app`
- **Developer Profile**: `~/ZoteroDevProfile`
- **Extension ID**: `zotero-robustlinks@mementoweb.org`

### Development Setup Complete
1. ✅ Created extension link file in dev profile extensions directory
2. ✅ Extension will be loaded from: `/Users/dawsonvaldes/zotero-plugin-repos/zotero-gusto-extension`
3. ✅ Zotero Beta launched with developer console

### Launch Commands

#### With Console and Cache Purge
```bash
open -a "Zotero Beta" --args -P "ZoteroDev" -purgecaches -jsconsole
```

#### Normal Launch
```bash
open -a "Zotero Beta" --args -P "ZoteroDev"
```

### Development Workflow

1. **Make Code Changes**: Edit files in the extension directory
2. **Reload Extension**: 
   - For minor changes: Use Zotero's Tools → Developer → Restart with Logging Enabled
   - For major changes: Restart Zotero Beta completely
3. **Debug**: Use the JavaScript console to debug issues

### Debugging Tools

- **JavaScript Console**: Automatically opened with `-jsconsole` flag
- **Error Console**: Tools → Developer → Error Console
- **Run JavaScript**: Tools → Developer → Run JavaScript
- **Debug Output Logging**: Tools → Developer → Enable Debug Output Logging

### Important Notes

- The extension is loaded via a pointer file (not a symlink) in the extensions directory
- Changes to manifest files require a full Zotero restart
- Use `-purgecaches` flag when testing significant changes
- The dev profile is separate from your main Zotero profile

### Next Steps

1. Verify the extension loads (check Tools → Add-ons)
2. Check the console for any loading errors
3. Begin migration work starting with manifest.json creation