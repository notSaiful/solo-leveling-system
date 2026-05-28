#!/bin/bash
set -e

echo "🔧 Building Solo Leveling System for iOS..."

# Build web assets
npm run build

# Sync to iOS
npx cap sync ios

# Open Xcode project
npx cap open ios

echo "✅ Xcode project opened."
echo ""
echo "To build IPA:"
echo "1. In Xcode, select your Apple ID in Signing & Capabilities"
echo "2. Select 'Any iOS Device' as target"
echo "3. Product → Archive"
echo "4. Distribute App → Ad Hoc / App Store / Development"
echo ""
echo "To run on simulator:"
echo "1. Select an iPhone simulator"
echo "2. Press Cmd+R"
