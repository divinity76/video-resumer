#!/bin/sh
# Generate Chrome extension
cd "$(dirname "$0")"
cd src
rm -f ../chrome-video-resumer.zip manifest.json chrome_video_resumer_unpacked
cp manifest_chrome.json manifest.json
# Create the .xpi file, excluding both manifest_chrome.json and manifest_firefox.json, and using the temporary manifest.json
7z a -tzip -mx=9 -r ../chrome-video-resumer.zip * -x!manifest_chrome.json -x!manifest_firefox.json
rm manifest.json
cd ..
7z x -y chrome-video-resumer.zip -ochrome_video_resumer_unpacked
