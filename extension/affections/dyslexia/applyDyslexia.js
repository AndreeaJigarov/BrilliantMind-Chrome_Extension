// extension/affections/dyslexia/applyDyslexia.js

export function apply() {
    console.log("[DYSLEXIA] Applying dyslexia formatting…");

    // Add the global dyslexia class
    document.documentElement.classList.add("dyslexia-mode");

    // Load personalized preferences (background + font size)
    chrome.storage.sync.get(
        ["dyslexia_background", "dyslexia_fontsize"],
        ({ dyslexia_background, dyslexia_fontsize }) => {

            if (dyslexia_background) {
                document.documentElement.style.setProperty(
                    "--dyslexia-bg",
                    dyslexia_background
                );
            }

            if (dyslexia_fontsize) {
                document.documentElement.style.setProperty(
                    "--dyslexia-font-size",
                    dyslexia_fontsize + "px"
                );
            }
        }
    );
}
