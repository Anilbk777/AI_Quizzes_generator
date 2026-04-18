/* ── Source-type Tab Switching ─────────────── */
const sourceButtons = document.querySelectorAll('.source-btn');

// Map button data-type → panel id
const PANELS = {
    text:    document.getElementById('panel-text'),
    file:    document.getElementById('panel-file'),
    youtube: document.getElementById('panel-youtube'),
};

sourceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;

        // Button active state
        sourceButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Panel switching
        Object.entries(PANELS).forEach(([key, panel]) => {
            if (key === type) {
                panel.classList.add('active-panel');
                panel.removeAttribute('aria-hidden');
            } else {
                panel.classList.remove('active-panel');
                panel.setAttribute('aria-hidden', 'true');
            }
        });

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

const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes rippleAnim { to { transform: scale(3); opacity: 0; } }`;
document.head.appendChild(styleTag);

/* ── Character Counter ─────────────────────── */
const textarea  = document.getElementById('topic-input');
const charCount = document.getElementById('char-count');
const MAX_CHARS = 1000;

if (textarea && charCount) {
    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCount.textContent = `${len} / ${MAX_CHARS}`;
        charCount.classList.remove('warn', 'limit');
        if (len >= MAX_CHARS)             charCount.classList.add('limit');
        else if (len >= MAX_CHARS * 0.85) charCount.classList.add('warn');
    });
}

/* ══════════════════════════════════════════════
   FILE UPLOAD PANEL
══════════════════════════════════════════════ */
const uploadZone      = document.getElementById('upload-zone');
const uploadIdle      = document.getElementById('upload-idle');
const fileInput       = document.getElementById('file-input');
const uploadBrowseBtn = document.getElementById('upload-browse-btn');
const filePreview     = document.getElementById('file-preview');
const filePreviewName = document.getElementById('file-preview-name');
const filePreviewSize = document.getElementById('file-preview-size');
const filePreviewIcon = document.getElementById('file-preview-icon');
const fileRemoveBtn   = document.getElementById('file-remove-btn');

if (uploadZone && fileInput) {
    // Click zone or "browse" → open file picker
    uploadZone.addEventListener('click', () => {
        // Only trigger if no file is currently selected
        if (filePreview && filePreview.hidden) {
            fileInput.click();
        }
    });
    if (uploadBrowseBtn) {
        uploadBrowseBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
    }
    uploadZone.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && filePreview && filePreview.hidden) { 
            e.preventDefault(); 
            fileInput.click(); 
        }
    });

    // File selected via picker
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) handleFile(fileInput.files[0]);
    });

    // Drag & Drop
    uploadZone.addEventListener('dragenter', e => { 
        e.preventDefault(); 
        if (filePreview && filePreview.hidden) uploadZone.classList.add('dragging'); 
    });
    uploadZone.addEventListener('dragover',  e => { 
        e.preventDefault(); 
        if (filePreview && filePreview.hidden) uploadZone.classList.add('dragging'); 
    });
    uploadZone.addEventListener('dragleave', e => {
        if (!uploadZone.contains(e.relatedTarget)) uploadZone.classList.remove('dragging');
    });
    uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        uploadZone.classList.remove('dragging');
        
        // Only process if no file is currently selected
        if (filePreview && filePreview.hidden) {
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        }
    });

    // Remove file
    if (fileRemoveBtn) {
        fileRemoveBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't trigger the file picker
            fileInput.value = '';
            if (filePreview) filePreview.hidden = true;
            if (uploadIdle) uploadIdle.hidden = false;
        });
    }
}

/**
 * Handle a chosen / dropped file — validate, then show preview.
 */
function handleFile(file) {
    const ALLOWED = ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'];
    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['pdf', 'doc', 'docx', 'txt'];

    if (!allowedExts.includes(ext)) {
        alert(`Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.`);
        return;
    }

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
        alert(`File too large. Maximum size is ${MAX_MB} MB.`);
        return;
    }

    // Show preview
    filePreviewName.textContent = file.name;
    filePreviewSize.textContent = formatBytes(file.size);

    // Icon colour by type
    filePreviewIcon.className = 'file-preview-icon';
    filePreviewIcon.querySelector('i').className = 'ri-file-2-line';

    if (ext === 'pdf') {
        filePreviewIcon.classList.add('pdf');
        filePreviewIcon.querySelector('i').className = 'ri-file-pdf-2-line';
    } else if (ext === 'doc' || ext === 'docx') {
        filePreviewIcon.classList.add('doc');
        filePreviewIcon.querySelector('i').className = 'ri-file-word-line';
    } else {
        filePreviewIcon.classList.add('txt');
        filePreviewIcon.querySelector('i').className = 'ri-file-text-line';
    }

    filePreview.hidden = false;
    uploadIdle.hidden = true; // hide idle content, show preview inside same box
}

function formatBytes(bytes) {
    if (bytes < 1024)        return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ══════════════════════════════════════════════
   YOUTUBE PANEL
══════════════════════════════════════════════ */
const ytUrlInput = document.getElementById('yt-url-input');
const ytPasteBtn = document.getElementById('yt-paste-btn');

// Paste button → clipboard API
if (ytPasteBtn) {
    ytPasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            ytUrlInput.value = text;
            ytUrlInput.focus();
            // Briefly flash the input to confirm paste
            ytUrlInput.animate(
                [{ background: 'rgba(239,68,68,0.12)' }, { background: 'transparent' }],
                { duration: 600, easing: 'ease-out' }
            );
        } catch {
            // Clipboard permission denied — just focus the input
            ytUrlInput.focus();
        }
    });
}

/* ══════════════════════════════════════════════
   Custom Drop-Up Component
══════════════════════════════════════════════ */
function initDropup(dropupEl) {
    const trigger = dropupEl.querySelector('.dropup-trigger');
    const menu    = dropupEl.querySelector('.dropup-menu');
    const items   = dropupEl.querySelectorAll('.dropup-item');
    const valueEl = dropupEl.querySelector('.dropup-value');
    const hidden  = dropupEl.querySelector('input[type="hidden"]');

    trigger.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = dropupEl.getAttribute('aria-expanded') === 'true';
        closeAllDropups();
        if (!isOpen) openDropup(dropupEl);
    });

    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => { i.classList.remove('active'); i.removeAttribute('aria-selected'); });
            item.classList.add('active');
            item.setAttribute('aria-selected', 'true');
            valueEl.textContent = item.textContent.trim();
            hidden.value        = item.dataset.value;
            closeDropup(dropupEl);
        });
        item.setAttribute('tabindex', '-1');
    });

    trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger.click(); }
        if (e.key === 'Escape') closeDropup(dropupEl);
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            openDropup(dropupEl);
            const activeIdx = [...items].findIndex(i => i.classList.contains('active'));
            const nextIdx   = e.key === 'ArrowUp' ? Math.max(activeIdx - 1, 0) : Math.min(activeIdx + 1, items.length - 1);
            items[nextIdx].focus();
        }
    });

    menu.addEventListener('keydown', e => {
        const focused = document.activeElement;
        const list    = [...items];
        const idx     = list.indexOf(focused);
        if (e.key === 'ArrowUp')   { e.preventDefault(); list[Math.max(idx - 1, 0)].focus(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); list[Math.min(idx + 1, list.length - 1)].focus(); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focused.click(); }
        if (e.key === 'Escape') { closeDropup(dropupEl); trigger.focus(); }
        if (e.key === 'Tab')    closeDropup(dropupEl);
    });
}

function openDropup(el)  { el.setAttribute('aria-expanded', 'true'); }
function closeDropup(el) { el.setAttribute('aria-expanded', 'false'); }
function closeAllDropups() {
    document.querySelectorAll('.dropup[aria-expanded="true"]').forEach(closeDropup);
}

document.addEventListener('click', closeAllDropups);
document.querySelectorAll('.dropup').forEach(initDropup);

function getDropupValue(dropupId) {
    const el = document.getElementById(dropupId);
    return el ? el.querySelector('input[type="hidden"]').value : null;
}

/* ── Generate Button ───────────────────────── */
const generateBtn = document.getElementById('generate-btn');

generateBtn.addEventListener('click', async () => {
    if (generateBtn.classList.contains('loading')) return;

    // Determine active panel and validate input
    const activeBtn  = document.querySelector('.source-btn.active');
    const activeType = activeBtn?.dataset.type ?? 'text';
    let valid = false;

    if (activeType === 'text') {
        valid = textarea.value.trim().length > 0;
        if (!valid) { shakeElement(textarea.closest('.textarea-wrapper')); textarea.focus(); }
    } else if (activeType === 'file') {
        valid = fileInput.files.length > 0;
        if (!valid) shakeElement(uploadZone);
    } else if (activeType === 'youtube') {
        valid = ytUrlInput.value.trim().length > 0;
        if (!valid) { shakeElement(ytUrlInput.closest('.yt-input-row')); ytUrlInput.focus(); }
    }

    if (!valid) return;

    const difficulty = getDropupValue('dropup-difficulty');
    const questions  = getDropupValue('dropup-questions');
    const model      = getDropupValue('dropup-model');
    console.log('Generating quiz:', { type: activeType, difficulty, questions, model });

    generateBtn.classList.add('loading');
    generateBtn.disabled = true;

    try {
        await simulateAPICall();
    } catch (err) {
        console.error('Quiz generation failed:', err);
    } finally {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
    }
});

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

function simulateAPICall() {
    return new Promise(resolve => setTimeout(resolve, 2200));
}
