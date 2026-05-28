#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="Solo Leveling System"
SCHEME="App"

echo "🔧 Building Solo Leveling System IPA..."

# Build archive
xcodebuild archive \
  -project "$PROJECT_DIR/App.xcodeproj" \
  -scheme "$SCHEME" \
  -destination "generic/platform=iOS" \
  -archivePath "$PROJECT_DIR/build/$APP_NAME.xcarchive" \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM"

# Export IPA
xcodebuild -exportArchive \
  -archivePath "$PROJECT_DIR/build/$APP_NAME.xcarchive" \
  -exportOptionsPlist "$PROJECT_DIR/ExportOptions.plist" \
  -exportPath "$PROJECT_DIR/build/IPA"

echo "✅ IPA created at: $PROJECT_DIR/build/IPA/$APP_NAME.ipa"
