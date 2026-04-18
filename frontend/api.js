const sourceButtons = document.querySelectorAll('.source-btn');

// Map button data-type → panel id
const PANELS = {
    text:    document.getElementById('panel-text'),
    file:    document.getElementById('panel-file'),
    youtube: document.getElementById('panel-youtube'),
};
let currentInputType = 'text';

sourceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;

        // Button active state
        sourceButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentInputType = type;
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

function getCurrentInputType() {
    return currentInputType;
}
 function getDifficulty(){
    const difficulty  = document.querySelector("#dropup-difficulty input").value;
    return difficulty;
 }

 function getNumberOfQuestions(){
    const numberOfQuestions = document.querySelector("#dropup-questions input").value;
    return numberOfQuestions;
 }

 function getModel(){
    const model = document.querySelector("#dropup-model input").value;
    return model;
 }

 

