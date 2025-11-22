export function apply() {
    console.log("Simplify module activated");

    if (document.readyState === "complete") {
        runSimplify();
    } else {
        window.addEventListener("load", runSimplify);
    }
}

function runSimplify() {
    console.log("Running simplify with Readability...");
    
    const article = extractWithReadability();
    
    if (article) {
        applyReadabilityResult(article);
    } else {
        applyFallbackSimplify();
    }
    
    injectReaderCSS();
}

function extractWithReadability() {
    try {
        console.log("Extracting content with Readability...");
        const documentClone = document.cloneNode(true);
        const reader = new Readability(documentClone);
        const article = reader.parse();
        
        if (article && article.content) {
            console.log("Readability extraction successful");
            return article;
        }
    } catch (error) {
        console.error("Readability extraction failed:", error);
    }
    
    return null;
}

function applyReadabilityResult(article) {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    
    const articleElement = document.createElement('article');
    articleElement.className = 'readability-article';
    
    if (article.title) {
        const titleEl = document.createElement('h1');
        titleEl.textContent = article.title;
        titleEl.className = 'article-title';
        articleElement.appendChild(titleEl);
    }
    
    if (article.byline) {
        const bylineEl = document.createElement('div');
        bylineEl.className = 'article-byline';
        bylineEl.textContent = article.byline;
        articleElement.appendChild(bylineEl);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'article-content';
    contentDiv.innerHTML = article.content;
    articleElement.appendChild(contentDiv);
    
    document.body.appendChild(articleElement);
}

function applyFallbackSimplify() {
    console.log("Using fallback simplification method");
    removeExternalStyles();
    removeInlineStyles();
    removeImages();
    keepMainContent();
    flattenStructure();
}

function removeExternalStyles() {
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());
}

function removeInlineStyles() {
    document.querySelectorAll("*[style]").forEach(el => el.removeAttribute("style"));
}

function removeImages() {
    document.querySelectorAll("img, picture, figure").forEach(img => img.remove());
}

function keepMainContent() {
    const candidates = ["#content", "#main", "#main-content", "#article", ".content", ".main", ".article", "#mw-content-text", "[role='main']"];
    let main = null;
    for (const sel of candidates) {
        const found = document.querySelector(sel);
        if (found) {
            main = found.cloneNode(true);
            break;
        }
    }
    if (!main) return;
    document.body.innerHTML = "";
    document.body.appendChild(main);
}

function flattenStructure() {
    document.querySelectorAll("nav, header, footer, aside").forEach(el => el.remove());
}

function injectReaderCSS() {
    const cssUrl = chrome.runtime.getURL('affections/simplify/styles.css');
    
    fetch(cssUrl)
        .then(response => response.text())
        .then(css => {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
            console.log("Injected reader CSS from file");
        })
        .catch(error => {
            console.error('Failed to load CSS file:', error);
            // Fallback to basic CSS if file fails to load
            injectFallbackCSS();
        });
}

function injectFallbackCSS() {
    const fallbackCSS = `
        body { 
            max-width: 700px; 
            margin: 0 auto; 
            padding: 20px; 
            font-family: sans-serif; 
            line-height: 1.6; 
        }
        .readability-article { 
            color: #333; 
        }
        .article-title { 
            font-size: 2em; 
            margin-bottom: 0.5em; 
        }
        .article-byline { 
            color: #666; 
            margin-bottom: 2em; 
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = fallbackCSS;
    document.head.appendChild(style);
    console.log("Injected fallback CSS");
}