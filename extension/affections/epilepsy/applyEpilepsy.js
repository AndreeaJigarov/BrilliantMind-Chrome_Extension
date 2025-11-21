export function apply() {
    console.log("Epilepsy module activated");

    injectStyles();
    freezeAllGifs();
    stopAutoplayVideos();
}

/* ----------------------------------------
   Inject epilepsy CSS rules safely
---------------------------------------- */
function injectStyles() {
    fetch(chrome.runtime.getURL("affections/epilepsy/styles.css"))
        .then(r => r.text())
        .then(css => {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        })
        .catch(err => console.error("Failed to load epilepsy styles:", err));
}

/* ----------------------------------------
   Replace animated GIFs with a static frame
---------------------------------------- */
function freezeAllGifs() {
    const gifs = document.querySelectorAll("img[src$='.gif'], img[src*='.gif?']");
    gifs.forEach(img => {
        // Create a static image element using the same GIF source
        const staticImg = document.createElement("img");
        staticImg.src = img.src;
        staticImg.width = img.width;
        staticImg.height = img.height;

        img.replaceWith(staticImg);
    });
    console.log(`Frozen GIFs: ${gifs.length}`);
}

/* ----------------------------------------
   Stop autoplay videos and flashing content
---------------------------------------- */
function stopAutoplayVideos() {
    const videos = document.querySelectorAll("video");

    videos.forEach(video => {
        try {
            video.pause();
            video.autoplay = false;
            video.loop = false;
            video.controls = true;
        } catch (e) {
            console.warn("Video autoplay control failed:", e);
        }
    });

    console.log(`Stopped videos: ${videos.length}`);
}
