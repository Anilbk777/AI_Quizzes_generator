const sourceButtons = document.querySelectorAll('.source-btn');

// Map button data-type → panel id
const PANELS = {
    topic:    document.getElementById('panel-text'),
    file:    document.getElementById('panel-file'),
    youtube: document.getElementById('panel-youtube'),
};
let currentInputType = 'topic';

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

 function buildFormData(){
    const formData = new FormData();

    formData.append("input_type", getCurrentInputType());
    formData.append("difficulty", getDifficulty());
    formData.append("num_questions", getNumberOfQuestions());
    formData.append("provider_name", getModel());

    if(getCurrentInputType() === "topic"){
        const topic = document.getElementById("topic-input").value.trim();
        if (!topic) {
            throw new Error("Please enter a topic.");
        }
        formData.append("topic", topic);
    }
    else if(getCurrentInputType() === "file"){
        const fileInput = document.getElementById("file-input");
        if (!fileInput.files.length) {
            throw new Error("Please select a file to upload.");
        }
        const file = fileInput.files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            throw new Error("File size exceeds 10MB limit.");
        }
        formData.append("file", file);
    }
    else if(getCurrentInputType() === "youtube"){
        const youtubeUrl = document.getElementById("yt-url-input").value.trim();
        if (!youtubeUrl) {
            throw new Error("Please enter a YouTube URL.");
        }
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(&.*)?$/;
        if (!youtubeRegex.test(youtubeUrl)) {
            throw new Error("Please enter a valid YouTube URL.");
        }
        formData.append("youtube_url", youtubeUrl);
    }

    return formData;
 }

 async function generateQuiz(formData){
    try {
        const response = await fetch("http://127.0.0.1:8000/api/mcq/generate", {
            method: "POST",
            body: formData,
        }); 
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        return data;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
 }

 async function handleGenerateQuiz(){
    try {
        const formData = buildFormData();
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }
        const data = await generateQuiz(formData);
        console.log(data);
    } catch (error) {
        console.error("Error generating quiz:", error);
    }
 }

 document.getElementById("generate-btn").addEventListener("click", handleGenerateQuiz);

