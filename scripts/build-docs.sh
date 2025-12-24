#!/bin/bash

# Build StudioSync Documentation
# This script builds the MkDocs site and integrates it into the frontend

echo "Building StudioSync Documentation..."

# 1. Install/Update requirements if needed
if [ -f "docs/requirements.txt" ]; then
    echo "Checking documentation requirements..."
    ./.venv/bin/pip install -q -r docs/requirements.txt
fi

# 2. Build the site
echo "Running MkDocs build..."
./.venv/bin/mkdocs build

# 3. Move to frontend public directory
echo "Moving site to frontend/public/docs..."
rm -rf frontend/public/docs
cp -r site frontend/public/docs

echo "Documentation build complete! Available at /docs/index.html in the application."
