export function apply() {
    console.log("Simplify module activated");

    if (document.readyState === "complete") {
        runSimplify();
    } else {
        window.addEventListener("load", runSimplify);
    }
}

function runSimplify() {
    console.log("Running simplify...");
    
    removeExternalStyles();
    removeInlineStyles();
    removeImages();
    keepMainContent();
    flattenStructure();
    injectReaderCSS();
}

/* ------------------------------
   Remove ALL <link> and <style>
------------------------------- */
function removeExternalStyles() {
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());
    console.log("Removed external CSS files");
}

/* ------------------------------
   Remove inline styles
------------------------------- */
function removeInlineStyles() {
    document.querySelectorAll("*[style]").forEach(el => {
        el.removeAttribute("style");
    });
    console.log("Removed inline styles");
}

/* ------------------------------
   Remove images
------------------------------- */
function removeImages() {
    document.querySelectorAll("img, picture, figure").forEach(img => img.remove());
    console.log("Removed images");
}

/* ------------------------------------------
   Extract main content if page supports it
------------------------------------------- */
function keepMainContent() {
    const candidates = [
        "#content", "#main", "#main-content", "#article",
        ".content", ".main", ".article",
        "#mw-content-text", /* Wikipedia */
        "[role='main']"
    ];

    let main = null;
    for (const sel of candidates) {
        const found = document.querySelector(sel);
        if (found) {
            main = found.cloneNode(true);
            break;
        }
    }

    if (!main) {
        console.log("Main content not detected — keeping everything");
        return;
    }

    document.body.innerHTML = "";
    document.body.appendChild(main);
    console.log("Kept main content only");
}

/* ------------------------------
   Flatten the structure
   Remove nav, footer, aside, etc.
------------------------------- */
function flattenStructure() {
    document.querySelectorAll("nav, header, footer, aside").forEach(el => el.remove());
    console.log("Removed navigation + side sections");
}

/* ------------------------------
   Add clean reader-mode CSS
------------------------------- */
function injectReaderCSS() {
    fetch(chrome.runtime.getURL("affections/simplify/styles.css"))
        .then(r => r.text())
        .then(css => {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        });
}
