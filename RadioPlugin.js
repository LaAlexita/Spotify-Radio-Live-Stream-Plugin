(function RadioPlugin() {
    const RADIO_URL = 'https://s1.we4stream.com:8015/live';
    let audio = null;
    let radioPlaying = false;

    function createRadioPlayer() {
        const container = document.createElement('div');
        container.id = 'radio-player-container';
        container.classList.add('radio-player-container');

        const label = document.createElement('span');
        label.textContent = 'Radio en vivo';
        label.classList.add('radio-label');

        const playButton = document.createElement('button');
        playButton.id = 'radio-play-button';
        playButton.textContent = '▶️';
        playButton.classList.add('radio-play-button');

        audio = new Audio(RADIO_URL);
        audio.crossOrigin = 'anonymous';
        audio.style.display = 'none';

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

                Spicetify.Player.pause(); // Pausa cualquier canción que esté sonando

                // Actualiza el estado del reproductor con metadatos ficticios
                updateSpicetifyState(fakeTrack, false);

                Spicetify.Player.addEventListener('volumeChange', syncVolume);
                Spicetify.Player.addEventListener('onplay', handleSpotifyPlay);
            } else {
                stopRadio();
            }
        });

        function stopRadio() {
            audio.pause();
            playButton.textContent = '▶️';
            radioPlaying = false;

            Spicetify.Player.removeEventListener('volumeChange', syncVolume);
            Spicetify.Player.removeEventListener('onplay', handleSpotifyPlay);

            // Restablece el estado del reproductor
            updateSpicetifyState(null, true);
        }

        container.append(playButton, label, audio);
        return container;
    }

    function syncVolume() {
        if (Spicetify && Spicetify.Player) {
            audio.volume = Spicetify.Player.getVolume();
        }
    }

    function handleSpotifyPlay() {
        if (radioPlaying) {
            stopRadio();
        }
    }

    function updateSpicetifyState(track, isPaused) {
        Spicetify.Player.origin._state.track = track;
        Spicetify.Player.origin._state.isPaused = isPaused;
        Spicetify.Player.origin._state.duration = 0; // La transmisión en vivo no tiene duración
        Spicetify.Player.origin._state.position = 0;
        Spicetify.Player.origin._onStateChanged();
    }

    function addRadioPlayerToUI() {
        const existingContainer = document.getElementById('radio-player-container');
        if (existingContainer) return;

        const playerContainer = createRadioPlayer();
        document.body.appendChild(playerContainer);
    }

    async function initializePlugin() {
        while (!Spicetify || !Spicetify.Player || !Spicetify.showNotification) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        addRadioPlayerToUI();
    }

    initializePlugin();

    const style = document.createElement('style');
    style.textContent = `
        .radio-player-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            background: #1db954;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            padding: 10px 15px;
            color: #fff;
            font-family: sans-serif;
            font-size: 14px;
        }
        .radio-label {
            font-weight: bold;
        }
        .radio-play-button {
            background: transparent;
            border: none;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            outline: none;
        }
    `;
    document.head.appendChild(style);
})();