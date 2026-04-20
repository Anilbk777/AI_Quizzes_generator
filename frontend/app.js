/* ── Imports ────────────────────────────────── */
import { buildFormData, generateQuiz } from './api.js';

/* ── Source-type Tab Switching ─────────────── */

const sourceButtons = document.querySelectorAll('.source-btn');
const PANELS = {
    topic:    document.getElementById('panel-text'),
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
        showToast(`Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.`, 'error');
        return;
    }


    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
        showToast(`File too large. Maximum size is ${MAX_MB} MB.`, 'error');
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
            showToast("Clipboard access denied. Please paste manually.", "warning");
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
    const activeType = activeBtn?.dataset.type ?? 'topic';
    let valid = false;

    if (activeType === 'topic') {
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
        const formData = buildFormData();
        
        // Capture context title for the PDF
        let quizTitle = "AI Generated Quiz";
        if (activeType === 'topic') {
            const rawTopic = textarea.value.trim();
            // Take first line or first 60 chars
            quizTitle = rawTopic.split('\n')[0];
            if (quizTitle.length > 60) {
                quizTitle = quizTitle.substring(0, 57) + "...";
            }
        } else if (activeType === 'file') {
            quizTitle = fileInput.files[0].name;
        } else if (activeType === 'youtube') {
            quizTitle = "YouTube Video Quiz";
        }


        const response = await generateQuiz(formData);
        console.log('Quiz generated successfully:', response);
        
        if (response.success && response.data.questions) {
            initQuizPlayer(response.data.questions, quizTitle);
        } else {
            throw new Error("Invalid response format from server.");
        }
    } catch (err) {

        console.error('Quiz generation failed:', err);
        showToast(err.message || "An error occurred while generating the quiz.", "error");
    } finally {

        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
    }
});

/* ══════════════════════════════════════════════
   QUIZ PLAYER LOGIC
   ══════════════════════════════════════════════ */

let quizState = {
    questions: [],
    currentIdx: 0,
    userAnswers: {}, // index -> selectedKey
    isFinished: false,
    quizTitle: "Quiz"
};


const MODAL = {
    overlay:        document.getElementById('quiz-modal-overlay'),
    card:           document.getElementById('quiz-modal'),
    progressText:   document.getElementById('quiz-progress-text'),
    progressFill:   document.getElementById('quiz-progress-fill'),
    questionText:   document.getElementById('quiz-question-text'),
    optionsGrid:    document.getElementById('quiz-options'),
    explanationBox: document.getElementById('quiz-explanation-box'),
    explanationText:document.getElementById('quiz-explanation-text'),
    explanationIcon:document.getElementById('explanation-icon'),
    prevBtn:        document.getElementById('prev-question-btn'),
    nextBtn:        document.getElementById('next-question-btn'),
    closeBtn:       document.getElementById('close-quiz-btn'),
    downloadBtn:    document.getElementById('download-quiz-btn'),
    resultView:     document.getElementById('quiz-result-view'),
    finalScore:     document.getElementById('quiz-final-score'),
    closeResultsBtn:document.getElementById('close-results-btn'),
    downloadResultsBtn: document.getElementById('download-results-btn'),
};

function initQuizPlayer(questions, title) {
    quizState = {
        questions: questions,
        currentIdx: 0,
        userAnswers: {},
        isFinished: false,
        quizTitle: title || "Quiz"
    };


    // Reset UI
    MODAL.resultView.hidden = true;
    MODAL.explanationBox.hidden = true;
    MODAL.overlay.hidden = false;
    MODAL.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Stop scrolling

    renderQuestion();
}

function renderQuestion() {
    const { questions, currentIdx, userAnswers } = quizState;
    const q = questions[currentIdx];
    const total = questions.length;

    // Update Progress
    MODAL.progressText.textContent = `Question ${currentIdx + 1} of ${total}`;
    MODAL.progressFill.style.width = `${((currentIdx + 1) / total) * 100}%`;

    // Update Question
    MODAL.questionText.textContent = q.question;

    // Render Options
    MODAL.optionsGrid.innerHTML = '';
    const previousSelection = userAnswers[currentIdx];

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if (previousSelection) btn.classList.add('disabled');
        
        btn.innerHTML = `
            <span class="option-key">${opt.key}</span>
            <span class="option-text">${opt.text}</span>
        `;

        // Logic for showing state if already answered
        if (previousSelection) {
            if (opt.key === q.correct_option) {
                btn.classList.add('correct');
            } else if (opt.key === previousSelection) {
                btn.classList.add('incorrect');
            }
        } else {
            btn.addEventListener('click', () => handleSelection(opt.key));
        }

        MODAL.optionsGrid.appendChild(btn);
    });

    // Handle Explanation
    if (previousSelection) {
        showExplanation(q.explanation, previousSelection === q.correct_option);
    } else {
        MODAL.explanationBox.hidden = true;
    }

    // Nav Buttons
    MODAL.prevBtn.disabled = currentIdx === 0;
    
    if (currentIdx === total - 1) {
        MODAL.nextBtn.querySelector('span').textContent = 'Finish Quiz';
        MODAL.nextBtn.querySelector('i').className = 'ri-check-double-line';
    } else {
        MODAL.nextBtn.querySelector('span').textContent = 'Next Question';
        MODAL.nextBtn.querySelector('i').className = 'ri-arrow-right-s-line';
    }

    // Only enable Next if question is answered
    MODAL.nextBtn.disabled = !previousSelection;
}

