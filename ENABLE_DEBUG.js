// Enable debug logging and check for extension errors
Zotero.Debug.setLevel(5);
Zotero.Debug.init(true);
Zotero.Prefs.set('debug.store', true);

// Now try to check extensions directory
const profDir = Zotero.Profile.dir;
return "Debug enabled. Profile directory: " + profDir;