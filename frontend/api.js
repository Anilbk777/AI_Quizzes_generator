
export function getCurrentInputType() {
    const activeBtn = document.querySelector('.source-btn.active');
    return activeBtn ? activeBtn.dataset.type : 'topic';
}

export function getDifficulty(){
    const difficulty  = document.querySelector("#dropup-difficulty input").value;
    return difficulty;
}

export function getNumberOfQuestions(){
    const numberOfQuestions = document.querySelector("#dropup-questions input").value;
    return numberOfQuestions;
}

export function getModel(){
    const model = document.querySelector("#dropup-model input").value;
    return model;
}

export function buildFormData(){
    const formData = new FormData();
    const inputType = getCurrentInputType();

    formData.append("input_type", inputType);
    formData.append("difficulty", getDifficulty());
    formData.append("num_questions", getNumberOfQuestions());
    formData.append("provider_name", getModel());

    if(inputType === "topic"){
        const topic = document.getElementById("topic-input").value.trim();
        if (!topic) {
            throw new Error("Please enter a topic.");
        }
        formData.append("topic", topic);
    }
    else if(inputType === "file"){
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
    else if(inputType === "youtube"){
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

export async function generateQuiz(formData){
    try {
        const response = await fetch("http://127.0.0.1:8000/api/mcq/generate", {
            method: "POST",
            body: formData,
        }); 
        const data = await response.json();
        if (!response.ok) {
            // Backend often returns error in 'detail' or 'message'
            throw new Error(data.message || data.detail || "Failed to generate quiz");
        }
        return data;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
}

