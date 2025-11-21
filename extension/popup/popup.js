document.addEventListener("DOMContentLoaded", () => {
    const baseCheckbox = document.getElementById("base");

    chrome.storage.sync.get(["enabledModules"], ({ enabledModules }) => {
        if (enabledModules && enabledModules.includes("base")) {
            baseCheckbox.checked = true;
        }
    });

    baseCheckbox.addEventListener("change", async () => {
        const isEnabled = baseCheckbox.checked;

        chrome.storage.sync.get(["enabledModules"], ({ enabledModules }) => {
            let newList = enabledModules || [];

            if (isEnabled) {
                if (!newList.includes("base")) newList.push("base");
            } else {
                newList = newList.filter(m => m !== "base");
            }

            chrome.storage.sync.set({ enabledModules: newList });
        });
    });
});
