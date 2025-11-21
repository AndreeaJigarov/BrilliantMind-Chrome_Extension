export function apply() {
    console.log("Color Blindness module activated");

    fetch(chrome.runtime.getURL("affections/color_blindness/styles.css"))
        .then(r => r.text())
        .then(css => {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        });
}
