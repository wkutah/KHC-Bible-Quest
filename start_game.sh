#!/bin/bash
# Helper script to run Bible Word Quest
# Adds the located Node.js path to environment

export PATH="/Users/wilhelmkutah/pinokio/bin/miniconda/pkgs/nodejs-22.21.1-hf2fe37f_0/bin:$PATH"
echo "Starting Bible Word Quest..."
npm run dev
