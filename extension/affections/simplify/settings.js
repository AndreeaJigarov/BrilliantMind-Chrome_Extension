// Remove the export/import syntax since we can't use modules in popups easily

class SimplifySettings {
    static async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['simplifySettings'], (result) => {
                resolve(result.simplifySettings || {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    textColor: '#333',
                    enabled: true
                });
            });
        });
    }

    static async saveSettings(settings) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ simplifySettings: settings }, resolve);
        });
    }
}