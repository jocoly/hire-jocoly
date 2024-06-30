const config = {
    OUTPUT_DIR:"./output/",
    BACKEND_ADDRESS:"74.134.135.85",
    PORT:"5000",

    STABLE_DIFFUSION:"true",

    SD_IMAGE_INFERENCE_STEPS:"50",
    SD_IMAGE_GUIDANCE_SCALE:"7.5",
    SD_IMAGE_WIDTH:"512",
    SD_IMAGE_HEIGHT:"512",

    NEGATIVE_PROMPT:"blurry, watermark, gross, disgusting, text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck"
}

// add class navbarDark on navbar scroll
const header = document.querySelector('.navbar');
console.log(header)
window.onscroll = function() {
    const top = window.scrollY;
    if(top >=100) {
        header.classList.add('navbarLight');
    }
    else {
        header.classList.remove('navbarLight');
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

promptSubmit.onclick = async function () {
    let prompt = document.getElementById('promptInput').value;
    await generateImage(prompt);
}

randomSubmit.onclick = async function() {
    let gptPrompt = "You will now act as a prompt generator. I will describe an image or a topic to you, and you will create a prompt that could be used for image-generation. If I input nothing, pick your own topic. The image I want to generate is: "
    let prompt = document.getElementById('promptInput').value;
    gptPrompt = gptPrompt + prompt;
    let generatedPrompt = await getGPTResponse(gptPrompt);
    await generateImage(generatedPrompt);
}

async function generateImage(prompt) {
    try {
        let pipeline = "StableDiffusion"
        let numImages = 1;
        let imgUrl = "";
        let generatedImageUrl;
        try {
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

        let generatedImageContainer = document.getElementById('generatedImageContainer');
        let generatedImage = document.getElementById('generatedImage');
        generatedImageUrl = generatedImageUrl.slice(1);
        generatedImageUrl = "./server/" + generatedImageUrl;
        generatedImage.src = generatedImageUrl;
        generatedImage.onload = function () {
            adjustBannerHeight();
            repositionGallery();
            generatedImageContainer.style.display = 'block';
        }
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
    const backendUrl = config.BACKEND_ADDRESS + ":" + config.PORT;
    const response = await Promise.race([
        fetch("http://" + backendUrl + "/process", {
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