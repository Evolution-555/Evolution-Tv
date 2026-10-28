# Evolution TV - Modular Streaming App for LG webOS

A lightweight, optimized TV application for LG webOS with comprehensive TV show and movie tracking. Features a modular widget system, Trakt integration for watch tracking, Stremio/Cyberflix addon support, and Debrid provider integration for streaming.

## Key Features

- **TV Show & Movie Tracking**: Track what you're watching, episode progress, and watch history
- **Episode Management**: Automatically track which episode you're on and resume playback
- **Modular Widget System**: JSON-driven layout configuration from remote repositories
- **Trakt Integration**: OAuth 2.0 authentication, metadata sync, and scrobbling for both movies and TV shows
- **Stremio/Cyberflix Add-ons**: Community addon integration for content discovery
- **Debrid Providers**: Real-Debrid, Premiumize, AllDebrid integration for cached streaming
- **Optimized for TV**: D-pad navigation, focus effects, skeletal loading states
- **Performance**: Virtual scrolling, lazy loading, memory-efficient rendering

## Features

- **Modular Widget System**: JSON-driven layout configuration from remote repositories
- **Trakt Integration**: OAuth 2.0 authentication, metadata sync, and scrobbling
- **Stremio/Cyberflix Add-ons**: Community addon integration for content discovery
- **Debrid Providers**: Real-Debrid, Premiumize, AllDebrid integration for cached streaming
- **Optimized for TV**: D-pad navigation, focus effects, skeletal loading states
- **Performance**: Virtual scrolling, lazy loading, memory-efficient rendering

## Prerequisites

- LG webOS TV (webOS 3.0+ / 2016+ models)
- LG Homebrew Channel (for installation on jailbroken TVs)
- Node.js and npm (for development)
- webOS TV SDK and CLI (for development and packaging)

## Development Setup

### 1. Install webOS TV SDK and CLI

Download and install the webOS TV SDK from: https://webostv.developer.lge.com/

Install the webOS CLI globally:
```bash
npm install -g @webosose/ares-cli
```

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/lg-fusion-tv.git
cd lg-fusion-tv
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the App

Edit `src/js/services/traktService.js` and replace the placeholder values:
- `TRAKT_CLIENT_ID`: Register at https://trakt.tv/oauth/applications
- `TRAKT_CLIENT_SECRET`: From your Trakt application

Edit `appinfo.json` and update:
- `id`: Your app ID (e.g., `com.yourdomain.lgfusion`)
- `vendor`: Your name or organization

### 5. Create App Icons

Placeholder SVG icons are included (`icon.svg` and `largeIcon.svg`). For production, convert these to PNG:
- `icon.png` (80x80 pixels)
- `largeIcon.png` (130x130 pixels)

Use an online converter or image editor to convert the SVG files to PNG format, then update `appinfo.json` to reference the PNG files instead of SVG.

### 6. Build and Package

```bash
npm run package
```

This creates an IPK file: `com.yourdomain.lgfusion_1.0.0_all.ipk`

### 7. Test on Emulator

Launch the webOS TV Emulator and install the app:
```bash
ares-install com.yourdomain.lgfusion_1.0.0_all.ipk
ares-launch com.yourdomain.lgfusion
```

## Installation on LG TV

### Via LG Homebrew Channel

1. Install the LG Homebrew Channel on your TV: https://webosbrew.org/
2. Transfer the IPK file to your TV (via USB or network)
3. Open Homebrew Channel and install the IPK
4. Launch the app from the Homebrew Channel

### Via Developer Mode

