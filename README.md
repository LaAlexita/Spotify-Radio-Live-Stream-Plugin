
# Spotify Radio Live Stream Plugin

## Overview

This Spicetify extension adds a live radio stream player to your Spotify desktop application. The plugin provides a fixed, easy-to-use radio player that allows you to listen to a live radio stream directly within Spotify.

## Features

- 🎧 Live radio stream integration
- 🎚️ Volume synchronization with Spotify
- 🔘 Simple play/pause controls
- 📍 Floating player interface
- 💚 Spotify metadata override for radio playback

## Screenshot

![Radio Plugin Screenshot](https://i.imgur.com/yW3b6nb.png)

## Prerequisites

- [Spicetify](https://spicetify.app/) installed
- Spotify desktop application

## Installation

1. Download the `RadioPlugin.js` file.

2. Place the file in one of these directories:
   - **Windows**: `%appdata%\spicetify\Extensions\`
   - **Linux/MacOS**: `~/.config/spicetify/Extensions/`

3. Install the extension via Spicetify CLI:
   ```bash
   spicetify config extensions RadioPlugin.js
   spicetify apply
   ```

## Usage

- Click the play button (▶️) to start the radio stream
- Click the pause button (⏸️) to stop the radio stream
- The radio's volume will automatically sync with Spotify's volume

## Customization

To change the radio stream URL, modify the `RADIO_URL` constant in the script:
```javascript
const RADIO_URL = 'https://s1.we4stream.com:8015/live';
```

## Compatibility

- Tested with Spotify desktop app
- Requires Spicetify

## License

[Specify your license here, e.g., MIT]

## Contributing

Contributions, issues, and feature requests are welcome!

## Support

If you encounter any problems, please [open an issue](your-github-repo-issues-link) on GitHub.
