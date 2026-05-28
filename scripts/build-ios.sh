#!/bin/bash
set -e

echo "🔧 Solo Leveling System — iOS Build"
echo ""

cd "$(dirname "$0")/.."

# Build web assets
echo "📦 Building web assets..."
npm run build

# Sync to iOS
echo "📲 Syncing to iOS project..."
npx cap sync ios

# Auto-detect team ID
TEAM_ID=""
if [ -z "$DEVELOPMENT_TEAM" ]; then
  echo "🔍 Auto-detecting Apple Development Team ID..."
  TEAM_ID=$(./ios/App/detect-team.sh 2>/dev/null || true)
  if [ -n "$TEAM_ID" ]; then
    export DEVELOPMENT_TEAM="$TEAM_ID"
    echo "✅ Found Team ID: $DEVELOPMENT_TEAM"
  fi
fi

# Build IPA via command line (faster than GUI)
echo ""
echo "🚀 Building IPA..."
cd ios/App
./build-ipa.sh
