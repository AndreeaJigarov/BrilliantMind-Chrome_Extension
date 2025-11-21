export function apply() {
    console.log("Base accessibility module activated");

    fetch(chrome.runtime.getURL("affections/base/styles.css"))
        .then(r => r.text())
        .then(css => {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        });
}
