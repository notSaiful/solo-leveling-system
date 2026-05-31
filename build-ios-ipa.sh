#!/bin/bash
# ============================================================
# SOLO LEVELING SYSTEM — Automated IPA Builder for iOS
# ============================================================
# This script:
#   1. Builds the web app (Vite → dist/)
#   2. Syncs Capacitor iOS assets
#   3. Builds the Xcode project (device first, falls back to simulator)
#   4. Packages the .app into an unsigned IPA
#   5. Outputs the IPA to the project root
#
# The resulting IPA is UNSIGNED.
# Install it on a real iPhone via AltStore, Sideloadly, or sign
# with your own Apple Developer certificate.
#
# For ZERO EFFORT builds: Push to GitHub and the
# .github/workflows/build-ios-ipa.yml Action will build it
# automatically in the cloud and upload the IPA as an artifact.
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
IOS_DIR="$PROJECT_ROOT/ios"
APP_DIR="$IOS_DIR/App"
BUILD_DIR="$APP_DIR/build"
PAYLOAD_DIR="$BUILD_DIR/Payload"
IPA_NAME="SoloLevelingSystem.ipa"
IPA_OUTPUT="$PROJECT_ROOT/$IPA_NAME"

echo "═══════════════════════════════════════════════════"
echo "  SOLO LEVELING SYSTEM — iOS IPA Builder"
echo "═══════════════════════════════════════════════════"
echo ""

# ─── STEP 1: Build Web App ───
echo "[1/5] Building web app with Vite..."
cd "$PROJECT_ROOT"
npm run build

# ─── STEP 2: Sync Capacitor iOS ───
echo ""
echo "[2/5] Syncing Capacitor iOS assets..."
npx cap sync ios

# ─── STEP 3: Build Xcode Project ───
echo ""
echo "[3/5] Building Xcode project..."
cd "$APP_DIR"

# Create build directory
mkdir -p "$BUILD_DIR"

# Try device build first (for real iPhone IPA)
DEVICE_BUILD=false
echo "    Attempting device build (iphoneos)..."
set +e
xcodebuild \
  -project App.xcodeproj \
  -target App \
  -configuration Release \
  -sdk iphoneos \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  ONLY_ACTIVE_ARCH=NO \
  ARCHS="arm64" \
  build >/dev/null 2>&1
set -e

# Check if device .app was produced
APP_PATH=$(find "$BUILD_DIR" -name "App.app" -type d | grep -E 'Release-iphoneos|Release-iphonesimulator' | grep 'Release-iphoneos' | head -1)

if [ -n "$APP_PATH" ]; then
    DEVICE_BUILD=true
    echo "    Device build succeeded."
else
    echo "    Device build failed — iOS platform may not be installed."
    echo "    Falling back to simulator build (runs in iOS Simulator only)..."
    set +e
    xcodebuild \
      -project App.xcodeproj \
      -target App \
      -configuration Release \
      -sdk iphonesimulator \
      CODE_SIGN_IDENTITY="" \
      CODE_SIGNING_REQUIRED=NO \
      CODE_SIGNING_ALLOWED=NO \
      ONLY_ACTIVE_ARCH=NO \
      ARCHS="arm64" \
      build >/dev/null 2>&1
    set -e

    APP_PATH=$(find "$BUILD_DIR" -name "App.app" -type d | head -1)
    if [ -z "$APP_PATH" ]; then
        echo ""
        echo "❌ ERROR: Both device and simulator builds failed."
        echo ""
        echo "   Common fixes:"
        echo "   1. Open Xcode → Settings → Components → Download iOS platform"
        echo "   2. Or use the GitHub Actions workflow for zero-effort builds:"
        echo "      Push to GitHub → Actions tab → Download the IPA artifact"
        exit 1
    fi
fi

# ─── STEP 4: Locate the .app bundle ───
echo ""
echo "[4/5] Packaging .app into IPA..."

echo "    Found app bundle: $APP_PATH"

# ─── STEP 5: Package IPA ───
rm -rf "$PAYLOAD_DIR"
mkdir -p "$PAYLOAD_DIR"
cp -R "$APP_PATH" "$PAYLOAD_DIR/"

# Remove old IPA
rm -f "$IPA_OUTPUT"

cd "$BUILD_DIR"
zip -qr "$IPA_OUTPUT" Payload

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ IPA CREATED SUCCESSFULLY"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  File: $IPA_OUTPUT"
echo "  Size: $(du -h "$IPA_OUTPUT" | cut -f1)"

if [ "$DEVICE_BUILD" = true ]; then
    echo "  Type: Device build (arm64) — can be sideloaded to iPhone"
else
    echo "  Type: Simulator build — ONLY runs in iOS Simulator"
fi

echo ""
echo "  ⚠️  This IPA is UNSIGNED."
echo "     Install it using one of these methods:"
echo ""
echo "     1. AltStore (Free, no jailbreak)"
echo "        → https://altstore.io"
echo "        → Install AltStore on your Mac/PC + iPhone"
echo "        → Drag & drop the IPA into AltStore"
echo ""
echo "     2. Sideloadly (Free, no jailbreak)"
echo "        → https://sideloadly.io"
echo "        → Connect iPhone via USB, select IPA, install"
echo ""
echo "     3. Apple Developer Account (Official)"
echo "        → Sign with your $99/year Apple Developer cert"
echo "        → Upload to App Store or install via Xcode"
echo ""
echo "  ☁️  ZERO-EFFORT OPTION: Use GitHub Actions"
echo "     Push this repo to GitHub. The workflow at"
echo "     .github/workflows/build-ios-ipa.yml builds"
echo "     the IPA automatically and uploads it as"
echo "     a downloadable artifact. No Xcode needed."
echo ""
echo "═══════════════════════════════════════════════════"
