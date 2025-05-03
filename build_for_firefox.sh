#!/bin/sh
# Generate Firefox extension
cd "$(dirname "$0")"
cd src
rm -f ../firefox-video-resumer.xpi
jq -c . manifest_firefox.json > manifest.json
# Create the .xpi file, excluding both manifest_chrome.json and manifest_firefox.json, and using the temporary manifest.json
#7z a -tzip -mx=9 -r ../firefox-video-resumer.xpi * -x!manifest_chrome.json -x!manifest_firefox.json
7z a -tzip -r ../firefox-video-resumer.xpi * -x!manifest_chrome.json -x!manifest_firefox.json
#rm manifest.json
