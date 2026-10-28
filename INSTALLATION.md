# Evolution TV - Installation Guide

## Installing on LG TV via Homebrew Channel

### Prerequisites

1. **LG webOS TV** (webOS 3.0+ / 2016+ models)
2. **LG Homebrew Channel** installed on your TV
3. **Internet connection** on your TV

### Installation Steps

#### Option 1: Install from GitHub Release (Recommended)

1. **Visit the GitHub Releases page**:
   https://github.com/Evolution-555/Evolution-Tv/releases

2. **Download the latest IPK file**:
   - Look for the latest release (e.g., v1.0.0)
   - Download `evolution-tv.ipk`

3. **Transfer to your TV**:
   - **Option A**: Copy the IPK file to a USB drive and plug it into your TV
   - **Option B**: Upload to a cloud service (Google Drive, Dropbox) and download on TV browser
   - **Option C**: Use the Homebrew Channel's built-in downloader (if available)

4. **Install via Homebrew Channel**:
   - Open the Homebrew Channel app on your TV
   - Navigate to "Install from file" or similar option
   - Select the IPK file you transferred
   - Confirm installation

5. **Launch Evolution TV**:
   - Find Evolution TV in your app list
   - Launch the app

#### Option 2: Install Directly from URL

If the IPK is hosted at a direct URL:

1. Open Homebrew Channel on your TV
2. Navigate to "Install from URL" or similar
3. Enter the IPK URL (e.g., `https://github.com/Evolution-555/Evolution-Tv/releases/download/v1.0.0/evolution-tv.ipk`)
4. Confirm installation

### First-Time Setup

After installation, you'll need to configure the app:

#### 1. Authenticate with Trakt

1. Launch Evolution TV
2. Press the **Settings** button (top-right corner)
3. Navigate to **Trakt** section
4. Click **"Authenticate with Trakt"**
5. The app will display a device code and verification URL
6. On your phone or computer:
   - Visit the URL shown (e.g., https://trakt.tv/activate)
   - Enter the device code
   - Approve the authorization
7. The app will automatically authenticate and show "Authenticated" status

#### 2. Configure Debrid Provider (Optional but Recommended)

1. In Settings, navigate to **Debrid Provider**
2. Select your provider:
   - **Real-Debrid**: https://real-debrid.com
   - **Premiumize**: https://premiumize.me
   - **AllDebrid**: https://alldebrid.com
3. Get your API key from your Debrid provider's account settings
4. Enter the API key in the app
5. Click **"Save Debrid Configuration"**

#### 3. Configure Add-on URLs (Optional)

1. In Settings, navigate to **Add-on URLs**
2. Enter Stremio or Cyberflix addon URLs (one per line)
3. Example addon URLs:
   - https://torrentio.strem.fun
   - https://stremio-jackett.herokuapp.com
4. Click **"Save Add-on URLs"**

#### 4. Configure Starter Kit (Optional)

1. In Settings, navigate to **Configuration URL**
2. Enter a custom starter kit JSON URL
3. Or use the default local configuration
4. Click **"Save Configuration"**

### Using the App

#### Navigation

- **Arrow Keys**: Navigate between items
- **Enter/OK**: Select item and open stream selector
- **Back**: Go back or close overlays
- **Settings Button**: Open settings (top-right)

#### Playing Movies

1. Navigate to a movie in any widget
2. Press Enter/OK
3. The app will show available streams
4. Select a quality (4K, 1080p, 720p, etc.)
5. The app will check Debrid cache and play

#### Playing TV Shows

1. Navigate to a TV show
2. Press Enter/OK
3. The app will show seasons and episodes
4. Select an episode
5. The app will show available streams
6. Select a quality and play

#### Tracking Progress

- **Movies**: Progress is tracked automatically
- **TV Shows**: Episode progress is tracked
- **Continue Watching**: Shows partially watched content
- **Watch History**: All watched content is saved to Trakt

### Troubleshooting

#### App won't install

- Ensure your TV is webOS 3.0+
- Check that Homebrew Channel is properly installed
- Verify the IPK file is not corrupted

#### Trakt authentication fails

- Check your internet connection
- Verify the device code is entered correctly
- Ensure Trakt API is accessible
- Try authenticating again

#### No content showing

- Check Trakt authentication status
- Verify you have content in your Trakt library
- Try refreshing widgets (wait for auto-refresh or restart app)

#### Streaming fails

- Verify Debrid API key is valid
- Check that content is cached on Debrid servers
- Ensure addon URLs are correct
- Try a different stream quality

#### Performance issues

- Reduce number of widgets in configuration
- Increase refresh intervals
- Check your TV's available memory

### Updating the App

When a new version is released:

1. Download the new IPK from GitHub Releases
2. Transfer to your TV
3. Install via Homebrew Channel (it will overwrite the old version)
4. Your settings and data will be preserved

### Uninstalling

1. Open Homebrew Channel
2. Navigate to Evolution TV
3. Select "Uninstall" or "Remove"
4. Confirm

### Support

- **GitHub Issues**: https://github.com/Evolution-555/Evolution-Tv/issues
- **Documentation**: See README.md for full features

### Building from Source

If you want to build the IPK yourself:

1. Clone the repository:
   ```bash
   git clone https://github.com/Evolution-555/Evolution-Tv.git
   cd Evolution-Tv
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the IPK:
   ```bash
   npm run build  # Windows
   # or
   npm run build:unix  # Unix/Linux/Mac
   ```

4. The IPK file will be created in the current directory

### Security Notes

- The app does not contain any copyrighted content
- All content is sourced from external services (Trakt, add-ons, Debrid)
- Your credentials are stored locally on your TV
- Never share your API keys with others
