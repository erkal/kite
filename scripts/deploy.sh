#!/bin/bash

set -e

echo "- Checking out deployment branch..."
git checkout gh-pages
echo

echo "- Merging master into deployment branch..."
git merge master -m "Merging master" --strategy-option theirs
echo

echo "- Compiling..."
elm make src/Main.elm --optimize --output=elm.js
uglifyjs elm.js --compress 'pure_funcs="F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9",pure_getters,keep_fargs=false,unsafe_comps,unsafe' | uglifyjs --mangle --output=elm.js
echo

echo "- Comitting elm.js..."
git add -f elm.js
git commit -m "committed elm.js"
echo

echo "- Pushing built result..."
git push -f
echo

echo "- Checking out master..."
git checkout master
echo

echo "- Deployment successful :)"