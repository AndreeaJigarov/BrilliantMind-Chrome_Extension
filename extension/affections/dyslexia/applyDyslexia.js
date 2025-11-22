

export function apply() {
    console.log("[DYSLEXIA] Activating enhanced dyslexia mode...");

    if (document.readyState === "complete") {
        runDyslexiaMode();
    } else {
        window.addEventListener("load", runDyslexiaMode);
    }
}

function runDyslexiaMode() {
    console.log("[DYSLEXIA] Cleaning layout for accessibility...");

    document.documentElement.classList.add("dyslexia-mode");

    applyUserPreferences();
    removeDistractingElements();
    stripInlineStyles();
    flattenColumns();
    unblockScrolling();
    disableAnimations();
    injectDyslexiaCSS();
}

/*user preferences*/
function applyUserPreferences() {
    chrome.storage.sync.get(
        ["dyslexia_background", "dyslexia_fontsize"],
        ({ dyslexia_background, dyslexia_fontsize }) => {

            if (dyslexia_background) {
                document.documentElement.style.setProperty("--dyslexia-bg", dyslexia_background);
            }

            if (dyslexia_fontsize) {
                document.documentElement.style.setProperty("--dyslexia-font-size", dyslexia_fontsize + "px");
            }
        }
    );
}

//remove distracting elements
function removeDistractingElements() {
    const toRemove = [
        "nav", "header", "footer", "aside",
        ".sidebar", ".ad", ".ads", ".advertisement",
        "[role='banner']", "[role='complementary']",
        ".cookie-banner", ".popup", ".modal", ".overlay",
        ".sticky", ".fixed"
    ];

    toRemove.forEach(sel => {
        document.querySelectorAll(sel).forEach(e => e.remove());
    });
}

//remove inline styles that break readability
function stripInlineStyles() {
    document.querySelectorAll("*").forEach(el => {
        el.removeAttribute("style");
    });
}

//flatten narrow columns
function flattenColumns() {
    document.querySelectorAll("[class*='col'], .column, .columns").forEach(el => {
        el.style.minWidth = "600px";
        el.style.width = "100%";
    });
}

//fix sites that freeze scrolling
function unblockScrolling() {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
}

//disable animations and parallax
function disableAnimations() {
    const css = `
        * {
            animation: none !important;
            transition: none !important;
            scroll-behavior: auto !important;
        }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}

//inject dyslexia CSS
function injectDyslexiaCSS() {
    fetch(chrome.runtime.getURL("affections/dyslexia/styles.css"))
        .then(r => r.text())
        .then(css => {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        });
}
