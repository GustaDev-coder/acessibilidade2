(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        const panel = document.getElementById('access-panel');
        const overlay = document.getElementById('panel-overlay');
        const openBtn = document.getElementById('open-panel');
        const closeBtn = document.getElementById('close-panel');
        const panelGrid = document.getElementById('controls-grid');
        const resetBtn = document.getElementById('reset-btn');
        const mainContent = document.getElementById('main-content');

        if (!panel || !openBtn || !closeBtn || !panelGrid) return;

        const state = {
            fontPct: 100,
            contrast: false,
            dyslexic: false,
            reducedMotion: false,
            line: false,
            highlighted: false,
            speaking: false
        };

        let lineGuideEl = null;
        let utterance = null;
        const synth = window.speechSynthesis || null;

        // Persistência segura (evita erro em modo privado/sandboxed)
        function saveState() {
            try {
                localStorage.setItem('acSettings', JSON.stringify(state));
            } catch (e) {
                /* ignore */
            }
        }

        function loadState() {
            try {
                const saved = localStorage.getItem('acSettings');
                if (saved) {
                    Object.assign(state, JSON.parse(saved));
                    state.speaking = false;
                }
            } catch (e) {
                /* ignore */
            }
            applyState();
        }

        function applyState() {
            // 1. Escala Tipográfica
            document.documentElement.style.fontSize = state.fontPct + '%';

            // 2. Classes no body
            document.body.classList.toggle('high-contrast', state.contrast);
            document.body.classList.toggle('dyslexic', state.dyslexic);
            document.body.classList.toggle('reduced-motion', state.reducedMotion);
            document.body.classList.toggle('highlight-links', state.highlighted);

            // 3. Linha Guia
            if (state.line) {
                enableLineGuide();
            } else {
                disableLineGuide();
            }

            // 4. Atualizar estados dos botões
            updateButtons();
        }

        function updateButtons() {
            const buttons = panelGrid.querySelectorAll('.ac-btn');
            buttons.forEach(btn => {
                const action = btn.dataset.action;
                if (action === 'contrast') btn.setAttribute('aria-pressed', String(state.contrast));
                if (action === 'dyslexic') btn.setAttribute('aria-pressed', String(state.dyslexic));
                if (action === 'reducedMotion') btn.setAttribute('aria-pressed', String(state.reducedMotion));
                if (action === 'line') btn.setAttribute('aria-pressed', String(state.line));
                if (action === 'highlight') btn.setAttribute('aria-pressed', String(state.highlighted));
                if (action === 'read') btn.setAttribute('aria-pressed', String(state.speaking));
            });
        }

        // Abertura e Fechamento do Painel
        function togglePanel(open) {
            if (open) {
                panel.classList.add('is-open');
                overlay.classList.add('is-open');
                panel.setAttribute('aria-hidden', 'false');
                overlay.setAttribute('aria-hidden', 'false');
                openBtn.setAttribute('aria-expanded', 'true');
                closeBtn.focus();
            } else {
                panel.classList.remove('is-open');
                overlay.classList.remove('is-open');
                panel.setAttribute('aria-hidden', 'true');
                overlay.setAttribute('aria-hidden', 'true');
                openBtn.setAttribute('aria-expanded', 'false');
                openBtn.focus();
            }
        }

        openBtn.addEventListener('click', () => togglePanel(true));
        closeBtn.addEventListener('click', () => togglePanel(false));
        if (overlay) overlay.addEventListener('click', () => togglePanel(false));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('is-open')) {
                togglePanel(false);
            }
        });

        // Clique nos botões de ação
        panelGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.ac-btn');
            if (!btn) return;
            const action = btn.dataset.action;

            switch (action) {
                case 'increase':
                    state.fontPct = Math.min(150, state.fontPct + 10);
                    break;
                case 'decrease':
                    state.fontPct = Math.max(85, state.fontPct - 10);
                    break;
                case 'contrast':
                    state.contrast = !state.contrast;
                    break;
                case 'dyslexic':
                    state.dyslexic = !state.dyslexic;
                    break;
                case 'reducedMotion':
                    state.reducedMotion = !state.reducedMotion;
                    break;
                case 'line':
                    state.line = !state.line;
                    break;
                case 'highlight':
                    state.highlighted = !state.highlighted;
                    break;
                case 'read':
                    toggleSpeech();
                    break;
            }

            saveState();
            applyState();
        });

        // Linha Guia
        function enableLineGuide() {
            if (!lineGuideEl) {
                lineGuideEl = document.createElement('div');
                lineGuideEl.className = 'line-guide';
                lineGuideEl.setAttribute('aria-hidden', 'true');
                document.body.appendChild(lineGuideEl);
            }
            document.addEventListener('mousemove', moveLineGuide);
        }

        function disableLineGuide() {
            if (lineGuideEl) {
                lineGuideEl.remove();
                lineGuideEl = null;
            }
            document.removeEventListener('mousemove', moveLineGuide);
        }

        function moveLineGuide(e) {
            if (lineGuideEl) {
                lineGuideEl.style.top = e.clientY + 'px';
            }
        }

        // Leitura por Voz
        function toggleSpeech() {
            if (!synth) return;

            if (state.speaking) {
                synth.cancel();
                state.speaking = false;
            } else {
                synth.cancel();
                const text = mainContent ? mainContent.innerText : document.body.innerText;
                utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'pt-BR';

                utterance.onend = () => {
                    state.speaking = false;
                    saveState();
                    applyState();
                };

                utterance.onerror = () => {
                    state.speaking = false;
                    saveState();
                    applyState();
                };

                synth.speak(utterance);
                state.speaking = true;
            }
        }

        // Restaurar Padrões
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                state.fontPct = 100;
                state.contrast = false;
                state.dyslexic = false;
                state.reducedMotion = false;
                state.line = false;
                state.highlighted = false;
                state.speaking = false;

                if (synth) synth.cancel();

                saveState();
                applyState();
            });
        }

        loadState();
    }
})();