#!/bin/bash

rm gusto.xpi
zip -r gusto.xpi chrome
zip -ur gusto.xpi install.rdf
zip -ur gusto.xpi chrome.manifest
zip -ur gusto.xpi manifest.json
zip -ur gusto.xpi bootstrap.js
zip -ur gusto.xpi prefs.js
zip -ur gusto.xpi update.json
