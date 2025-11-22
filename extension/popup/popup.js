document.addEventListener("DOMContentLoaded", () => {
    const modules = ["dyslexia", "adhd", "autism", "color_blindness", "epilepsy", "simplify", "reader_mode"];
    const checkboxes = Object.fromEntries(
        modules.map(id => [id, document.getElementById(id)])
    );

    // Load saved preference for THIS SITE ONLY
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        const domain = new URL(tab.url).hostname;

        chrome.storage.local.get("site_" + domain, data => {
            const enabledModules = data["site_" + domain] || [];

            if (enabledModules.length > 0) {
                const active = enabledModules[0];
                if (checkboxes[active]) checkboxes[active].checked = true;
            }
        });
    });

    // Add listeners
    modules.forEach(mod => {
        checkboxes[mod].addEventListener("change", () => {
            applySelection(mod, checkboxes[mod].checked);
        });
    });
});

function applySelection(selected, isChecked) {
    const modules = ["dyslexia", "adhd", "autism", "color_blindness", "epilepsy", "simplify", "reader_mode"];

    if (isChecked) {
        // Turn off all other checkboxes
        modules.forEach(m => {
            if (m !== selected) {
                const box = document.getElementById(m);
                if (box) box.checked = false;
            }
        });

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        const domain = new URL(tab.url).hostname;
        const key = "site_" + domain;

        if (isChecked) {
            // Uncheck other boxes
            modules.forEach(m => {
                if (m !== selected) {
                    const box = document.getElementById(m);
                    if (box) box.checked = false;
                }
            });

            // Save only THIS site’s module
            chrome.storage.local.set({ [key]: [selected] }, reloadActiveTab);

        } else {
            // User unchecked → remove setting for this site
            chrome.storage.local.set({ [key]: [] }, reloadActiveTab);
        }
    });
}

function reloadActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.reload(tabs[0].id);
    });
}

// In your main popup.js
document.getElementById('openSimplifySettings').addEventListener('click', () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('affections/simplify/settings-popup.html')
    });
});
