document.addEventListener("DOMContentLoaded", () => {
    const modules = ["dyslexia", "adhd", "color_blindness", "epilepsy", "simplify", "reader_mode"];
    const checkboxes = Object.fromEntries(
        modules.map(id => [id, document.getElementById(id)])
    );

    // Load saved state
    chrome.storage.sync.get(["enabledModules"], ({ enabledModules }) => {
        if (enabledModules && enabledModules.length > 0) {
            const active = enabledModules[0];
            if (checkboxes[active]) checkboxes[active].checked = true;
        }
    });

    // Assign change listeners
    modules.forEach(mod => {
        checkboxes[mod].addEventListener("change", () => {
            applySelection(mod, checkboxes[mod].checked);
        });
    });
});

function applySelection(selected, isChecked) {
    const modules = ["dyslexia", "adhd", "color_blindness", "epilepsy", "simplify", "reader_mode"];

    if (isChecked) {
        // Turn off all other checkboxes
        modules.forEach(m => {
            if (m !== selected) {
                const box = document.getElementById(m);
                if (box) box.checked = false;
            }
        });

        // Save only the selected module
        chrome.storage.sync.set({ enabledModules: [selected] }, reloadActiveTab);

    } else {
        // Allow unchecking everything
        chrome.storage.sync.set({ enabledModules: [] }, reloadActiveTab);
    }
}

function reloadActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.reload(tabs[0].id);
    });
}
