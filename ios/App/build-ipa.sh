#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="Solo Leveling System"
SCHEME="App"

echo "🔧 Building Solo Leveling System IPA..."

# Auto-detect team ID if not set
if [ -z "$DEVELOPMENT_TEAM" ]; then
  echo "🔍 Auto-detecting Apple Development Team ID..."
  DETECTED_TEAM=$($PROJECT_DIR/detect-team.sh || true)
  if [ -n "$DETECTED_TEAM" ]; then
    export DEVELOPMENT_TEAM="$DETECTED_TEAM"
    echo "✅ Found Team ID: $DEVELOPMENT_TEAM"
  else
    echo "⚠️  No Team ID found. Please set it manually:"
    echo "   DEVELOPMENT_TEAM=YOUR_TEAM_ID ./build-ipa.sh"
    echo ""
    echo "Or open in Xcode and set Signing & Capabilities:"
    echo "   npx cap open ios"
    exit 1
  fi
fi

# Build archive
echo "📦 Creating archive..."
xcodebuild archive \
  -project "$PROJECT_DIR/App.xcodeproj" \
  -scheme "$SCHEME" \
  -destination "generic/platform=iOS" \
  -archivePath "$PROJECT_DIR/build/$APP_NAME.xcarchive" \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM" \
  | xcbeautify || cat

# Export IPA
echo "📱 Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath "$PROJECT_DIR/build/$APP_NAME.xcarchive" \
  -exportOptionsPlist "$PROJECT_DIR/ExportOptions.plist" \
  -exportPath "$PROJECT_DIR/build/IPA" \
  | xcbeautify || cat

echo ""
echo "✅ IPA created successfully!"
echo "📁 Location: $PROJECT_DIR/build/IPA/$APP_NAME.ipa"
