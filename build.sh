#!/bin/sh

# for now, simply concatenate all files into one
#cat js/*.js > dist/olex.js

cd js
cat OSMMeta.js \
    OSMExt.js \
    OSC.js \
    OSCAugmented.js \
    OSCAugmentedDiff.js \
    OSCAugmentedDiffIDSorted.js \
    OSMChangeset.js \
    LayerSwitcherBorder.js \
    FileReaderControl.js \
    HoverAndSelectFeature.js \
    bbox.js \
    Request-patch.js \
    > ../dist/olex.js
cat distHeader.js \
    LayerSwitcherBorder.js \
    HoverAndSelectFeature.js \
    bbox.js \
    > ../dist/olex-bbox.js
cd ..
