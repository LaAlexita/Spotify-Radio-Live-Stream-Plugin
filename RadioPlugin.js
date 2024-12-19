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
            isHls: true
        },
        // Puedes añadir más estaciones aquí
    ];

    let currentStationIndex = 0;
    let audio = null;
    let hls = null;
    let radioPlaying = false;

    // Cargar hls.js si es necesario
    function loadHls(callback) {
        if (typeof Hls !== 'undefined') {
            callback();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = () => {
            callback();
        };
        document.head.appendChild(script);
    }

    // Inicializar el plugin directamente
    initializePlugin();

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
        audio.autoplay = false;

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
            const currentStation = RADIO_STATIONS[currentStationIndex];
            const currentUrl = currentStation.url;

            if (hls) {
                hls.destroy();
                hls = null;
            }
            audio.pause();
            audio.src = '';
            audio.load();

            if (currentStation.isHls) {
                loadHls(() => {
                    if (Hls.isSupported()) {
                        hls = new Hls();
                        hls.loadSource(currentUrl);
                        hls.attachMedia(audio);

                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            if (radioPlaying) {
                                audio.play();
                            }
                        });

                        hls.on(Hls.Events.ERROR, (event, data) => {
                            console.error('Error en hls.js:', data);
                            alert('No se puede reproducir la estación de radio.');
                        });
                    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                        audio.src = currentUrl;
                        audio.addEventListener('loadedmetadata', () => {
                            if (radioPlaying) {
                                audio.play();
                            }
                        });
                    } else {
                        alert('El streaming HLS no es soportado en este navegador.');
                    }
                });
            } else {
                audio.src = currentUrl;
                audio.load();
                if (radioPlaying) {
                    audio.play();
                }
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
            audio.addEventListener('ended', handleAudioError);
            audio.addEventListener('stalled', handleAudioError);
            audio.addEventListener('error', handleAudioError);
        }

        function stopRadio() {
            audio.pause();
            playButton.textContent = '▶️';
            radioPlaying = false;

            Spicetify.Player.removeEventListener('onplay', handleSpotifyPlay);
            audio.removeEventListener('ended', handleAudioError);
            audio.removeEventListener('stalled', handleAudioError);
            audio.removeEventListener('error', handleAudioError);
        }

        function handleSpotifyPlay() {
            if (radioPlaying) {
                stopRadio();
            }
        }

        function handleAudioError() {
            if (radioPlaying) {
                audio.pause();
                audio.currentTime = 0;
                setupAudioSource();
                audio.play().catch((error) => {
                    console.error('Error al reiniciar la estación de radio:', error);
                });
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
        makeElementDraggable(playerContainer);
    }

    async function initializePlugin() {
        while (!Spicetify || !Spicetify.Player || !Spicetify.showNotification) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        addRadioPlayerToUI();
    }

    // Función makeElementDraggable actualizada
    function makeElementDraggable(element) {
        let isDragging = false;
        let startX, startY, currentX = 0, currentY = 0;

        element.style.cursor = 'move';

        element.addEventListener('mousedown', dragStart);

        function dragStart(e) {
            // Solo iniciar el arrastre si el elemento clicado es el contenedor
            if (e.target !== element) {
                return;
            }
            isDragging = true;
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        }

        function drag(e) {
            if (!isDragging) return;

            currentX = e.clientX - startX;
            currentY = e.clientY - startY;

            setTranslate(currentX, currentY);
        }

        function dragEnd() {
            isDragging = false;

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
        }

        function setTranslate(xPos, yPos) {
            element.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }
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
            background: rgb(10 10 10 / 90%);
            border-radius: 8px;
            padding: 10px;
            color: #fff;
            height: 100px;
            user-select: none;
            touch-action: none; 
            will-change: transform; 
            transition: transform 0.1s ease; 
        }
        .radio-cover-image {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            margin-right: 15px;
        }
        .radio-station-select {
            background: rgb(22 22 22 / 87%);
            border: 1px solid #fff;
            color: #fff;
            border-radius: 8px;
            padding: 10px;
            margin-right: 15px;
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
