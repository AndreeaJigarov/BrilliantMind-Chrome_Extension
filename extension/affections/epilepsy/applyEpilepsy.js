// ===============================
//    GIF PROTECTION — HOVER MODE
// ===============================

// 🔹 Extrage primul frame din GIF ca imagine statică
function getStaticFrame(img) {
    return new Promise(resolve => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.src = img.src;

        tempImg.onload = () => {
            canvas.width = tempImg.width;
            canvas.height = tempImg.height;

            try {
                ctx.drawImage(tempImg, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            } catch {
                resolve(null);
            }
        };

        tempImg.onerror = () => resolve(null);
    });
}


// 🔹 Găsește URL-ul REAL al GIF-ului
function findRealGifURL(img) {
    if (img.dataset.gif) return img.dataset.gif;
    if (img.dataset.src?.endsWith(".gif")) return img.dataset.src;
    if (img.dataset.original?.endsWith(".gif")) return img.dataset.original;
    if (img.dataset.preview?.endsWith(".gif")) return img.dataset.preview;

    // GIPHY fix: _s ==> full GIF
    if (img.src.includes("giphy.com/media") && img.src.includes("_s.")) {
        return img.src.replace("_s.", ".");
    }

    const picture = img.closest("picture");
    if (picture) {
        const source = picture.querySelector("source[srcset*='.gif'], source[type='image/gif']");
        if (source) {
            return source.srcset.split(" ")[0];
        }
    }

    return img.src;
}


// 🔹 Înlocuiește GIF-ul cu static + overlay + hover behavior
async function replaceGif(img) {
    if (img.dataset.gifReplaced === "true") return;
    img.dataset.gifReplaced = "true";

    const realGif = findRealGifURL(img);
    const staticSrc = await getStaticFrame(img);

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.cursor = "pointer";
    wrapper.dataset.epilepsyWrapper = "true";

    const staticImg = document.createElement("img");
    staticImg.src = staticSrc || img.src;
    staticImg.style.width = img.width + "px";
    staticImg.style.pointerEvents = "none";

    const overlay = document.createElement("div");
    overlay.innerText = "⚠ GIF – Hover pentru a porni";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.55)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.fontSize = "14px";
    overlay.style.textAlign = "center";
    overlay.style.pointerEvents = "none";

    wrapper.appendChild(staticImg);
    wrapper.appendChild(overlay);

    img.replaceWith(wrapper);

    let playing = false;

    // 🔥 Start GIF on hover
    wrapper.addEventListener("mouseenter", () => {
        if (!playing) {
            staticImg.src = realGif;
            overlay.innerText = "✋ GIF activ";
            overlay.style.background = "rgba(0,0,0,0.35)";
            playing = true;
        }
    });

    // 🔥 Stop GIF on mouse leave
    wrapper.addEventListener("mouseleave", () => {
        if (playing) {
            staticImg.src = staticSrc;
            overlay.innerText = "⚠ GIF – Hover pentru a porni";
            overlay.style.background = "rgba(0,0,0,0.55)";
            playing = false;
        }
    });

    // 🔥 Prevent link navigation if GIF is inside <a>
    wrapper.addEventListener("click", e => e.preventDefault());
}


// 🔹 Detectează GIF-uri noi
function detectAndReplaceAllGifs() {
    const imgs = Array.from(document.querySelectorAll("img"));

    for (const img of imgs) {
        if (img.closest("[data-epilepsy-wrapper]")) continue;
        if (img.dataset.gifReplaced === "true") continue;

        const src = img.src?.toLowerCase() || "";

        const looksLikeGif =
            src.endsWith(".gif") ||
            img.dataset.gif ||
            img.dataset.src?.endsWith(".gif") ||
            img.dataset.original?.endsWith(".gif") ||
            src.includes("giphy.com/media");

        if (looksLikeGif) replaceGif(img);
    }
}


// 🔹 Activează protecția GIF-urilor
function initGifProtection() {
    detectAndReplaceAllGifs();

    new MutationObserver(() => detectAndReplaceAllGifs())
        .observe(document.body, { childList: true, subtree: true });
}

// ===============================
//   VIDEO PLAY / STOP OVERLAY
// ===============================

function createVideoOverlay(message = "⚠ VIDEO – Click pentru a porni") {
    const overlay = document.createElement("div");
    overlay.innerText = message;
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.55)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.fontSize = "16px";
    overlay.style.fontFamily = "sans-serif";
    overlay.style.textAlign = "center";
    overlay.style.zIndex = "99999";
    overlay.style.cursor = "pointer";

    return overlay;
}

function wrapVideo(video) {
    if (video.dataset.epilepsyWrapped === "true") return;
    video.dataset.epilepsyWrapped = "true";

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.width = video.clientWidth + "px";
    wrapper.style.cursor = "pointer";

    const overlay = createVideoOverlay();

    video.parentNode.insertBefore(wrapper, video);
    wrapper.appendChild(video);
    wrapper.appendChild(overlay);

    video.autoplay = false;
    video.pause();
    video.muted = false;

    let playing = false;

    // FIRST CLICK → PLAY
    overlay.addEventListener("click", () => {
        playing = true;
        video.play();
        overlay.style.display = "none";
    });

    // CLICK ON VIDEO → STOP + SHOW OVERLAY AGAIN
    video.addEventListener("click", () => {
        if (playing) {
            video.pause();
            playing = false;
            overlay.innerText = "✋ VIDEO – Click pentru a porni din nou";
            overlay.style.display = "flex";
        }
    });

    // If video finished → show overlay again
    video.addEventListener("ended", () => {
        playing = false;
        overlay.innerText = "⚠ VIDEO – Click pentru a porni";
        overlay.style.display = "flex";
    });
}

function detectVideos() {
    document.querySelectorAll("video").forEach(wrapVideo);
}

function initVideoProtection() {
    detectVideos();

    new MutationObserver(() => {
        detectVideos();
    }).observe(document.body, { childList: true, subtree: true });
}

// ===============================
// 💥 FINAL ANIMATION BLOCKER (guaranteed)
// ===============================

function initAnimationBlocker() {
    // 1. CSS absolut (injectat pe <html>)
    const style = document.createElement("style");
    style.textContent = `
        * {
            animation: none !important;
            animation-duration: 0s !important;
            animation-iteration-count: 1 !important;
            transition: none !important;
            scroll-behavior: auto !important;
        }
    `;
    document.documentElement.appendChild(style);

    // 2. CSSSheet injectat cu prioritate maximă
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
        * {
            animation: none !important;
            transition: none !important;
        }
    `);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

    // 3. Patch direct pe style computed — această parte e invincibilă
    function patchElement(el) {
        try {
            el.style.setProperty("animation", "none", "important");
            el.style.setProperty("transition", "none", "important");
            el.style.setProperty("scroll-behavior", "auto", "important");
        } catch {}
    }

    // 4. Patch pe TOATE elementele din pagină
    document.querySelectorAll("*").forEach(patchElement);

    // 5. Patch pe elementele noi (mutation observer)
    new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.addedNodes) {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        patchElement(node);
                        node.querySelectorAll?.("*").forEach(patchElement);
                    }
                });
            }
        }
    }).observe(document.documentElement, { childList: true, subtree: true });
}
export function apply() {
    initGifProtection();
    initVideoProtection();
    initAnimationBlocker();   // 🔥 ADĂUGAT ACUM
}