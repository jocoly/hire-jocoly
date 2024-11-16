
/*
*
*
*       CONFIG
*
*
* */

const config = {
        BACKEND_ADDRESS: "https://major-vocal-vervet.ngrok-free.app",
        PORT: "5000",

        RANDOM_PROMPT_ARRAY: [
            "A baby elephant in a flower garden, wearing a crown of daisies",
            "A whimsical owl perched on a crescent moon, stars twinkling around",
            "A playful puppy splashing in a puddle, wearing a raincoat and boots",
            "A chubby dragon blowing bubbles, surrounded by colorful flowers",
            "A tiny mouse riding a leaf boat down a stream, holding a little sail",
            "A curious fox peeking out from a magical forest, fireflies illuminating",
            "A penguin sliding down a snowy hill, wearing a cozy scarf",
            "A squirrel holding an umbrella, standing under a gentle rain shower",
            "A rabbit painting colorful eggs, surrounded by spring blooms",
            "A kitten napping in a hammock made of spider webs, in a fairy-tale garden",
        ],

        DEFAULT_MODEL: "StableDiffusion", // used in match function for generateImage function

        MODELS_ARRAY: [
            "Stable Diffusion 2 (base)",
            "Realistic Vision 2.0",
            "Openjourney",
            "DreamShaper",
            "Dreamlike-Photoreal 2.0",
            "Vox 2",
        ],

        PIPELINES_ARRAY: [
            "StableDiffusion",
            "RealisticVision",
            "Openjourney",
            "DreamShaper",
            "DreamlikePhotoreal",
            "vox2",
        ]

}

// scroll to the top of the page on refresh
window.onbeforeunload = function () {
    window.scrollTo(0,0);
}

window.onload = function() {
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    if (vw < 1000) {
        if (vw < 450) {
            document.getElementById("subtitle").style.display="none";
        }
        navBar.classList.add('navbarWhite');
        randomSubmit.style.display="none";
    } else {
        slideInRandomButton();
    }
}

/*
*
*
*       NAVBAR
*
*
* */

// navbar is initially transparent on desktop displays
// initially completely hidden on mobile displays
// after scrolling, the nav bar turns opaque (for both mobile and desktop)
const navBar = document.querySelector('.navbar');
const randomSubmit = document.getElementById('randomSubmit');
window.onscroll = async function () {
    const top = window.scrollY;
    if (top >= 100) {
        navBar.classList.add('navbarLight');
        navBar.classList.remove('navbarWhite');
    } else if (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 1000) { //checks for mobile viewport width (vw <1000)
        navBar.classList.add('navbarWhite');
    } else {
        navBar.classList.remove('navbarLight');
    }
}

// collapse navbar on mobile
const navLinks = document.querySelectorAll('.nav-item')
const menuToggle = document.getElementById('navbarSupportedContent')
navLinks.forEach((l) => {
    l.addEventListener('click', () => { new bootstrap.Collapse(menuToggle).toggle() })
})

// typewriter animation on the navbar brand name
window.addEventListener('load', async function() {
    await writeLoop();
})
const myName = "Joseph Colin Lyell"
const typewriter = document.getElementById("typewriter");
let sleepTime = 100;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function writeLoop()  {
    for (let i=0; i< myName.length; i++) {
        typewriter.innerText = myName.substring(0, i+1);
        await sleep(sleepTime);
    }
}

/*
*
*
*       GALLERY
*
*
* */


// doubled the gallery to create a constant scroll effect. there's probably a better way to do this

const banner = document.getElementById("home");
const gallery = document.getElementById("gallery");
const img1 = document.getElementById("img1");
const img1Caption = document.getElementById("img1-caption");
const img2 = document.getElementById("img2");
const img2Caption = document.getElementById("img2-caption");
const img3 = document.getElementById("img3");
const img3Caption = document.getElementById("img3-caption");
const img4 = document.getElementById("img4");
const img4Caption = document.getElementById("img4-caption");
const img5 = document.getElementById("img5");
const img5Caption = document.getElementById("img5-caption");
const img6 = document.getElementById("img6");
const img6Caption = document.getElementById("img6-caption");
const img7 = document.getElementById("img7");
const img7Caption = document.getElementById("img7-caption");
const img8 = document.getElementById("img8");
const img8Caption = document.getElementById("img8-caption");
const img9 = document.getElementById("img9");
const img9Caption = document.getElementById("img9-caption");
const img10 = document.getElementById("img10");
const img10Caption = document.getElementById("img10-caption");
const img11 = document.getElementById("img11");
const img11Caption = document.getElementById("img11-caption");
const img12 = document.getElementById("img12");
const img12Caption = document.getElementById("img12-caption");
const img13 = document.getElementById("img13");
const img13Caption = document.getElementById("img13-caption");
const img14 = document.getElementById("img14");
const img14Caption = document.getElementById("img14-caption");
const img15 = document.getElementById("img15");
const img15Caption = document.getElementById("img15-caption");
const img16 = document.getElementById("img16");
const img16Caption = document.getElementById("img16-caption");

