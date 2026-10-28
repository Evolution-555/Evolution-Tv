# LG Fusion - Quick Setup Guide

## Current Status

The LG Fusion app is now complete with all core features implemented:

✅ **Completed Features:**
- Modular widget system with JSON-driven layouts
- Trakt integration (OAuth, metadata fetching, scrobbling)
- Stremio/Cyberflix addon integration
- Debrid provider support (Real-Debrid, Premiumize, AllDebrid)
- Video player with webOS Video API
- Settings UI for configuration
- Stream selection and playback flow
- D-pad navigation with focus effects
- Skeletal loading states
- Local storage with caching
- Placeholder app icons (SVG)

## Quick Start

### 1. Install Dependencies

```bash
cd lg-fusion-tv
npm install
```

### 2. Configure Trakt

Edit `src/js/services/traktService.js`:
- Register at https://trakt.tv/oauth/applications
- Replace `YOUR_CLIENT_ID` with your Trakt client ID
- Replace `YOUR_CLIENT_SECRET` with your Trakt client secret

### 3. Configure App ID

Edit `appinfo.json`:
- Change `id` to your desired app ID (e.g., `com.yourname.lgfusion`)
- Change `vendor` to your name or organization

### 4. Build the App

**Windows:**
```bash
npm run build
```

**Unix/Linux/Mac:**
```bash
npm run build:unix
```

Or manually:
```bash
ares-package .
```

This will create an IPK file: `com.yourdomain.lgfusion_1.0.0_all.ipk`

### 5. Test on Emulator (Optional)

If you have the webOS TV Emulator installed:

```bash
ares-install com.yourdomain.lgfusion_1.0.0_all.ipk
ares-launch com.yourdomain.lgfusion
```

### 6. Install on LG TV

#### Via LG Homebrew Channel (Recommended)

1. Install LG Homebrew Channel: https://webosbrew.org/
2. Transfer the IPK file to your TV (USB or network)
3. Open Homebrew Channel and install the IPK
4. Launch the app

#### Via Developer Mode

1. Enable Developer Mode on your TV
2. Connect TV to your network
3. Install:
```bash
ares-install com.yourdomain.lgfusion_1.0.0_all.ipk --device <tv-ip>
ares-launch com.yourdomain.lgfusion --device <tv-ip>
```

## First-Time Setup

### 1. Authenticate with Trakt

1. Launch the app
2. Press the Settings button (top-right)
3. Navigate to Trakt section
4. Click "Authenticate with Trakt"
5. Visit the URL shown on your phone/computer
6. Enter the device code
7. The app will automatically authenticate

### 2. Configure Debrid

1. In Settings, navigate to Debrid Provider
2. Select your provider (Real-Debrid, Premiumize, or AllDebrid)
3. Enter your API key
4. Click "Save Debrid Configuration"

### 3. Configure Add-ons (Optional)

1. In Settings, add Stremio/Cyberflix addon URLs
2. The app will query these add-ons for streaming sources

### 4. Configure Starter Kit (Optional)

1. In Settings, enter a starter kit JSON URL
2. The app will load widgets from this URL
3. Or use the default local configuration

## Usage

### Navigation

- **Arrow Keys**: Navigate between items
- **Enter/OK**: Select item and open stream selector
- **Back**: Go back or close overlays
- **Settings Button**: Open settings (top-right)

### Playing Content

1. Navigate to a movie or TV show
2. Press Enter/OK to select
3. The app will show available streams
4. Select a quality (4K, 1080p, 720p, etc.)
5. The app will check Debrid cache and play

### Scrobbling

The app automatically scrobbles to Trakt:
- Playback start
- Progress updates every 30 seconds
- Mark as watched at 90% completion

## Configuration Files

### Local Config (`src/config.json`)

Default widget configuration for testing. Edit to customize layout:

```json
{
  "version": "1.0",
  "widgets": [
    {
      "id": "trending-movies",
      "type": "grid",
      "title": "Trending Movies",
      "dataSource": "trakt",
      "listType": "trending",
      "layout": { "x": 20, "y": 80, "w": 1880, "h": 300 },
      "refreshInterval": 3600
    }
  ]
}
```

### Widget Types

- **grid**: Horizontal scrolling grid
- **list**: Vertical list

### Data Sources

- **trakt**: Trakt API
  - `trending`: Trending movies
  - `watchlist`: User's watchlist
  - `history`: Recently watched
  - `custom`: Custom list (requires `listId`)

## Troubleshooting

### App won't launch

- Check webOS version is 3.0+
- Verify IPK package is valid
- Check logs: `ares-log com.yourdomain.lgfusion`

### Trakt authentication fails

- Verify client ID and secret are correct
- Check network connectivity
- Ensure Trakt API is accessible

### Streaming fails

- Verify Debrid API key is valid
- Check that content is cached on Debrid servers
- Ensure addon URLs are correct

### No content showing

- Check Trakt authentication status
- Verify widget configuration is valid
- Check network connectivity

## Next Steps

1. **Convert Icons**: Convert SVG icons to PNG for production
2. **Customize Config**: Create your own starter kit JSON
3. **Add Add-ons**: Configure community addon URLs
4. **Test on TV**: Install on actual LG TV hardware
5. **Optimize**: Profile performance on TV hardware

## Project Structure

```
lg-fusion-tv/
├── appinfo.json              # webOS app manifest
├── package.json              # Node dependencies
├── icon.svg                  # App icon (placeholder)
├── largeIcon.svg             # Large icon (placeholder)
├── build.bat                 # Windows build script
├── build.sh                  # Unix build script
├── src/
│   ├── main.js               # Entry point
│   ├── config.json           # Local configuration
│   ├── index.html            # HTML shell
│   ├── css/                  # Stylesheets
│   ├── js/
│   │   ├── core/             # App logic
│   │   ├── widgets/          # Widget implementations
│   │   ├── services/         # External integrations
│   │   ├── models/           # Data models
│   │   └── utils/            # Utilities
│   └── assets/               # Static assets
└── README.md
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/lg-fusion-tv/issues
- Documentation: See README.md

## License

MIT License
