// Check if extension directory exists
var file = Components.classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsIFile);
file.initWithPath("/Users/dawsonvaldes/zotero-plugin-repos/zotero-gusto-extension/manifest.json");
return "Extension directory exists: " + file.exists() + ", Path: " + file.path;