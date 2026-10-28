# Making Evolution TV Available in Homebrew Channel

## Option 1: Submit to Official Homebrew Channel App Store

### Benefits:
- Official listing in Homebrew Channel app store
- Automatic updates via Homebrew Channel
- Maximum visibility to users
- Trusted by the community

### Steps to Submit:

1. **Prepare App Metadata**:
   - Create a detailed description
   - Take screenshots (required)
   - Define app category (Video/Media)
   - Prepare app icon (PNG format)

2. **Fork the Homebrew Channel Website**:
   ```bash
   git clone https://github.com/webosbrew/webosbrew.github.io.git
   cd webosbrew.github.io
   ```

3. **Add Your App**:
   - Edit `apps.json` with your app details
   - Add screenshots to `apps/evolution-tv/`
   - Follow the existing app format

4. **Submit Pull Request**:
   - Push to your fork
   - Create PR on GitHub
   - Wait for review and approval

### Required Information:
- App name: Evolution TV
- App ID: com.evolution555.evolutiontv
- Category: Video
- Description: Modular streaming app with TV show/movie tracking
- Screenshots: At least 3 screenshots
- Icon: PNG format (80x80 and 130x130)
- IPK URL: GitHub Releases URL
- Version: Current version
- Author: Evolution-555

### Example App Entry:
```json
{
  "id": "com.evolution555.evolutiontv",
  "title": "Evolution TV",
  "version": "1.0.0",
  "description": "Modular streaming app for LG webOS with TV show and movie tracking, Trakt integration, and Debrid support",
  "category": "video",
  "icon": "https://github.com/Evolution-555/Evolution-Tv/raw/main/icon.png",
  "ipkUrl": "https://github.com/Evolution-555/Evolution-Tv/releases/download/v1.0.0/evolution-tv.ipk",
  "author": "Evolution-555",
  "screenshots": [
    "https://github.com/Evolution-555/Evolution-Tv/raw/main/screenshots/screenshot1.png",
    "https://github.com/Evolution-555/Evolution-Tv/raw/main/screenshots/screenshot2.png",
    "https://github.com/Evolution-555/Evolution-Tv/raw/main/screenshots/screenshot3.png"
  ]
}
```

## Option 2: Create Your Own App Repository

### Benefits:
- Full control over updates
- No approval process needed
- Can host multiple apps
- Custom branding

### Steps:

1. **Create a Simple JSON Repository**:
   Create a `apps.json` file in a GitHub repository:

   ```json
   {
     "apps": [
       {
         "id": "com.evolution555.evolutiontv",
         "title": "Evolution TV",
         "version": "1.0.0",
         "description": "Modular streaming app for TV show/movie tracking",
         "category": "video",
         "icon": "https://github.com/Evolution-555/Evolution-Tv/raw/main/icon.png",
         "ipkUrl": "https://github.com/Evolution-555/Evolution-Tv/releases/download/v1.0.0/evolution-tv.ipk",
         "author": "Evolution-555",
         "changelog": "Initial release"
       }
     ]
   }
   ```

2. **Host on GitHub Pages**:
   - Enable GitHub Pages for the repository
   - The JSON will be accessible at: `https://username.github.io/repo-name/apps.json`

3. **Add Repository to Homebrew Channel**:
   - Open Homebrew Channel on TV
   - Navigate to Settings → App Repositories
   - Add your repository URL
   - Your app will appear in the app list

### Example Repository Structure:
```
evolution-tv-repo/
├── apps.json
├── index.html (optional, for GitHub Pages)
└── README.md
```

## Option 3: Direct IPK URL Installation

For quick testing or distribution without a repository:

1. **Host the IPK**:
   - GitHub Releases (already done)
   - Direct download link
   - Cloud storage (Google Drive, Dropbox)

2. **Share the URL**:
   - Users can install via Homebrew Channel's "Install from URL"
   - URL: `https://github.com/Evolution-555/Evolution-Tv/releases/download/v1.0.0/evolution-tv.ipk`

## Recommendation

**For maximum visibility**, submit to the official Homebrew Channel app store (Option 1).

**For quick distribution**, use GitHub Releases with direct URL installation (Option 3).

**For full control**, create your own repository (Option 2).

## Screenshots Needed

Regardless of the option, you'll need screenshots:

1. **Main screen** showing widgets
2. **Settings screen** showing Trakt/Debrid configuration
3. **Stream selector** showing quality options
4. **Video playback** (optional)

Take these from the webOS emulator or actual TV.

## Next Steps

1. **Convert icons to PNG** (required for app store)
2. **Take screenshots** of the app
3. **Choose your distribution method**
4. **Submit or set up repository**

Would you like me to help you prepare the app store submission or create a custom repository?
