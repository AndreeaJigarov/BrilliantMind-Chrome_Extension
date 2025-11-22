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
}

export function apply() {
    console.log("Simplify module activated");
    
    if (document.readyState === "complete") {
        runSimplify();
    } else {
        window.addEventListener("load", runSimplify);
    }
}

async function runSimplify() {
    console.log("Applying familiar styling...");
    const settings = await SimplifySettings.getSettings();
    
    if (!settings.enabled) {
        console.log("Simplify is disabled");
        return;
    }
    
    applyConsistentFonts(settings);
    applyBetterContrast(settings);
    applyComfortableSpacing(settings); // Updated to take settings
    //applyComfortableWidth();
    //cleanupMedia();
    //improveCodeAndLists();
}

function applyConsistentFonts(settings) {
    const css = `
        /* Step 1: Consistent fonts everywhere */
        * {
            font-family: ${settings.fontFamily} !important;
            letter-spacing: ${settings.letterSpacing}px !important;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

function applyComfortableSpacing(settings) {
    const css = `
        /* Step 2: Comfortable line height and text spacing */
        body {
            line-height: ${settings.lineHeight} !important;
        }
        
        p {
            margin-bottom: 1.2em !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            line-height: 1.3 !important;
            margin-top: 1.5em !important;
            margin-bottom: 0.8em !important;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    console.log("Applied comfortable spacing");
}

function applyBetterContrast(settings) {
    const css = `
        /* Step 3: Better text contrast and readability */
        body {
            color: ${settings.textColor} !important;
            background: white !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #000 !important;
        }
        
        a {
            color: #0066cc !important;
        }
        
        a:hover {
            opacity: 0.8 !important;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

function applyComfortableWidth() {
    const css = `
        /* Step 4: Comfortable max width for reading */
        body {
            max-width: 800px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

function cleanupMedia() {
    const css = `
        /* Step 5: Clean up images and media */
        img {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 4px !important;
        }
        
        video, iframe {
            max-width: 100% !important;
            border-radius: 4px !important;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

function improveCodeAndLists() {
    const css = `
        /* Step 6: Better code blocks and lists */
        code, pre {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
            background: #f5f5f5 !important;
            border-radius: 3px !important;
        }
        
        pre {
            padding: 1em !important;
            overflow-x: auto !important;
        }
        
        ul, ol {
            margin: 1em 0 !important;
            padding-left: 2em !important;
        }
        
        li {
            margin-bottom: 0.5em !important;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}