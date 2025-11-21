function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

chrome.storage.sync.get(["enabledModules"], ({ enabledModules }) => {
    if (!enabledModules) return;

    enabledModules.forEach(mod => {
        import(chrome.runtime.getURL(`affections/${mod}/apply${capitalize(mod)}.js`))
            .then(module => module.apply())
            .catch(err => console.error("Error loading module:", mod, err));
    });
});

// Listen for changes while page is open
chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabledModules) {
        location.reload();  // simple solution: refresh page to reapply modules
    }
});
