#!/bin/sh
# Generate the XPI file for the extension
# folder: src
cd src
7z a -tzip -mx=9 -r ../video-resumer.xpi *