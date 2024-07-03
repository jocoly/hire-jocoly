const config = {
    BACKEND_ADDRESS:"https://major-vocal-vervet.ngrok-free.app",
    PORT:"5000",

    STABLE_DIFFUSION:"true",

    SD_IMAGE_INFERENCE_STEPS:"50",
    SD_IMAGE_GUIDANCE_SCALE:"7.5",
    SD_IMAGE_WIDTH:"512",
    SD_IMAGE_HEIGHT:"512",

    NEGATIVE_PROMPT:"blurry, watermark, gross, disgusting, text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck"
}

// add class navbarDark on navbar scroll
const navBar = document.querySelector('.navbar');
window.onscroll = async function () {
    const top = window.scrollY;
    if (top >= 100) {
        navBar.classList.add('navbarLight');
        navBar.classList.remove('navbarWhite');
    } else if (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 1000) {
        navBar.classList.add('navbarWhite');
    } else {
        navBar.classList.remove('navbarLight');
    }
}
window.addEventListener('load', async function() {
    await writeLoop();
})

window.onload = function() {
    adjustNavBarVisibility()
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const myName = "Joseph Colin Lyell"
const typewriter = document.getElementById("typewriter");
let sleepTime = 100;
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

navLinks.forEach((l) => {
    l.addEventListener('click', () => { new bootstrap.Collapse(menuToggle).toggle() })
})

const buttonRight = document.getElementById('slideRight');
const buttonLeft = document.getElementById('slideLeft');

buttonRight.onclick = function () {
    document.getElementById('gallery').scrollLeft += 532;
}

buttonLeft.onclick = function () {
    document.getElementById('gallery').scrollLeft -= 532;
}

const promptSubmit = document.getElementById('promptSubmit');
const randomSubmit = document.getElementById('randomSubmit');
let loadingIcon = document.getElementById('loadingIcon');
let generatedImageContainer = document.getElementById('generatedImageContainer');

promptSubmit.onclick = async function () {
    let prompt = document.getElementById('promptInput').value;
    await generateImage(prompt);
}


async function generateImage(prompt) {
    try {
        let pipeline = "StableDiffusion"
        let numImages = 1;
        let imgUrl = "";
        let loadingIcon = document.getElementById('loadingIcon');
        let generatedImageUrl;
        try {
            adjustBannerHeight();
            repositionGallery();
            generatedImageContainer.style.display = 'block';
            loadingIcon.style.display="block";
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
        let generatedImage = document.getElementById('generatedImage');
        generatedImage.src = generatedImageUrl;
        generatedImage.style.display="block"
        loadingIcon.style.display="none";
    } catch (error) {
        console.error("Error generating image:", error);
    }
}

function adjustBannerHeight() {
    let banner = document.getElementById("home");
    banner.style.minHeight = "1742px";
}

function repositionGallery() {
    let gallery = document.getElementById("gallery");
    let slideLeft = document.getElementById("slideLeft");
    let slideRight = document.getElementById("slideRight");
    gallery.style.top = "1012px";
    slideLeft.style.top = "1262px";
    slideRight.style.top = "1262px";
}

const requestTimeoutSeconds = 600000

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