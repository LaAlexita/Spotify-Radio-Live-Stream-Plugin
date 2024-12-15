(function RadioPlugin() {
    const RADIO_STATIONS = [
        {
            url: 'https://s1.we4stream.com:8015/live',
            name: 'Loca Urban',
            cover: 'https://locaurbanlamancha.com/wp-content/uploads/2021/01/10-angel-dmad-300x300.png',
        },
        {
            url: 'https://stream-153.zeno.fm/tygghf77na0uv',
            name: 'Custom Radio',
            cover: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/5f1c2198a5e0be0001948eeb/0x0.png',
        },
        {
            url: 'https://atres-live.europafm.com/live/europafm/bitrate_1.m3u8',
            name: 'Europa FM',
            cover: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Europa-fm-logo.png',
        },
        // Puedes añadir más estaciones aquí
    ];

    let currentStationIndex = 0;
    let audio = null;
    let hls = null;
    let radioPlaying = false;

    // Cargar hls.js para reproducir estaciones de radio que usan HLS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = () => {
        console.log('hls.js cargado');
        initializePlugin(); 
    };
    document.head.appendChild(script);

    function createRadioPlayer() {
        const container = document.createElement('div');
        container.id = 'radio-player-container';
        container.classList.add('radio-player-container');

        const coverImage = document.createElement('img');
        coverImage.src = RADIO_STATIONS[currentStationIndex].cover;
        coverImage.alt = 'Radio en Vivo';
        coverImage.classList.add('radio-cover-image');

        const stationSelect = document.createElement('select');
        stationSelect.classList.add('radio-station-select');
        RADIO_STATIONS.forEach((station, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.text = station.name;
            stationSelect.appendChild(option);
        });
        stationSelect.selectedIndex = currentStationIndex;

        const playButton = document.createElement('button');
        playButton.id = 'radio-play-button';
        playButton.textContent = '▶️';
        playButton.classList.add('radio-play-button');

        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '1';
        volumeSlider.step = '0.01';
        volumeSlider.value = '0.5';
        volumeSlider.classList.add('radio-volume-slider');

        audio = document.createElement('audio');
        audio.crossOrigin = 'anonymous';
        audio.volume = volumeSlider.value;

        setupAudioSource();

        playButton.addEventListener('click', () => {
            if (!radioPlaying) {
                startRadio();
            } else {
                stopRadio();
            }
        });

        volumeSlider.addEventListener('input', () => {
            audio.volume = volumeSlider.value;
        });

        stationSelect.addEventListener('change', () => {
            changeStation(parseInt(stationSelect.value));
        });

        function setupAudioSource() {
            if (hls) {
                hls.destroy();
                hls = null;
            }
            const currentUrl = RADIO_STATIONS[currentStationIndex].url;
            if (Hls.isSupported() && currentUrl.endsWith('.m3u8')) {
                hls = new Hls();
                hls.loadSource(currentUrl);
                hls.attachMedia(audio);
            } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                audio.src = currentUrl;
            } else {
                audio.src = currentUrl;
            }
        }

        function startRadio() {
            audio.play().catch((error) => {
                console.error('Error al reproducir la estación de radio:', error);
                alert('No se puede reproducir la estación de radio.');
            });
            playButton.textContent = '⏸️';
            radioPlaying = true;

            Spicetify.Player.pause();

            Spicetify.Player.addEventListener('onplay', handleSpotifyPlay);
            audio.addEventListener('ended', stopRadio);
        }

        function stopRadio() {
            audio.pause();
            playButton.textContent = '▶️';
            radioPlaying = false;

            Spicetify.Player.removeEventListener('onplay', handleSpotifyPlay);
        }

        function handleSpotifyPlay() {
            if (radioPlaying) {
                stopRadio();
            }
        }

        function changeStation(index) {
            stopRadio();
            currentStationIndex = index;
            setupAudioSource();
            coverImage.src = RADIO_STATIONS[currentStationIndex].cover;
            stationSelect.selectedIndex = currentStationIndex;
            if (radioPlaying) {
                startRadio();
            }
        }

        container.append(coverImage, stationSelect, playButton, volumeSlider, audio);
        return container;
    }

    function addRadioPlayerToUI() {
        const existingContainer = document.getElementById('radio-player-container');
        if (existingContainer) return;

        const playerContainer = createRadioPlayer();
        document.body.appendChild(playerContainer);
    }

    async function initializePlugin() {
        while (!Spicetify || !Spicetify.Player || !Spicetify.showNotification) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        addRadioPlayerToUI();
    }

    const style = document.createElement('style');
    style.textContent = `
        .radio-player-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            z-index: 1000;
            display: flex;
            align-items: center;
            background: rgba(25, 20, 20, 0.9);
            border-radius: 8px;
            padding: 10px;
            color: #fff;
            font-family: Arial, sans-serif;
        }
        .radio-cover-image {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            margin-right: 15px;
        }
        .radio-station-select {
            background: transparent;
            border: 1px solid #fff;
            color: #fff;
            padding: 5px;
            margin-right: 15px;
            border-radius: 4px;
            font-size: 14px;
        }
        .radio-play-button {
            background: transparent;
            border: none;
            color: #fff;
            font-size: 28px;
            cursor: pointer;
            outline: none;
            margin-right: 15px;
        }
        .radio-volume-slider {
            width: 100px;
            margin-left: 10px;
        }
        @media (max-width: 600px) {
            .radio-player-container {
                flex-direction: column;
                align-items: flex-start;
                bottom: 20px;
            }
            .radio-cover-image {
                margin-bottom: 10px;
            }
        }
    `;
    document.head.appendChild(style);
})();
