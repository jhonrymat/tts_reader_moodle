/**
 * TTS Reader Pro v1.1.1 – Moodle Block
 * Con barra de progreso clicable + scroll automático + resaltado perfecto
 */

var TTSWidget = (function () {
    'use strict';

    const synth = window.speechSynthesis;
    let utterance = null;
    let voices = [];
    let config = {};
    let widgetElement = null;
    let fragments = [];
    let currentFragmentIndex = 0;
    let isPlaying = false;
    let fragmentElements = []; // Guardamos referencias a los spans resaltados

    const userPrefs = {
        voice: null,
        speed: 1.0,
        volume: 100,
        minimized: true
    };

    function init(configuration) {
        if (document.getElementById('ttsWidget')) return;
        config = configuration || {};
        loadUserPreferences();
        createWidget();
        loadVoices();
        attachEventListeners();

        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
    }

    function loadUserPreferences() {
        try {
            const stored = localStorage.getItem('tts_reader_prefs');
            if (stored) Object.assign(userPrefs, JSON.parse(stored));
        } catch (e) { console.warn('TTS prefs error:', e); }

        if (config.defaultSpeed) userPrefs.speed = parseFloat(config.defaultSpeed);
        if (config.defaultVolume) userPrefs.volume = parseInt(config.defaultVolume);
        if (config.autoMinimize !== undefined) userPrefs.minimized = config.autoMinimize;
    }

    function saveUserPreferences() {
        try { localStorage.setItem('tts_reader_prefs', JSON.stringify(userPrefs)); }
        catch (e) { console.warn('TTS save error:', e); }
    }

    function createWidget() {
        const position = config.position || 'right-center';
        const minimizedClass = userPrefs.minimized ? 'minimized' : '';

        const html = `
            <div id="ttsWidget" class="tts-widget position-${position} ${minimizedClass}">
                <!-- Icono bonito con emoji de altavoz -->
                <div class="tts-widget-icon" onclick="TTSWidget.toggleWidget()">
                    🔊
                </div>
                
                <div class="widget-container">
                    <div class="widget-header">
                        <div class="widget-title">🔊 TTS Reader Pro</div>
                        <button class="minimize-btn" onclick="TTSWidget.toggleWidget()" aria-label="Minimizar">−</button>
                    </div>
                    
                    <div class="widget-body">
                        <div class="control-group">
                            <label class="control-label">Voz</label>
                            <select id="ttsVoiceSelect" class="tts-select"></select>
                            <div class="voice-hint">
                                El cambio de voz se aplicará en la siguiente sección
                            </div>
                        </div>

                        <div class="control-group">
                            <label class="control-label">Velocidad</label>
                            <input type="range" id="ttsSpeedControl" class="tts-range" min="0.5" max="2" step="0.1" value="${userPrefs.speed}">
                            <div class="range-value"><span>0.5x</span><span id="ttsSpeedValue" class="range-value-center">${userPrefs.speed}x</span><span>2.0x</span></div>
                        </div>

                        <div class="control-group">
                            <label class="control-label">Volumen</label>
                            <input type="range" id="ttsVolumeControl" class="tts-range" min="0" max="100" step="5" value="${userPrefs.volume}">
                            <div class="range-value"><span>Silencio</span><span id="ttsVolumeValue" class="range-value-center">${userPrefs.volume}%</span><span>Volumen</span></div>
                        </div>

                        <!-- BARRA DE PROGRESO CLICABLE + SCROLL AUTOMÁTICO -->
                        <div class="progress-container">
                            <div class="progress-bar" id="ttsProgressBar">
                                <div id="ttsProgressFill" class="progress-fill"></div>
                                <div id="ttsProgressHandle" class="progress-handle"></div>
                            </div>
                            <div class="progress-info">
                                <span id="ttsFragmentInfo">Listo</span>
                                <span id="ttsTimeInfo">--:--</span>
                            </div>
                        </div>

                        <div class="controls-row">
                            <button class="tts-btn tts-btn-primary" id="ttsPlayBtn" onclick="TTSWidget.play()">Play</button>
                            <button class="tts-btn tts-btn-secondary" id="ttsPauseBtn" onclick="TTSWidget.pause()" disabled>Pause</button>
                            <button class="tts-btn tts-btn-secondary" id="ttsStopBtn" onclick="TTSWidget.stop()">Stop</button>
                        </div>

                        <div class="status-indicator" id="ttsStatus">Listo para leer esta página</div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        widgetElement = document.getElementById('ttsWidget');
    }

    function loadVoices() {
        voices = synth.getVoices();
        const select = document.getElementById('ttsVoiceSelect');
        if (!select) return;

        select.innerHTML = '';
        const spanish = voices.filter(v => v.lang.startsWith('es'));
        
        if (spanish.length === 0) {
            select.innerHTML = '<option>Sin voces en español</option>';
            setTimeout(loadVoices, 1000);
            return;
        }

        spanish.sort((a, b) => (isLatinAmericanVoice(b) ? 1 : -1) - (isLatinAmericanVoice(a) ? 1 : -1));
        spanish.forEach((voice, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = voice.name.split(' ')[0] + (isLatinAmericanVoice(voice) ? ' Favorito' : '');
            select.appendChild(opt);
        });

        if (userPrefs.voice) {
            const idx = spanish.findIndex(v => v.name === userPrefs.voice);
            if (idx !== -1) select.value = idx;
        }
    }

    function isLatinAmericanVoice(voice) {
        return ['es-MX','es-CO','es-AR','es-PE','es-CL'].includes(voice.lang) || 
               /mexic|colomb|argent|peru|chile|latino/i.test(voice.name);
    }

    function attachEventListeners() {
        document.getElementById('ttsSpeedControl').addEventListener('input', e => {
            userPrefs.speed = parseFloat(e.target.value);
            document.getElementById('ttsSpeedValue').textContent = userPrefs.speed + 'x';
            if (utterance) utterance.rate = userPrefs.speed;
            saveUserPreferences();
        });

        document.getElementById('ttsVolumeControl').addEventListener('input', e => {
            userPrefs.volume = parseInt(e.target.value);
            document.getElementById('ttsVolumeValue').textContent = userPrefs.volume + '%';
            if (utterance) utterance.volume = userPrefs.volume / 100;
            saveUserPreferences();
        });

        document.getElementById('ttsVoiceSelect').addEventListener('change', e => {
            const spanish = voices.filter(v => v.lang.startsWith('es'));
            userPrefs.voice = spanish[e.target.value].name;
            saveUserPreferences();
        });

        // CLIC EN CUALQUIER PARTE DE LA BARRA → SALTAR + SCROLL
        document.getElementById('ttsProgressBar').addEventListener('click', e => {
            if (fragments.length === 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const targetIndex = Math.max(0, Math.min(Math.floor(percent * fragments.length), fragments.length - 1));
            jumpToFragment(targetIndex);
        });
    }

   function extractPageContent() {
        const selectors = ['#region-main', '[role="main"]', '.modtype_page .content', 'main', '.page-content'];
        let container = null;
        for (const sel of selectors) {
            container = document.querySelector(sel);
            if (container) break;
        }
        if (!container) container = document.body;
    
        // Limpiar resaltados anteriores
        document.querySelectorAll('.tts-highlight-fragment').forEach(el => {
            const parent = el.parentNode;
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
        });
        fragmentElements = [];
    
        // CLON PROFUNDO + ELIMINAR TODO LO QUE NO VE EL ESTUDIANTE
        const clone = container.cloneNode(true);
    
        // Eliminar contenido oculto para estudiantes
        clone.querySelectorAll('.hiddenactivity, .accesshide, [style*="display: none"], .d-none, .sr-only, .badge').forEach(el => {
            el.remove();
        });
    
        // Eliminar elementos típicos de admin
        clone.querySelectorAll('.activity-badges .badge, .bulkselect, .availabilityinfo').forEach(el => el.remove());
    
        // Eliminar scripts, estilos, etc.
        clone.querySelectorAll('script,style,nav,footer,.tts-widget,noscript,button,audio,video').forEach(e => e.remove());
    
        let fullText = clone.textContent || clone.innerText || '';
        fullText = fullText.replace(/\s+/g, ' ').trim();
    
        if (!fullText) {
            fragments = [];
            return '';
        }
    
        // DIVISIÓN INTELIGENTE POR ORACIONES (máximo 200 caracteres)
        const sentences = fullText.split(/(?<=[.!?])\s+/);
        fragments = [];
        let chunk = '';
    
        sentences.forEach(sentence => {
            const temp = (chunk + ' ' + sentence).trim();
            if (temp.length > 200 && chunk.length > 80) {
                fragments.push(chunk.trim() + (chunk.match(/[.!?]$/) ? '' : '.'));
                chunk = sentence;
            } else {
                chunk = temp;
            }
        });
        if (chunk) {
            fragments.push(chunk.trim() + (chunk.match(/[.!?]$/) ? '' : '.'));
        }
    
        console.log(`Fragmentos creados: ${fragments.length} (solo contenido visible para estudiantes)`);
    
        // Insertar spans en el DOM real
        let offset = 0;
        const originalText = container.textContent || '';
        fragments.forEach((frag, i) => {
            const cleanFrag = frag.replace(/[.!?]+$/g, '').trim();
            const start = originalText.indexOf(cleanFrag, offset);
            if (start === -1) return;
            const end = start + cleanFrag.length;
            offset = end;
    
            const span = insertHighlightSpan(container, start, end, i);
            if (span) fragmentElements[i] = span;
        });
    
        return fullText;
    }

    function insertHighlightSpan(container, start, end, index) {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        let node;
        let currentPos = 0;
        let targetNode = null;
        let relativeStart = 0;

        while ((node = walker.nextNode())) {
            const len = node.textContent.length;
            if (currentPos + len > start) {
                targetNode = node;
                relativeStart = start - currentPos;
                break;
            }
            currentPos += len;
        }

        if (!targetNode || currentPos + targetNode.textContent.length < end) return null;

        const range = document.createRange();
        const span = document.createElement('span');
        span.className = 'tts-highlight-fragment';
        span.dataset.fragment = index;
        range.setStart(targetNode, relativeStart);
        range.setEnd(targetNode, end - currentPos);
        range.surroundContents(span);
        return span;
    }
    
    // 1. NUEVA FUNCIÓN: encuentra el contenedor que realmente hace scroll en Moodle
    function getScrollContainer() {
        // Remui, Boost, Classic y casi todos los temas modernos usan uno de estos
        const candidates = [
            document.querySelector('#page'),                    // Moodle estándar
            document.querySelector('#page-content'),             // Algunos temas
            document.querySelector('.drawer-toggles'),          // Remui
            document.querySelector('.edwiser-page-builder-body'),// Remui
            document.querySelector('main'),                      // HTML5
            document.body
        ];
        
        for (const el of candidates) {
            if (el && (el.scrollHeight > el.clientHeight || el === document.body)) {
                return el;
            }
        }
        return window; // fallback
    }

    function scrollToCurrentFragment() {
        if (!fragmentElements[currentFragmentIndex]) return;
    
        const target = fragmentElements[currentFragmentIndex];
        const scrollContainer = getScrollContainer();
    
        // Si es window, usamos el método viejo
        if (scrollContainer === window) {
            const rect = target.getBoundingClientRect();
            const targetY = window.pageYOffset + rect.top - (window.innerHeight * 0.3);
            window.scrollTo({ top: targetY, behavior: 'smooth' });
            return;
        }
    
        // Si es un contenedor con scroll propio (Remui, etc.)
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top;
    
        const targetScroll = scrollContainer.scrollTop + relativeTop - (scrollContainer.clientHeight * 0.3);
    
        scrollContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    
        // Fallback brutal si no se movió
        setTimeout(() => {
            if (Math.abs(scrollContainer.scrollTop - targetScroll) > 50) {
                scrollContainer.scrollTop = targetScroll;
            }
        }, 800);
    }

    function highlightCurrent(index) {
        document.querySelectorAll('.tts-highlight-fragment').forEach(s => {
            s.classList.toggle('tts-current', parseInt(s.dataset.fragment) === index);
        });
    }

    function updateProgress() {
        if (fragments.length === 0) return;
        const percent = (currentFragmentIndex / fragments.length) * 100;
        document.getElementById('ttsProgressFill').style.width = percent + '%';
        document.getElementById('ttsProgressHandle').style.left = percent + '%';
        document.getElementById('ttsFragmentInfo').textContent = `${currentFragmentIndex + 1} / ${fragments.length}`;
    }

    function jumpToFragment(index) {
        if (index === currentFragmentIndex || fragments.length === 0) return;
        currentFragmentIndex = index;
        highlightCurrent(currentFragmentIndex);
        updateProgress();
        scrollToCurrentFragment();  // ← ahora sí siempre funciona
        if (isPlaying) {
            synth.cancel();
            setTimeout(speakNext, 150);
        }
    }

    function speakNext() {
        if (currentFragmentIndex >= fragments.length) {
            stop();
            return;
        }

        synth.cancel();
        const text = fragments[currentFragmentIndex].trim();
        if (!text) { currentFragmentIndex++; speakNext(); return; }

        utterance = new SpeechSynthesisUtterance(text);
        const voice = voices.filter(v => v.lang.startsWith('es'))[document.getElementById('ttsVoiceSelect').value];
        if (voice) utterance.voice = voice;

        utterance.rate = userPrefs.speed;
        utterance.volume = userPrefs.volume / 100;

        utterance.onstart = () => {
            highlightCurrent(currentFragmentIndex);
            updateProgress();
            scrollToCurrentFragment();
            document.getElementById('ttsStatus').textContent = 'Leyendo...';
            document.getElementById('ttsStatus').classList.add('reading');
        };

        utterance.onend = () => {
            currentFragmentIndex++;
            speakNext();
        };

        synth.speak(utterance);
    }

    function play() {
        if (isPlaying && synth.paused) { synth.resume(); updateUIState('playing'); return; }
        if (synth.speaking) return;

        // Desbloqueo rápido
        synth.speak(new SpeechSynthesisUtterance(''));

        extractPageContent();
        currentFragmentIndex = 0;
        isPlaying = true;
        updateUIState('playing');
        updateProgress();
        speakNext();
    }

    function pause() {
        synth.pause();
        updateUIState('paused');
    }

    function stop() {
        synth.cancel();
        isPlaying = false;
        currentFragmentIndex = 0;
        highlightCurrent(-1);
        updateProgress();
        document.getElementById('ttsStatus').textContent = 'Listo para leer esta página';
        document.getElementById('ttsStatus').classList.remove('reading');
        updateUIState('stopped');
    }

    function updateUIState(state) {
        const playBtn = document.getElementById('ttsPlayBtn');
        const pauseBtn = document.getElementById('ttsPauseBtn');
        const stopBtn = document.getElementById('ttsStopBtn');

        playBtn.disabled = (state === 'playing');
        pauseBtn.disabled = (state !== 'playing' && state !== 'paused');
        stopBtn.disabled = (state === 'stopped');
        pauseBtn.innerHTML = (state === 'paused') ? 'Play' : 'Pause';
    }

    function toggleWidget() {
        widgetElement.classList.toggle('minimized');
        userPrefs.minimized = widgetElement.classList.contains('minimized');
        saveUserPreferences();
    }

    return { init, play, pause, stop, toggleWidget };
})();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!document.getElementById('ttsWidget')) TTSWidget.init({});
    }, 600);
});