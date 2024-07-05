// config goes here
// will convert this to a module at some point and put it in a .config file

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
    ]
}

// scroll to the top of the page on refresh
window.onbeforeunload = function () {
    window.scrollTo(0,0);
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

// typewriter animation on the navbar brand name
window.addEventListener('load', async function() {
    await writeLoop();
})

// check viewport width; for mobile or <1000 px width; don't load the header until the page is scrolled
window.onload = function() {
    adjustNavBarVisibility()
}

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
function adjustNavBarVisibility() {
    let navBar = document.querySelector('.navbar');
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    if (vw < 1000) {
        navBar.classList.add('navbarWhite');
    }
}

// collapse navbar after click on small devices
const navLinks = document.querySelectorAll('.nav-item')
const menuToggle = document.getElementById('navbarSupportedContent')

// navbar collapse hamburger menu
navLinks.forEach((l) => {
    l.addEventListener('click', () => { new bootstrap.Collapse(menuToggle).toggle() })
})

// gallery scroll buttons
const buttonRight = document.getElementById('slideRight');
const buttonLeft = document.getElementById('slideLeft');

buttonRight.onclick = function () {
    document.getElementById('gallery').scrollLeft += 532;
}

buttonLeft.onclick = function () {
    document.getElementById('gallery').scrollLeft -= 532;
}

// image generation section (slides the rest of the page down when it loads)
const promptSubmit = document.getElementById('promptSubmit');
const randomSubmit = document.getElementById('randomSubmit');
let loadingIcon = document.getElementById('loadingIcon');
let generatedImageContainer = document.getElementById('generatedImageContainer');

promptSubmit.onclick = async function () {
    let prompt = document.getElementById('promptInput').value;
    await generateImage(prompt);
}

randomSubmit.onclick = async function () {
    let prompt = config.RANDOM_PROMPT_ARRAY[Math.floor(Math.random()*config.RANDOM_PROMPT_ARRAY.length)];
    await generateImage(prompt);
}
function adjustBannerHeight() {
    let banner = document.getElementById("home");
    banner.style.minHeight = "1742px";
}

const gallery = document.getElementById("gallery");
const slideLeft = document.getElementById("slideLeft");
const slideRight = document.getElementById("slideRight");
function repositionGallery() {
    gallery.style.top = "1012px";
    slideLeft.style.top = "1262px";
    slideRight.style.top = "1262px";
}


// calling the 'callBackendPipeline' function to send the prompt to the server and return an image url
const requestTimeoutSeconds = 600000
async function generateImage(prompt) {
    try {
        let pipeline = "StableDiffusion"
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