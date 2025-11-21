export function apply() {
    console.log("Simplify module activated");

    removeExternalStyles();
    removeInlineStyles();
    removeImages();
    simplifyStructure();
    keepMainContent();
}

/* ---------------------------------------
   Remove all external CSS (link rel=stylesheet)
---------------------------------------- */
function removeExternalStyles() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => link.remove());
    document.querySelectorAll('style').forEach(style => style.remove());
    console.log("Removed external CSS");
}

/* ---------------------------------------
   Remove all inline style attributes
---------------------------------------- */
function removeInlineStyles() {
    const all = document.querySelectorAll("*[style]");
    all.forEach(el => el.removeAttribute("style"));
    console.log("Removed inline styles");
}

/* ---------------------------------------
   Remove all images
---------------------------------------- */
function removeImages() {
    document.querySelectorAll("img").forEach(img => img.remove());
    console.log("Removed images");
}

/* ---------------------------------------
   Flatten layout by unwrapping divs
---------------------------------------- */
function simplifyStructure() {
    document.querySelectorAll("div, section, aside, nav, header, footer").forEach(el => {
        const parent = el.parentNode;
        while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
        }
        el.remove();
    });
    console.log("Flattened structure");
}

/* ---------------------------------------
   Keep only the main content (best-effort)
---------------------------------------- */
function keepMainContent() {
    const body = document.body;

    const candidates = [
        "#content",
        "#main",
        "#article",
        "#mw-content-text",
        ".main",
        ".content",
        ".article",
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

    if (main) {
        document.body.innerHTML = "";
        document.body.appendChild(main);
        console.log("Kept main content only");
    } else {
        console.log("Main content not found — keeping whole page");
    }
}
