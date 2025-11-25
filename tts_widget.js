/**
 * TTS Reader Widget for Moodle
 * Lector de voz flotante con Web Speech API
 */

var TTSWidget = (function () {
    'use strict';

    // Variables privadas
    var synth = window.speechSynthesis;
    var utterance = null;
    var isPaused = false;
    var voices = [];
    var config = {};
    var widgetElement = null;

    // Preferencias del usuario (localStorage)
    var userPrefs = {
        voice: null,
        speed: 1.0,
        volume: 100,
        minimized: true
    };

    /**
     * Inicializa el widget
     */
    function init(configuration) {
        // Evitar duplicados: si ya existe el widget, salir
        if (document.getElementById('ttsWidget')) {
            console.log('TTS Widget ya inicializado, saliendo.');
            return;
        }

        config = configuration || {};
        loadUserPreferences();
        createWidget();
        loadVoices();
        attachEventListeners();

        // Cargar voces cuando estén disponibles
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
    }

    /**
     * Carga preferencias del usuario desde localStorage
     */
    function loadUserPreferences() {
        try {
            var stored = localStorage.getItem('tts_reader_prefs');
            if (stored) {
                var prefs = JSON.parse(stored);
                userPrefs = Object.assign(userPrefs, prefs);
            }
        } catch (e) {
            console.warn('No se pudieron cargar las preferencias TTS:', e);
        }

        // Aplicar configuración por defecto del admin si existe
        if (config.defaultSpeed) {
            userPrefs.speed = parseFloat(config.defaultSpeed);
        }
        if (config.defaultVolume) {
            userPrefs.volume = parseInt(config.defaultVolume);
        }
        if (config.autoMinimize !== undefined) {
            userPrefs.minimized = config.autoMinimize;
        }
    }

    /**
     * Guarda preferencias del usuario en localStorage
     */
    function saveUserPreferences() {
        try {
            localStorage.setItem('tts_reader_prefs', JSON.stringify(userPrefs));
        } catch (e) {
            console.warn('No se pudieron guardar las preferencias TTS:', e);
        }
    }

    /**
     * Crea el HTML del widget
     */
    function createWidget() {
        var position = config.position || 'right-center';
        var minimizedClass = userPrefs.minimized ? 'minimized' : '';

        var html = `
            <div id="ttsWidget" class="tts-widget position-${position} ${minimizedClass}">
                <div class="tts-widget-icon" onclick="TTSWidget.toggleWidget()">
                    🔊
                </div>
                
                <div class="widget-container">
                    <div class="widget-header">
                        <div class="widget-title">
                            🔊 Lector de Voz
                        </div>
                        <button class="minimize-btn" onclick="TTSWidget.toggleWidget()" aria-label="Minimizar">
                            −
                        </button>
                    </div>
                    
                    <div class="widget-body">
                        <div class="control-group">
                            <label class="control-label" for="ttsVoiceSelect">Voz</label>
                            <select id="ttsVoiceSelect" class="tts-select">
                                <option>Cargando voces...</option>
                            </select>
                            <div class="voice-hint">
                                ℹ️ El cambio de voz se aplicará al iniciar una nueva lectura
                            </div>
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label" for="ttsSpeedControl">Velocidad</label>
                            <input type="range" id="ttsSpeedControl" class="tts-range" 
                                   min="0.5" max="2" step="0.1" value="${userPrefs.speed}">
                            <div class="range-value">
                                <span>0.5x</span>
                                <span id="ttsSpeedValue" class="range-value-center">${userPrefs.speed}x</span>
                                <span>2.0x</span>
                            </div>
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label" for="ttsVolumeControl">Volumen</label>
                            <input type="range" id="ttsVolumeControl" class="tts-range" 
                                   min="0" max="100" step="5" value="${userPrefs.volume}">
                            <div class="range-value">
                                <span>🔇</span>
                                <span id="ttsVolumeValue" class="range-value-center">${userPrefs.volume}%</span>
                                <span>🔊</span>
                            </div>
                        </div>
                        
                        <div class="controls-row">
                            <button class="tts-btn tts-btn-primary" id="ttsPlayBtn" 
                                    onclick="TTSWidget.play()" aria-label="Reproducir">
                                ▶️
                            </button>
                            <button class="tts-btn tts-btn-secondary" id="ttsPauseBtn" 
                                    onclick="TTSWidget.pause()" disabled aria-label="Pausar">
                                ⏸️
                            </button>
                            <button class="tts-btn tts-btn-secondary" id="ttsStopBtn" 
                                    onclick="TTSWidget.stop()" disabled aria-label="Detener">
                                ⏹️
                            </button>
                        </div>
                        
                        <div class="status-indicator" id="ttsStatus">
                            Listo para leer esta página
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        widgetElement = document.getElementById('ttsWidget');
    }

    /**
     * Carga las voces disponibles
     */
    function loadVoices() {
        voices = synth.getVoices();
        var voiceSelect = document.getElementById('ttsVoiceSelect');

        if (!voiceSelect) return;

        voiceSelect.innerHTML = '';

        // Filtrar voces en español
        var spanishVoices = voices.filter(function (v) {
            return v.lang.startsWith('es');
        });

        console.log('Voces en español encontradas:', spanishVoices.length); // Debug

        if (spanishVoices.length === 0) {
            voiceSelect.innerHTML = '<option>Sin voces en español</option>';
            // Retry en 1s por si voces cargan tarde
            setTimeout(loadVoices, 1000);
            return;
        }

        // Ordenar voces: latinoamericanas primero
        spanishVoices.sort(function (a, b) {
            var aIsLatam = isLatinAmericanVoice(a);
            var bIsLatam = isLatinAmericanVoice(b);

            if (aIsLatam && !bIsLatam) return -1;
            if (!aIsLatam && bIsLatam) return 1;
            return a.name.localeCompare(b.name);
        });

        spanishVoices.forEach(function (voice, i) {
            var option = document.createElement('option');
            option.value = i;
            option.dataset.voiceName = voice.name;

            var isLatam = isLatinAmericanVoice(voice);
            var displayName = voice.name.split(' ')[0] || voice.name;
            option.textContent = displayName + (isLatam ? ' ⭐' : '');
            voiceSelect.appendChild(option);
        });

        // Seleccionar voz preferida o default
        if (userPrefs.voice) {
            var selectedIndex = spanishVoices.findIndex(function (v) {
                return v.name === userPrefs.voice;
            });
            if (selectedIndex !== -1) {
                voiceSelect.value = selectedIndex;
            }
        } else {
            // Default a primera latina
            var latamVoice = spanishVoices.find(isLatinAmericanVoice);
            if (latamVoice) {
                voiceSelect.value = spanishVoices.indexOf(latamVoice);
                userPrefs.voice = latamVoice.name;
                saveUserPreferences();
            }
        }
    }

    /**
     * Detecta si la voz es latinoamericana
     */
    function isLatinAmericanVoice(voice) {
        var latamCodes = ['es-MX', 'es-AR', 'es-CL', 'es-CO', 'es-PE', 'es-VE', 'es-PR'];
        return latamCodes.includes(voice.lang) ||
            voice.name.toLowerCase().includes('latin') ||
            voice.name.toLowerCase().includes('mexic') ||
            voice.name.toLowerCase().includes('colomb') ||
            voice.name.toLowerCase().includes('argent');
    }

    /**
     * Adjunta listeners de eventos
     */
    function attachEventListeners() {
        var speedControl = document.getElementById('ttsSpeedControl');
        var speedValue = document.getElementById('ttsSpeedValue');
        var volumeControl = document.getElementById('ttsVolumeControl');
        var volumeValue = document.getElementById('ttsVolumeValue');
        var voiceSelect = document.getElementById('ttsVoiceSelect');

        if (speedControl && speedValue) {
            speedControl.addEventListener('input', function (e) {
                userPrefs.speed = parseFloat(e.target.value);
                speedValue.textContent = userPrefs.speed + 'x';
                if (utterance) utterance.rate = userPrefs.speed;
                saveUserPreferences();
            });
        }

        if (volumeControl && volumeValue) {
            volumeControl.addEventListener('input', function (e) {
                userPrefs.volume = parseInt(e.target.value);
                volumeValue.textContent = userPrefs.volume + '%';
                if (utterance) utterance.volume = userPrefs.volume / 100;
                saveUserPreferences();
            });
        }

        // Dentro de attachEventListeners(), después de los listeners existentes:

        if (speedControl) {
            speedControl.addEventListener('input', function (e) {
                userPrefs.speed = parseFloat(e.target.value);
                speedValue.textContent = userPrefs.speed + 'x';
                saveUserPreferences();

                // ←←← NUEVO: cambio inmediato mientras lee
                if (utterance) utterance.rate = userPrefs.speed;
                // Forzar que el fragmento actual también lo use
                if (synth.speaking && !synth.paused) {
                    synth.cancel();
                    setTimeout(speakNext, 50);  // speakNext es la función que ya tienes dentro de play()
                }
            });
        }

        if (volumeControl) {
            volumeControl.addEventListener('input', function (e) {
                userPrefs.volume = parseInt(e.target.value);
                volumeValue.textContent = userPrefs.volume + '%';
                saveUserPreferences();

                // ←←← NUEVO: cambio inmediato mientras lee
                if (utterance) utterance.volume = userPrefs.volume / 100;
                if (synth.speaking && !synth.paused) {
                    synth.cancel();
                    setTimeout(speakNext, 50);
                }
            });
        }

        if (voiceSelect) {
            voiceSelect.addEventListener('change', function (e) {
                var option = e.target.options[e.target.selectedIndex];
                userPrefs.voice = option.dataset.voiceName;
                saveUserPreferences();
            });
        }
    }

    /**
     * Extrae el contenido legible de la página
     */
    function extractPageContent() {
        var selectors = [
            '#region-main',           // Contenido principal Moodle
            '.course-content',        // Contenido del curso
            '[role="main"]',          // Contenido principal genérico
            'article',                // Artículos
            '.content-area',          // Áreas de contenido
            'main',                   // Tag main HTML5
            '.modtype_page .content', // Específico para mod/page
            '.box.contents'           // Contenido en páginas Moodle
        ];

        var content = '';

        for (var i = 0; i < selectors.length; i++) {
            var element = document.querySelector(selectors[i]);
            if (element) {
                // Clonar para no afectar el DOM original
                var clone = element.cloneNode(true);

                // Remover elementos no deseados
                var unwanted = clone.querySelectorAll('script, style, nav, .navigation, .navbar, footer, aside, [role="navigation"]');
                unwanted.forEach(function (el) {
                    el.remove();
                });

                content = clone.innerText || clone.textContent;
                if (content.trim()) break; // Si encontró algo, salir
            }
        }

        // Si no se encontró contenido específico, usar body pero filtrado
        if (!content.trim()) {
            var body = document.body.cloneNode(true);
            var unwanted = body.querySelectorAll('script, style, nav, header, footer, aside, .tts-widget');
            unwanted.forEach(function (el) {
                el.remove();
            });
            content = body.innerText || body.textContent;
        }

        // Limpiar texto
        content = content
            .replace(/\s+/g, ' ')           // Múltiples espacios a uno
            .replace(/\n{3,}/g, '\n\n')     // Múltiples saltos de línea
            .trim();

        return content;
    }

    /**
     * Reproduce el contenido
     */
    /**
 * Reproduce el contenido (versión corregida contra bloqueo de autoplay)
 */
    /**
    * Reproduce el contenido – VERSIÓN 100% FUNCIONAL (fragmentada)
    */
    function play() {
        if (synth.speaking && !synth.paused) return;

        // Si está pausado → reanudar (esto siempre funciona)
        if (synth.paused) {
            synth.resume();
            updateUIState('playing');
            return;
        }

        var fullText = extractPageContent();
        console.log('Texto completo a leer (caracteres):', fullText.length);

        if (!fullText || fullText.trim().length < 10) {
            updateStatus('No hay contenido para leer', false);
            return;
        }

        // === DESBLOQUEO DEL MOTOR TTS (obligatorio en Chrome 2024+) ===
        if (!synth.speaking) {
            const dummy = new SpeechSynthesisUtterance('');
            dummy.volume = 0;
            synth.speak(dummy);           // Desbloquea el motor
        }

        // === DIVIDIR EN FRAGMENTOS PEQUEÑOS (máx ~200 caracteres) ===
        // Esto evita que Chrome lo bloquee como "autoplay"
        var fragments = fullText.match(/.{1,180}(\s|$)/g) || [fullText];
        console.log('Fragmentos creados:', fragments.length);

        var voiceSelect = document.getElementById('ttsVoiceSelect');
        var selectedVoice = null;
        if (voiceSelect && voiceSelect.selectedIndex >= 0) {
            var spanishVoices = voices.filter(v => v.lang.startsWith('es'));
            selectedVoice = spanishVoices[parseInt(voiceSelect.value)];
        }

        var index = 0;

        function speakNext() {
            if (index >= fragments.length) {
                updateUIState('stopped');
                updateStatus('Lectura completada ✓', true);
                setTimeout(() => updateStatus('Listo para leer esta página', false), 3000);
                return;
            }

            // Cancelar cualquier cosa que esté hablando
            synth.cancel();

            var text = fragments[index].trim();
            if (!text) {
                index++;
                speakNext();
                return;
            }

            utterance = new SpeechSynthesisUtterance(text);

            if (selectedVoice) utterance.voice = selectedVoice;
            utterance.rate = userPrefs.speed;
            utterance.volume = userPrefs.volume / 100;
            utterance.pitch = 1;
            utterance.lang = 'es-MX';

            utterance.onstart = () => {
                console.log(`Reproduciendo fragmento ${index + 1}/${fragments.length}`);
                updateUIState('playing');
            };

            utterance.onend = () => {
                index++;
                // Pequeño retraso entre fragmentos para que suene natural
                setTimeout(speakNext, 300);
            };

            utterance.onerror = (e) => {
                console.error('Error en fragmento:', e);
                index++;
                setTimeout(speakNext, 500);
            };

            synth.speak(utterance);
        }

        // Empezar la cadena
        updateUIState('playing');
        updateStatus('Leyendo...', false);
        speakNext();
    }

    /**
     * Pausa/Reanuda la reproducción
     */
    function pause() {
        if (!synth.speaking) return;

        if (isPaused) {
            synth.resume();
            updateUIState('playing');
        } else {
            synth.pause();
            updateUIState('paused');
        }
    }

    /**
     * Detiene la reproducción
     */
    function stop() {
        synth.cancel();
        isPaused = false;
        updateUIState('stopped');
        updateStatus('Listo para leer esta página', false);
    }

    /**
     * Actualiza el estado de la UI
     */
    function updateUIState(state) {
        var playBtn = document.getElementById('ttsPlayBtn');
        var pauseBtn = document.getElementById('ttsPauseBtn');
        var stopBtn = document.getElementById('ttsStopBtn');
        var status = document.getElementById('ttsStatus');

        if (!playBtn || !pauseBtn || !stopBtn || !status) return;

        switch (state) {
            case 'playing':
                playBtn.disabled = true;
                pauseBtn.disabled = false;
                stopBtn.disabled = false;
                pauseBtn.innerHTML = '⏸️';
                updateStatus('Leyendo...', false);
                status.classList.add('reading');
                status.classList.remove('completed');
                isPaused = false;
                break;

            case 'paused':
                playBtn.disabled = true;
                pauseBtn.disabled = false;
                stopBtn.disabled = false;
                pauseBtn.innerHTML = '▶️';
                updateStatus('Pausado', false);
                status.classList.remove('reading', 'completed');
                isPaused = true;
                break;

            case 'stopped':
                playBtn.disabled = false;
                pauseBtn.disabled = true;
                stopBtn.disabled = true;
                pauseBtn.innerHTML = '⏸️';
                status.classList.remove('reading');
                isPaused = false;
                break;
        }
    }

    /**
     * Actualiza el mensaje de estado
     */
    function updateStatus(message, isCompleted) {
        var status = document.getElementById('ttsStatus');
        if (!status) return;

        status.textContent = message;

        if (isCompleted) {
            status.classList.add('completed');
        } else {
            status.classList.remove('completed');
        }
    }

    /**
     * Alterna entre minimizado y expandido
     */
    function toggleWidget() {
        if (!widgetElement) return;

        var isMinimized = widgetElement.classList.toggle('minimized');
        userPrefs.minimized = isMinimized;
        saveUserPreferences();
    }

    // API pública
    return {
        init: init,
        play: play,
        pause: pause,
        stop: stop,
        toggleWidget: toggleWidget
    };
})();

// Auto-inicializar cuando el DOM esté listo, con timeout para Moodle AJAX
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            // Se inicializará desde el PHP con la configuración
            // Si no se llama init desde PHP, llamar aquí con defaults
            if (!document.getElementById('ttsWidget')) {
                TTSWidget.init({});
            }
        }, 500); // Espera extra para carga Moodle
    });
} else {
    setTimeout(function () {
        if (!document.getElementById('ttsWidget')) {
            TTSWidget.init({});
        }
    }, 500);
}