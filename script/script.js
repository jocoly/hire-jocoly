
/*
*
*
*       CONFIG
*
*
* */

const config = {
    BACKEND_ADDRESS:"https://major-vocal-vervet.ngrok-free.app",
    PORT:"5000",

    STABLE_DIFFUSION:"true",

    SD_IMAGE_INFERENCE_STEPS:"50",
    SD_IMAGE_GUIDANCE_SCALE:"7.5",
    SD_IMAGE_WIDTH:"512",
    SD_IMAGE_HEIGHT:"512",

    NEGATIVE_PROMPT:"blurry, watermark, gross, disgusting, text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck",

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
}

// scroll to the top of the page on refresh
window.onbeforeunload = function () {
    window.scrollTo(0,0);
}

/*
*
*
*       NAVBAR
*
*
* */

// check viewport width; for mobile or <1000 px width; don't load the header until the page is scrolled
window.onload = function() {
    adjustNavBarVisibility()
}

// navbar is initially transparent on desktop displays
// initially completely hidden on mobile displays
// after scrolling, the nav bar turns opaque (for both mobile and desktop)
const navBar = document.querySelector('.navbar');
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

function adjustNavBarVisibility() {
    let navBar = document.querySelector('.navbar');
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    if (vw < 1000) {
        navBar.classList.add('navbarWhite');
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
    img1Caption.style.display="block"
}
img8.onmouseleave = function () {
    img1Caption.style.display="none"
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
const randomSubmit = document.getElementById('randomSubmit');
let loadingIcon = document.getElementById('loadingIcon');
const generatedImageContainer = document.getElementById('generatedImageContainer');
let model = config.DEFAULT_MODEL;

promptSubmit.onclick = async function () {
    let prompt = document.getElementById('promptInput').value;
    await generateImage(prompt, model);
}

randomSubmit.onclick = async function () {
    let prompt = config.RANDOM_PROMPT_ARRAY[Math.floor(Math.random()*config.RANDOM_PROMPT_ARRAY.length)];
    await generateImage(prompt, model);
}

const promptSelect = document.getElementById('dropdownMenu1');

function selectModel(item) {
    promptSelect.innerHTML = item.innerHTML;
    switch (item.innerHTML) {
        case 'Stable Diffusion 2 (base)':
            model = "StableDiffusion";
            break;
        case 'Modelscope Text-to-Video':
            model = "TextToVideo";
            break;
        default:
            break;
    }
}

function adjustBannerHeight() {
    banner.style.minHeight = "1742px";
}
function repositionGallery() {
    gallery.style.top = "1012px";
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