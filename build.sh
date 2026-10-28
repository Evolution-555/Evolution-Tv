#!/bin/bash

# Build script for Evolution TV
# Requires webOS CLI to be installed

echo "Building Evolution TV for LG webOS..."

# Check if ares-package is available
if ! command -v ares-package &> /dev/null; then
    echo "Error: ares-package not found. Install webOS CLI:"
    echo "npm install -g @webosose/ares-cli"
    exit 1
fi

# Package the app
echo "Packaging app..."
ares-package .

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "IPK file created in the current directory."
else
    echo "Build failed!"
    exit 1
fi
