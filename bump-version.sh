#!/bin/sh
# Give style.css / calc.js / app.js new URLs so browsers fetch the new files
# instead of using a cached copy. Run before committing any change to them.
set -e
cd "$(dirname "$0")"
v=$(date +%Y%m%d%H%M%S)
sed -i.bak -E "s/\.(css|js)\?v=[0-9A-Za-z.-]+\"/.\1?v=$v\"/g" index.html && rm -f index.html.bak
echo "Asset version set to $v"
