#!/bin/bash

# Ensure we are in the src-tauri directory
cd src-tauri
mkdir -p binaries
cd binaries

# Determine architecture for Mac
ARCH=$(uname -m)

echo "Downloading yt-dlp (macOS)..."
if [ "$ARCH" = "arm64" ]; then
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos -o yt-dlp-aarch64-apple-darwin
    chmod +x yt-dlp-aarch64-apple-darwin
else
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos -o yt-dlp-x86_64-apple-darwin
    chmod +x yt-dlp-x86_64-apple-darwin
fi

echo "Downloading bun (macOS)..."
if [ "$ARCH" = "arm64" ]; then
    curl -L https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-aarch64.zip -o bun.zip
    unzip bun.zip
    mv bun-darwin-aarch64/bun bun-aarch64-apple-darwin
    rm -r bun.zip bun-darwin-aarch64
else
    curl -L https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-x64.zip -o bun.zip
    unzip bun.zip
    mv bun-darwin-x64/bun bun-x86_64-apple-darwin
    rm -r bun.zip bun-darwin-x64
fi

echo "Downloading ffmpeg (macOS) via npm..."
# We use npm to fetch a pre-compiled, static standard ffmpeg binary for macOS
npm init -y > /dev/null
if [ "$ARCH" = "arm64" ]; then
    npm install @ffmpeg-installer/darwin-arm64 > /dev/null
    cp node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg ffmpeg-aarch64-apple-darwin
else
    npm install @ffmpeg-installer/darwin-x64 > /dev/null
    cp node_modules/@ffmpeg-installer/darwin-x64/ffmpeg ffmpeg-x86_64-apple-darwin
fi
rm -rf node_modules package.json package-lock.json

echo "Done downloading sidecars!"
