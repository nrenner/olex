@echo off
@REM for now, simply concatenate all files into one

cd js
type OSMMeta.js ^
 OSMExt.js ^
 OSC.js ^
 OSCAugmented.js ^
 OSCAugmentedDiff.js ^
 OSCAugmentedDiffIDSorted.js ^
 OSMChangeset.js ^
 LayerSwitcherBorder.js ^
 FileReaderControl.js ^
 HoverAndSelectFeature.js ^
 bbox.js ^
 Request-patch.js ^
 > ../dist/olex.js
type distHeader.js ^
 LayerSwitcherBorder.js ^
 HoverAndSelectFeature.js ^
 bbox.js ^
 > ../dist/olex-bbox.js
cd ..