1. Enable Developer Mode on your TV (https://webostv.developer.lge.com/develop/get-started/developer-mode-app)
2. Connect your TV to your network
3. Install the app:
```bash
ares-install com.yourdomain.lgfusion_1.0.0_all.ipk --device <tv-ip>
ares-launch com.yourdomain.lgfusion --device <tv-ip>
```

## Configuration

### Starter Kit Configuration

The app loads configuration from a remote JSON URL. Create your own starter kit JSON:

```json
{
  "version": "1.0",
  "widgets": [
    {
      "id": "daily-picks",
      "type": "grid",
      "title": "Daily Picks",
      "layout": {
        "x": 20,
        "y": 50,
        "w": 1880,
        "h": 300
      },
      "dataSource": "trakt",
      "listId": "trending",
      "refreshInterval": 3600
    },
    {
      "id": "watchlist",
      "type": "list",
      "title": "My Watchlist",
      "layout": {
        "x": 20,
        "y": 400,
        "w": 1880,
        "h": 400
      },
      "dataSource": "trakt",
      "listId": "watchlist",
      "refreshInterval": 1800
    }
  ]
}
```

Host this JSON on GitHub/GitLab and update the `configUrl` in the app.

### Trakt Authentication

1. Launch the app
2. Navigate to Settings → Trakt
3. The app will display a device code and verification URL
4. Visit the URL on your phone/computer and enter the code
5. The app will automatically authenticate

### Debrid Configuration

1. Navigate to Settings → Debrid
2. Select your provider (Real-Debrid, Premiumize, or AllDebrid)
3. Enter your API key
4. The app will validate the key and enable streaming

### Add-on Configuration

1. Navigate to Settings → Add-ons
2. Add Stremio or Cyberflix addon URLs
3. The app will query these add-ons for streaming sources

## Usage

### Navigation

- **Arrow Keys**: Navigate between items
- **Enter/OK**: Select item and play
- **Back**: Go back
- **Long Press**: Context menu (if available)

### Playing Content

1. Navigate to a movie or TV show
2. Press Enter/OK to select
3. The app will query configured add-ons for streaming sources
4. Select a quality (4K, 1080p, 720p, etc.)
5. The app will check Debrid cache and stream the content

### Scrobbling

The app automatically scrobbles to Trakt:
- Playback start
- Progress updates during playback
- Mark as watched at 90% completion

## Project Structure

```
lg-fusion-tv/
├── appinfo.json              # webOS app manifest
├── package.json              # Node dependencies
├── src/
│   ├── main.js               # Entry point
│   ├── index.html            # HTML shell
│   ├── css/                  # Stylesheets
│   ├── js/
│   │   ├── core/             # Core app logic
│   │   ├── widgets/          # Widget implementations
│   │   ├── services/         # External integrations
│   │   ├── models/           # Data models
│   │   └── utils/            # Utilities
│   └── assets/               # Static assets
└── README.md
```

## Development

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration
```

### Debugging

Connect to the app inspector:
```bash
ares-inspect com.yourdomain.lgfusion
```

### Logging

Logs are available in the webOS TV Emulator console or via:
```bash
ares-log com.yourdomain.lgfusion
```

## Performance Optimization

The app is optimized for LG TV hardware constraints:

- **Virtual Scrolling**: Only renders visible items
- **Lazy Loading**: Images load as needed
- **Skeletal Loading**: Prevents UI stutter during API calls
- **Memory Management**: Aggressive caching and cleanup
- **Efficient DOM**: Minimal reflows and repaints

## Troubleshooting

### App won't launch

- Check that webOS version is 3.0+
- Verify IPK package is valid
- Check logs: `ares-log com.yourdomain.lgfusion`

### Trakt authentication fails

- Verify client ID and secret are correct
- Check network connectivity
- Ensure Trakt API is accessible

### Streaming fails

- Verify Debrid API key is valid
- Check that content is cached on Debrid servers
- Ensure addon URLs are correct and accessible

### Performance issues

- Reduce number of widgets in configuration
- Increase refresh intervals
- Check for memory leaks in logs

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on webOS emulator
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This app is for educational purposes only. The app itself does not contain any copyrighted content. All content is sourced from community-maintained external services (Trakt, Stremio, Debrid). Users are responsible for ensuring they comply with applicable laws and regulations in their jurisdiction.

## Credits

- Inspired by Fusion for Apple tvOS
- webOS TV SDK by LG
- Trakt API
- Stremio addon ecosystem
- Debrid providers (Real-Debrid, Premiumize, AllDebrid)

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/lg-fusion-tv/issues
- Documentation: https://github.com/yourusername/lg-fusion-tv/wiki
