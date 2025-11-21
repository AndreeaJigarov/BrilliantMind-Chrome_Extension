export function apply() {
    console.log("Base accessibility module activated");

    const cssPath = chrome.runtime.getURL("affections/base/styles.css");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssPath;

    document.head.appendChild(link);
}
