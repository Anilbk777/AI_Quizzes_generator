/* ── Source-type Tab Switching ─────────────── */
const sourceButtons = document.querySelectorAll('.source-btn');

sourceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        sourceButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        createRipple(btn);
    });
});

function createRipple(el) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position:absolute; border-radius:50%;
        width:80px; height:80px;
        background:rgba(255,255,255,0.18);
        transform:scale(0); opacity:1;
        left:50%; top:50%; translate:-50% -50%;
        animation: rippleAnim 0.5s ease-out forwards;
        pointer-events:none; z-index:2;
    `;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
}

// Inject ripple keyframe once
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes rippleAnim { to { transform: scale(3); opacity: 0; } }`;
document.head.appendChild(styleTag);

/* ── Character Counter ─────────────────────── */
const textarea  = document.getElementById('topic-input');
const charCount = document.getElementById('char-count');
const MAX_CHARS = 1000;

textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} / ${MAX_CHARS}`;
    charCount.classList.remove('warn', 'limit');
    if (len >= MAX_CHARS)             charCount.classList.add('limit');
    else if (len >= MAX_CHARS * 0.85) charCount.classList.add('warn');
});

/* ══════════════════════════════════════════════
   Custom Drop-Up Component
══════════════════════════════════════════════ */

/**
 * Initialises a single .dropup element.
 * @param {HTMLElement} dropupEl
 */
function initDropup(dropupEl) {
    const trigger = dropupEl.querySelector('.dropup-trigger');
    const menu    = dropupEl.querySelector('.dropup-menu');
    const items   = dropupEl.querySelectorAll('.dropup-item');
    const valueEl = dropupEl.querySelector('.dropup-value');
    const hidden  = dropupEl.querySelector('input[type="hidden"]');

    // ── Toggle open/close ──────────────────────
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropupEl.getAttribute('aria-expanded') === 'true';
        closeAllDropups();          // close siblings first
        if (!isOpen) openDropup(dropupEl);
    });

    // ── Select an item ────────────────────────
    items.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            items.forEach(i => {
                i.classList.remove('active');
                i.removeAttribute('aria-selected');
            });
            item.classList.add('active');
            item.setAttribute('aria-selected', 'true');

            // Update displayed value & hidden input
            valueEl.textContent = item.textContent.trim();
            hidden.value        = item.dataset.value;

            closeDropup(dropupEl);
        });

        // Allow keyboard navigation
        item.setAttribute('tabindex', '-1');
    });

    // ── Keyboard support ─────────────────────
    trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger.click();
        }
        if (e.key === 'Escape') closeDropup(dropupEl);
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            openDropup(dropupEl);
            const activeIdx  = [...items].findIndex(i => i.classList.contains('active'));
            const nextIdx    = e.key === 'ArrowUp'
                ? Math.max(activeIdx - 1, 0)
                : Math.min(activeIdx + 1, items.length - 1);
            items[nextIdx].focus();
        }
    });

    menu.addEventListener('keydown', (e) => {
        const focused = document.activeElement;
        const list    = [...items];
        const idx     = list.indexOf(focused);

        if (e.key === 'ArrowUp')   { e.preventDefault(); list[Math.max(idx - 1, 0)].focus(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); list[Math.min(idx + 1, list.length - 1)].focus(); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focused.click(); }
        if (e.key === 'Escape')    { closeDropup(dropupEl); trigger.focus(); }
        if (e.key === 'Tab')       { closeDropup(dropupEl); }
    });
}

function openDropup(el) {
    el.setAttribute('aria-expanded', 'true');
}

function closeDropup(el) {
    el.setAttribute('aria-expanded', 'false');
}

function closeAllDropups() {
    document.querySelectorAll('.dropup[aria-expanded="true"]').forEach(closeDropup);
}

// Close on outside click
document.addEventListener('click', closeAllDropups);

// Init all drop-ups on the page
document.querySelectorAll('.dropup').forEach(initDropup);

/* ── Expose values as a helper ────────────── */
function getDropupValue(dropupId) {
    const el = document.getElementById(dropupId);
    return el ? el.querySelector('input[type="hidden"]').value : null;
}

/* ── Generate Button ───────────────────────── */
const generateBtn = document.getElementById('generate-btn');

generateBtn.addEventListener('click', async () => {
    if (generateBtn.classList.contains('loading')) return;

    const topic = textarea.value.trim();
    if (!topic) {
        shakeElement(textarea.closest('.textarea-wrapper'));
        textarea.focus();
        return;
    }

    // Read values from custom drop-ups
    const difficulty = getDropupValue('dropup-difficulty');
    const questions  = getDropupValue('dropup-questions');
    const model      = getDropupValue('dropup-model');

    console.log('Generating quiz:', { topic, difficulty, questions, model });

    generateBtn.classList.add('loading');
    generateBtn.disabled = true;

    try {
        // ── Replace this block with your real API call ──
        await simulateAPICall();
        // ────────────────────────────────────────────────
    } catch (err) {
        console.error('Quiz generation failed:', err);
    } finally {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
    }
});

/* Shake animation for empty-input feedback */
function shakeElement(el) {
    el.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
    ], { duration: 380, easing: 'ease-in-out' });
}

/* Stub — remove when you wire up the real endpoint */
function simulateAPICall() {
    return new Promise(resolve => setTimeout(resolve, 2200));
}