img1.onmouseover = function () {
    img1Caption.style.display="block"
}
img1.onmouseleave = function () {
    img1Caption.style.display="none"
}
img2.onmouseover = function () {
    img2Caption.style.display="block"
}
img2.onmouseleave = function () {
    img2Caption.style.display="none"
}
img3.onmouseover = function () {
    img3Caption.style.display="block"
}
img3.onmouseleave = function () {
    img3Caption.style.display="none"
}
img4.onmouseover = function () {
    img4Caption.style.display="block"
}
img4.onmouseleave = function () {
    img4Caption.style.display="none"
}
img5.onmouseover = function () {
    img5Caption.style.display="block"
}
img5.onmouseleave = function () {
    img5Caption.style.display="none"
}
img6.onmouseover = function () {
    img6Caption.style.display="block"
}
img6.onmouseleave = function () {
    img6Caption.style.display="none"
}
img7.onmouseover = function () {
    img7Caption.style.display="block"
}
img7.onmouseleave = function () {
    img7Caption.style.display="none"
}
img8.onmouseover = function () {
    img8Caption.style.display="block"
}
img8.onmouseleave = function () {
    img8Caption.style.display="none"
}
img9.onmouseover = function () {
    img9Caption.style.display="block"
}
img9.onmouseleave = function () {
    img9Caption.style.display="none"
}
img10.onmouseover = function () {
    img10Caption.style.display="block"
}
img10.onmouseleave = function () {
    img10Caption.style.display="none"
}
img11.onmouseover = function () {
    img11Caption.style.display="block"
}
img11.onmouseleave = function () {
    img11Caption.style.display="none"
}
img12.onmouseover = function () {
    img12Caption.style.display="block"
}
img12.onmouseleave = function () {
    img12Caption.style.display="none"
}
img13.onmouseover = function () {
    img13Caption.style.display="block"
}
img13.onmouseleave = function () {
    img13Caption.style.display="none"
}
img14.onmouseover = function () {
    img14Caption.style.display="block"
}
img14.onmouseleave = function () {
    img14Caption.style.display="none"
}
img15.onmouseover = function () {
    img15Caption.style.display="block"
}
img15.onmouseleave = function () {
    img15Caption.style.display="none"
}
img16.onmouseover = function () {
    img16Caption.style.display="block"
}
img16.onmouseleave = function () {
    img16Caption.style.display="none"
}

/*
*
*
*       PROMPT FORM/IMAGE GENERATION
*
*
* */

// image generation section (slides the rest of the page down when it loads)
const promptSubmit = document.getElementById('promptSubmit');
let submitButtonText = document.getElementById('buttonText');
const submitSpinner = document.getElementById('submitSpinner');
const loadingIcon = document.getElementById('loadingIcon');
const generatedImageContainer = document.getElementById('generatedImageContainer');
let model = config.DEFAULT_MODEL;

promptSubmit.onclick = async function () {
    let prompt = document.getElementById('promptInput').value;
    if (prompt === "") {
        prompt = document.getElementById('promptInput').placeholder;
        if (prompt === "Type a prompt to generate an image") {
            invalidPrompt();
        } else {
            await buttonsLoadingActions(prompt);
        }
    } else if (prompt.length>75) {
        invalidPrompt();
    } else {
        await buttonsLoadingActions(prompt);
    }

}

function invalidPrompt() {
    promptSubmit.style.animation = "kf_shake 0.4s 1 linear";
    promptSubmit.style.boxShadow = "0 0 0.6rem #ff0000";
    promptSubmit.style.backgroundColor = "red";
    promptSubmit.style.borderColor = "red";
    promptSubmit.addEventListener('animationend', function() {
        promptSubmit.style.animation=null;
        promptSubmit.style.boxShadow="none";
        promptSubmit.style.backgroundColor="#0d6efd";
        promptSubmit.style.borderColor="#0d6efd"
    }, { once: true });
}