function handleSelection(selectedKey) {
    const { questions, currentIdx } = quizState;
    const q = questions[currentIdx];

    quizState.userAnswers[currentIdx] = selectedKey;

    // Visual feedback
    const btns = MODAL.optionsGrid.querySelectorAll('.option-btn');
    btns.forEach((btn, idx) => {
        const key = q.options[idx].key;
        btn.classList.add('disabled');
        
        if (key === q.correct_option) {
            btn.classList.add('correct');
        } else if (key === selectedKey) {
            btn.classList.add('incorrect');
        }
    });

    showExplanation(q.explanation, selectedKey === q.correct_option);
    MODAL.nextBtn.disabled = false;
}

function showExplanation(text, isCorrect) {
    MODAL.explanationText.textContent = text;
    MODAL.explanationBox.hidden = false;
    
    if (isCorrect) {
        MODAL.explanationIcon.className = 'ri-checkbox-circle-line';
        MODAL.explanationIcon.style.color = '#34d399';
    } else {
        MODAL.explanationIcon.className = 'ri-error-warning-line';
        MODAL.explanationIcon.style.color = '#f87171';
    }
}

function calculateScore() {
    let score = 0;
    quizState.questions.forEach((q, idx) => {
        if (quizState.userAnswers[idx] === q.correct_option) score++;
    });
    return score;
}

function showResults() {
    const score = calculateScore();
    const total = quizState.questions.length;
    
    MODAL.finalScore.textContent = `${score} / ${total}`;
    MODAL.resultView.hidden = false;
    MODAL.isFinished = true;
}

function closeQuiz() {
    MODAL.overlay.hidden = true;
    MODAL.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function downloadQuiz() {
    const { questions, quizTitle } = quizState;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - (margin * 2);
    let y = margin;

    // Helper to add footer
    const addFooter = (doc, pageNum) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150);
        doc.text("Generated by AI Quiz Generator", margin, pageHeight - 10);
        doc.text(`Page ${pageNum}`, pageWidth - margin - 15, pageHeight - 10);
    };

    // Helper to check for page breaks
    const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > pageHeight - 25) {
            addFooter(doc, doc.internal.getNumberOfPages());
            doc.addPage();
            y = margin;
            return true;
        }
        return false;
    };

    // --- Title ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(67, 56, 202); // Primary matching color (violet)
    const titleText = doc.splitTextToSize(`Quiz: ${quizTitle}`, usableWidth);
    doc.text(titleText, margin, y);
    y += (titleText.length * 10) + 10;

    questions.forEach((q, i) => {
        // --- Question Heading ---
        checkPageBreak(20);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(31, 41, 55); // Gray-800
        const qText = doc.splitTextToSize(`Q${i + 1}: ${q.question}`, usableWidth);
        doc.text(qText, margin, y);
        y += (qText.length * 7) + 5;

        // --- Options ---
        q.options.forEach(opt => {
            const isCorrect = opt.key === q.correct_option;
            const text = `${opt.key}. ${opt.text}${isCorrect ? " (Correct Answer)" : ""}`;
            
            checkPageBreak(10);
            doc.setFontSize(11);
            if (isCorrect) {
                doc.setFont("helvetica", "bold");
                doc.setTextColor(16, 185, 129); // Emerald-500
            } else {
                doc.setFont("helvetica", "normal");
                doc.setTextColor(75, 85, 99); // Gray-600
            }
            
            const optLines = doc.splitTextToSize(text, usableWidth - 5);
            doc.text(optLines, margin + 5, y);
            y += (optLines.length * 6) + 2;
        });

        // --- Explanation ---
        y += 3;
        const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, usableWidth);
        checkPageBreak(expLines.length * 6 + 10);
        
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // Gray-500
        doc.text(expLines, margin, y);
        y += (expLines.length * 6) + 15;
    });

    // Final Footer
    addFooter(doc, doc.internal.getNumberOfPages());

    doc.save(`Quiz_${quizTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}


// ── Event Listeners ──

MODAL.closeBtn.addEventListener('click', closeQuiz);
MODAL.closeResultsBtn.addEventListener('click', closeQuiz);
MODAL.downloadResultsBtn.addEventListener('click', downloadQuiz);
MODAL.downloadBtn.addEventListener('click', downloadQuiz);

MODAL.prevBtn.addEventListener('click', () => {
    if (quizState.currentIdx > 0) {
        quizState.currentIdx--;
        renderQuestion();
    }
});

MODAL.nextBtn.addEventListener('click', () => {
    if (quizState.currentIdx < quizState.questions.length - 1) {
        quizState.currentIdx++;
        renderQuestion();
    } else {
        showResults();
    }
});

/**
 * Display a toast notification
 * @param {string} message - The message to display
 * @param {'success' | 'error' | 'warning' | 'info'} type - The type of toast
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon mapping based on type
    const iconMap = {
        success: 'ri-checkbox-circle-line',
        error: 'ri-error-warning-line',
        warning: 'ri-alert-line',
        info: 'ri-information-line'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${iconMap[type] || iconMap.info}"></i>
        </div>
        <div class="toast-content">
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" aria-label="Close notification">
            <i class="ri-close-line"></i>
        </button>
    `;

    container.appendChild(toast);

    // Trigger entering animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto-remove after 5 seconds
    const timeout = setTimeout(() => hideToast(toast), 5000);

    // Close button logic
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timeout);
        hideToast(toast);
    });
}

/**
 * Remove a toast with animation
 * @param {HTMLElement} toast 
 */
function hideToast(toast) {
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    // Wait for animation to finish before removing from DOM
    toast.addEventListener('transitionend', () => {
        toast.remove();
    }, { once: true });
    
    // Fallback if transitionend doesn't fire
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 400);
}

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
