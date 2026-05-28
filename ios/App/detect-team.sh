#!/bin/bash
# Auto-detect Apple Development Team ID from keychain

TEAM_ID=""

# Method 1: Find from signing identities
IDENTITY=$(security find-identity -v -p codesigning 2>/dev/null | grep "Apple Development" | head -1 | sed 's/.*Apple Development://' | sed 's/\(.*\)//' | xargs)

if [ -n "$IDENTITY" ]; then
  # Extract team ID from the identity string (format: Name (TeamID))
  TEAM_ID=$(echo "$IDENTITY" | grep -oE '\([A-Z0-9]{10}\)' | tr -d '()')
fi

# Method 2: Find from provisioning profiles
if [ -z "$TEAM_ID" ]; then
  TEAM_ID=$(grep -A1 "TeamIdentifier" ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision 2>/dev/null | grep -oE '<string>[A-Z0-9]{10}</string>' | head -1 | sed 's/<[^>]*>//g')
fi

# Method 3: Find from certificate
if [ -z "$TEAM_ID" ]; then
  TEAM_ID=$(security find-identity -v -p codesigning 2>/dev/null | grep -oE '\([A-Z0-9]{10}\)' | head -1 | tr -d '()')
fi

if [ -n "$TEAM_ID" ]; then
  echo "$TEAM_ID"
  exit 0
else
  echo ""
  exit 1
fi