randomSubmit.onclick = async function () {
    let prompt = config.RANDOM_PROMPT_ARRAY[Math.floor(Math.random()*config.RANDOM_PROMPT_ARRAY.length)];
    promptSubmit.disabled = true;
    randomSubmit.disabled = true;
    await typePromptAnimation(document.getElementById('promptInput'), prompt);
    await buttonsLoadingActions(prompt);
}

async function buttonsLoadingActions(prompt) {
    submitButtonText.textContent = 'Generating...';
    submitButtonText.style.marginLeft = '20px';
    submitSpinner.style.display = 'inline-block';
    promptSubmit.disabled = true;
    randomSubmit.disabled = true;
    try {
        await generateImage(prompt, model);
    } catch (error) {
        console.error(error);
    } finally {
        submitButtonText.style.marginLeft = '0';
        submitButtonText.textContent = "Submit";
        submitSpinner.style.display = "none";
        promptSubmit.disabled = false;
        randomSubmit.disabled = false;
    }
}

async function typePromptAnimation(inputElement, prompt) {
    inputElement.value = "";
    for (let i=0; i < prompt.length; i++) {
        inputElement.placeholder = prompt.substring(0, i+1);
        await sleep(sleepTime);
    }
}

const promptSelect = document.getElementById('dropdownMenu1');

// model vs pipeline is just changing the formatting from what the web form displays (model) to what the code uses (pipeline)
function selectModel(modelButton) {
    promptSelect.innerHTML = modelButton.innerHTML;
    switch (modelButton.innerHTML) {
        case config.MODELS_ARRAY[0]:
            model = config.PIPELINES_ARRAY[0];
            break;
        case config.MODELS_ARRAY[1]:
            model = config.PIPELINES_ARRAY[1];
            break;
        case config.MODELS_ARRAY[2]:
            model = config.PIPELINES_ARRAY[2];
            break;
        case config.MODELS_ARRAY[3]:
            model = config.PIPELINES_ARRAY[3];
            break;
        case config.MODELS_ARRAY[4]:
            model = config.PIPELINES_ARRAY[4];
            break;
        case config.MODELS_ARRAY[5]:
            model = config.PIPELINES_ARRAY[5];
            break;
        case 'Random':
            model = config.PIPELINES_ARRAY[Math.floor(Math.random()*config.PIPELINES_ARRAY.length)];
            promptSelect.innerHTML = model;
            break;
        default:
            model = config.PIPELINES_ARRAY[0];
            break;
    }
}

function adjustBannerHeight() {
    banner.style.minHeight = "1742px";
}
function repositionGallery() {
    gallery.style.top = "1012px";
}

function slideInRandomButton(){
    setTimeout(function(){
        randomSubmit.style.display="block";
        randomSubmit.style.animationName="slidein";
        randomSubmit.style.animationDuration="3s";
    }, 3000); // 3 seconds after page load
}

// calling the 'callBackendPipeline' function to send the prompt to the server and return an image url
const requestTimeoutSeconds = 600000
async function generateImage(prompt, pipeline) {
    try {
        let numImages = 1;
        let imgUrl = "";
        let generatedImage = document.getElementById('generatedImage');
        let generatedImageUrl;
        try {
            adjustBannerHeight();
            repositionGallery();
            generatedImageContainer.style.display = 'block';
            loadingIcon.style.display="block";
            generatedImage.style.display="none";
            const results = await callBackendPipeline(prompt, pipeline, numImages, imgUrl);
            if (results && results.length > 0) {
                generatedImageUrl = results[0];
            } else {
                new Error ("No image URL returned from the backend. ");
                console.log("Error: No image URL returned from the backend " + Error);
            }
        } catch (error) {
            console.log("Error getting results from the backend: " + error);
        }
        generatedImage.src = generatedImageUrl;
        generatedImage.style.display="block"
        loadingIcon.style.display="none";
    } catch (error) {
        console.error("Error generating image:", error);
    }
}

/*
*
*
*       API
*
*
* */

async function callBackendPipeline(prompt, pipeline, numImages, imgUrl) {
    const start_time = new Date();
    const backendUrl = config.BACKEND_ADDRESS;
    const response = await Promise.race([
        fetch(backendUrl + "/process", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                pipeline,
                numImages,
                imgUrl,
            })
        }).then((response) => {
            if (!response.ok) {
                console.log("Error: " + response.statusText);
            }
            return response;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), requestTimeoutSeconds))
    ]);
    const results = [];
    const jsonResponse = await response.json();
    for (const file of jsonResponse.generation) {
        results.push(file);
    }
    const end_time = new Date();
    console.log(`Query took ${end_time - start_time} ms`);
    return results;
}