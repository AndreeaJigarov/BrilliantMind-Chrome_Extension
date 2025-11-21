document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = {
        base: document.getElementById("base"),
        dyslexia: document.getElementById("dyslexia"),
        adhd: document.getElementById("adhd"),
        color_blindness: document.getElementById("color_blindness"),
        epilepsy: document.getElementById("epilepsy")
    };

    // Load saved values
    chrome.storage.sync.get(["enabledModules"], ({ enabledModules }) => {
        if (!enabledModules) return;

        for (const mod of enabledModules) {
            if (checkboxes[mod]) checkboxes[mod].checked = true;
        }
    });

    // Add listeners to all checkboxes
    for (const mod in checkboxes) {
        checkboxes[mod].addEventListener("change", () => {
            updateModules(mod, checkboxes[mod].checked);
        });
    }
});

function updateModules(mod, enabled) {
    chrome.storage.sync.get(["enabledModules"], ({ enabledModules }) => {
        let list = enabledModules || [];

        if (enabled) {
            if (!list.includes(mod)) list.push(mod);
        } else {
            list = list.filter(m => m !== mod);
        }

        chrome.storage.sync.set({ enabledModules: list }, () => {
            reloadActiveTab();
        });
    });
}

function reloadActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.reload(tabs[0].id);
    });
}
