# Gusto Extension Test Checklist for Zotero 7

## Initial Load Test

1. **Check JavaScript Console** (should be open automatically)
   - Look for "Gusto: Initializing extension" message
   - Check for any error messages

2. **Check Add-ons Manager**
   - Go to Tools → Add-ons
   - Verify "Gusto - Robust Links for Zotero" appears in the list
   - Check that it shows as enabled
   - Version should be 3.0.0

## Menu Integration Test

3. **Right-click Menu Test**
   - Select any item in your library
   - Right-click to open context menu
   - Look for "Robustify This Resource" menu with submenu containing:
     - Default Web Archive
     - Any Web Archive
     - Internet Archive
     - Archive.Today

4. **Tools Menu Test**
   - Click Tools menu
   - Look for "Gusto Preferences..." (should appear after Zotero Preferences)

## Functionality Test

5. **Manual Archive Test**
   - Add a new web page item with a URL
   - Right-click → Robustify This Resource → Internet Archive
   - Check for progress notification
   - Verify "Gusto Link" attachment is created

6. **Auto-Archive Test**
   - Ensure auto-archive is enabled in preferences
   - Add a new web page item with URL
   - Should automatically create archive

## Preference Test

7. **Open Preferences**
   - Tools → Gusto Preferences...
   - Check that preference window opens
   - Verify settings can be changed

## Console Commands for Debugging

Run these in the JavaScript console to check extension status:

```javascript
// Check if extension loaded
Zotero.Gusto

// Check preferences
Zotero.Prefs.get('extensions.gusto.archiveonadd')
Zotero.Prefs.get('extensions.gusto.whatarchive')

// Test archive creation manually
Zotero.GustoCreator.makeRobustLink('archive.org', null, true)
```

## Common Issues and Solutions

- **Extension not appearing**: Check console for loading errors
- **Menus not showing**: May need to restart Zotero
- **Archive fails**: Check network connection and API availability