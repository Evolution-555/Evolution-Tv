# Manual IPK Build Instructions

Since the GitHub Actions workflow needs to be fixed, here's how to build the IPK manually:

## Prerequisites

1. **Install Node.js** (if not already installed): https://nodejs.org/

2. **Install webOS CLI**:
   ```bash
   npm install -g @webosose/ares-cli
   ```

## Build Steps

1. **Navigate to the project**:
   ```bash
   cd lg-fusion-tv
   ```

2. **Build the IPK**:
   ```bash
   ares-package .
   ```

   This will create a file like: `com.evolution555.evolutiontv_1.0.0_all.ipk`

3. **Rename the IPK** (optional, for consistency):
   ```bash
   mv com.evolution555.evolutiontv_1.0.0_all.ipk evolution-tv.ipk
   ```

## Upload to GitHub Releases

1. **Go to GitHub Releases**:
   https://github.com/Evolution-555/Evolution-Tv/releases

2. **Edit the v1.0.0 release** (or create a new one)

3. **Upload the IPK file**:
   - Click "Attach binaries"
   - Select the IPK file
   - Upload

4. **Copy the download URL**:
   - Right-click on the uploaded IPK
   - Copy link address
   - It should look like: `https://github.com/Evolution-555/Evolution-Tv/releases/download/v1.0.0/evolution-tv.ipk`

5. **Update apps.json**:
   - Edit `apps.json`
   - Replace the `ipkUrl` with the actual URL
   - Commit and push

## Update apps.json

After uploading the IPK, update `apps.json`:

```json
{
  "apps": [
    {
      "id": "com.evolution555.evolutiontv",
      "title": "Evolution TV",
      "version": "1.0.0",
      "description": "Modular streaming app for LG webOS with comprehensive TV show and movie tracking.",
      "category": "video",
      "icon": "https://raw.githubusercontent.com/Evolution-555/Evolution-Tv/main/icon.svg",
      "ipkUrl": "https://github.com/Evolution-555/Evolution-Tv/releases/download/v1.0.0/evolution-tv.ipk",
      "author": "Evolution-555",
      "homepage": "https://github.com/Evolution-555/Evolution-Tv",
      "changelog": "Initial release"
    }
  ]
}
```

Then commit and push:
```bash
git add apps.json
git commit -m "Add IPK URL to apps.json"
git push
```

## Repository URL for Homebrew Channel

Use this URL in Homebrew Channel:
```
https://raw.githubusercontent.com/Evolution-555/Evolution-Tv/main/apps.json
```

## Alternative: Direct IPK Installation

If the repository doesn't work, users can install directly:

1. Download the IPK from GitHub Releases
2. Transfer to TV (USB or download)
3. Install via Homebrew Channel
