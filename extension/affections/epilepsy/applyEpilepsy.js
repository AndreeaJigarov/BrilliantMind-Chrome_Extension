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

    if (img.src.includes("giphy.com/media") && img.src.includes("_s.")) {
        return img.src.replace("_s.", ".");
    }

    const picture = img.closest("picture");
    if (picture) {
        const source = picture.querySelector("source[srcset*='.gif'], source[type='image/gif']");
        if (source) return source.srcset.split(" ")[0];
    }

    return img.src;
}


// 🔹 Înlocuiește GIF-ul cu wrapper static + overlay
async function replaceGif(img) {
    if (img.dataset.gifReplaced === "true") return;
    img.dataset.gifReplaced = "true";

    const realGif = findRealGifURL(img);
    const staticSrc = await getStaticFrame(img);

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.cursor = "pointer";
    wrapper.style.pointerEvents = "auto";
    wrapper.style.zIndex = "999999";

    wrapper.dataset.epilepsyWrapper = "true"; // 🔥 IMPORTANT

    const staticImg = document.createElement("img");
    staticImg.src = staticSrc || img.src;
    staticImg.style.width = img.width + "px";
    staticImg.style.pointerEvents = "none";

    const overlay = document.createElement("div");
    overlay.innerText = "⚠️ GIF – Click pentru a porni";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0, 0, 0, 0.55)";
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

    wrapper.addEventListener("click", () => {
        if (!playing) {
            staticImg.src = realGif;
            overlay.innerText = "✋ Click pentru a opri GIF-ul";
            overlay.style.background = "rgba(0, 0, 0, 0.35)";
        } else {
            staticImg.src = staticSrc;
            overlay.innerText = "⚠️ GIF – Click pentru a porni";
            overlay.style.background = "rgba(0, 0, 0, 0.55)";
        }
        playing = !playing;
    });
}


// 🔹 Detectează GIF-uri noi — DAR fără să reînlocuiască wrapper-ele
function detectAndReplaceAllGifs() {
    const imgs = Array.from(document.querySelectorAll("img, video"));

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

export function apply() {
    initGifProtection();
}