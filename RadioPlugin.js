(function RadioPlugin() {
    const RADIO_URL = 'https://s1.we4stream.com:8015/live';
    let audio = null;
    let radioPlaying = false;

    function createRadioPlayer() {
        const container = document.createElement('div');
        container.id = 'radio-player-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1000';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '10px';
        container.style.background = '#1db954';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        container.style.padding = '10px 15px';
        container.style.color = '#fff';
        container.style.fontFamily = 'sans-serif';
        container.style.fontSize = '14px';

        const label = document.createElement('span');
        label.textContent = 'Radio en vivo';
        label.style.fontWeight = 'bold';

        const playButton = document.createElement('button');
        playButton.id = 'radio-play-button';
        playButton.textContent = '▶️';
        playButton.style.background = 'transparent';
        playButton.style.border = 'none';
        playButton.style.color = '#fff';
        playButton.style.fontSize = '16px';
        playButton.style.cursor = 'pointer';
        playButton.style.outline = 'none';

        audio = new Audio(RADIO_URL);
        audio.crossOrigin = 'anonymous';
        audio.style.display = 'none';

        function syncVolume() {
            if (Spicetify && Spicetify.Player) {
                audio.volume = Spicetify.Player.getVolume();
            }
        }

        const fakeTrack = {
            uri: 'spotify:track:radio-plugin',
            metadata: {
                is_playable: true,
                title: 'Radio en Vivo',
                artist_name: 'Radio Station',
                album_title: 'Radio Online',
                image_url: 'https://i.imgur.com/yW3b6nb.png',
            },
        };

        playButton.addEventListener('click', () => {
            if (!radioPlaying) {
                syncVolume();
                audio.play();
                playButton.textContent = '⏸️';
                radioPlaying = true;

                Spicetify.Player.pause(); // Pausar cualquier canción en reproducción
                Spicetify.Player.data.track = fakeTrack;
                Spicetify.Player.overrideMetadata(fakeTrack.metadata);

                Spicetify.Player.addEventListener('volumechange', syncVolume);

                // Detener la radio si Spotify comienza a reproducir algo más
                Spicetify.Player.addEventListener('onplay', handleSpotifyPlay);
            } else {
                stopRadio();
            }
        });

        function stopRadio() {
            audio.pause();
            playButton.textContent = '▶️';
            radioPlaying = false;

            Spicetify.Player.removeEventListener('volumechange', syncVolume);
            Spicetify.Player.removeEventListener('onplay', handleSpotifyPlay);
        }

        function handleSpotifyPlay() {
            if (radioPlaying) {
                stopRadio();
            }
        }

        container.appendChild(playButton);
        container.appendChild(label);
        container.appendChild(audio);

        return container;
    }

    function addRadioPlayerToUI() {
        const existingContainer = document.getElementById('radio-player-container');
        if (existingContainer) return;

        const playerContainer = createRadioPlayer();
        document.body.appendChild(playerContainer);

        const containerStyle = document.getElementById('radio-player-container').style;
        containerStyle.display = 'flex';
        containerStyle.visibility = 'visible';
    }

    function initializePlugin() {
        if (!Spicetify || !Spicetify.Player || !Spicetify.showNotification) {
            setTimeout(initializePlugin, 1000);
            return;
        }

        addRadioPlayerToUI();
    }

    initializePlugin();
})();
