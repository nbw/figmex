#!/usr/bin/env bash
# exit on error
set -o errexit

# Install deps
npm install --prefix ./assets
mix deps.get --only prod

# Initial setup
MIX_ENV=prod mix assets.deploy
MIX_ENV=prod mix compile