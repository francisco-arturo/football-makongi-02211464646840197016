#!/bin/bash
set -e

echo "=== Makongi FC prototype verification ==="
node ./scripts/verify.mjs
echo ""
echo "=== Verification Complete ==="
echo "The app data, required artifacts, routes and HTTP entrypoints are healthy."
