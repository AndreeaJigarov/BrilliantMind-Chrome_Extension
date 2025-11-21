document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = {
        base: document.getElementById("base"),
        dyslexia: document.getElementById("dyslexia"),
        adhd: document.getElementById("adhd"),
        color_blindness: document.getElementById("color_blindness"),
        epilepsy: document.getElementById("epilepsy")
    };

    // Load initial state
    chrome.storage.sync.get(["enabledModules"], ({ enabledModules }) => {
        if (!enabledModules) return;
        const active = enabledModules[0]; // only one active
        if (active && checkboxes[active]) {
            checkboxes[active].checked = true;
        }
    });

    // Clicking ANY checkbox disables the others
    for (const mod in checkboxes) {
        checkboxes[mod].addEventListener("change", () => {
            handleSelection(mod);
        });
    }
});

function handleSelection(selected) {
    const modules = ["base", "dyslexia", "adhd", "color_blindness", "epilepsy"];

    chrome.storage.sync.set(
        { enabledModules: selected ? [selected] : [] },
        () => reloadActiveTab()
    );

    // Uncheck all the others in the popup
    modules.forEach(m => {
        if (m !== selected) {
            const box = document.getElementById(m);
            if (box) box.checked = false;
        }
    });
}

function reloadActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.reload(tabs[0].id);
    });
}
