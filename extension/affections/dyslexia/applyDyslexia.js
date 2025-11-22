function injectLink(href) {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return existing;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
}

function injectStyle(css, id) {
    if (id) {
        const existing = document.getElementById(id);
        if (existing) return existing;
    }
    const style = document.createElement('style');
    if (id) style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
    return style;
}

export function apply(options = {}) {
    // options: { fontSizePx, enable }
    const fontSizePx = options.fontSizePx || 16; // default ~12pt

    // 1) Try to load Lexend from Google Fonts (widely available)
    injectLink('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap');

    // 2) Add OpenDyslexic @font-face as optional fallback (served from jsDelivr CDN).
    // If the CDN is unavailable the browser will fall back to Lexend or system fonts.
    const dyslexicFace = `@font-face {\n` +
        `  font-family: 'OpenDyslexic';\n` +
        `  src: local('OpenDyslexic'), local('OpenDyslexic3-Regular'), \n` +
        `       url('https://cdn.jsdelivr.net/gh/antijingoist/open-dyslexic/OpenDyslexic3-Regular.woff2') format('woff2');\n` +
        `  font-weight: 400;\n` +
        `  font-style: normal;\n` +
        `  font-display: swap;\n` +
        `}`;
    injectStyle(dyslexicFace, 'dyslexia-friendly-face');

    // 3) Inject main dyslexia-friendly CSS (uses CSS variable fallbacks)
    const css = `:root { --dyslexia-friendly-font-size: ${fontSizePx}px; }\n` +
        `.dyslexia-friendly, .dyslexia-friendly * {\n` +
        `  font-family: 'OpenDyslexic', 'Lexend', Arial, 'Comic Sans MS', Verdana, Tahoma, 'Century Gothic', 'Trebuchet MS', sans-serif !important;\n` +
        `  font-size: var(--dyslexia-friendly-font-size) !important;\n` +
        `  line-height: 1.6 !important;\n` +
        `  text-align: left !important;\n` +
        `  text-transform: none !important;\n` +
        `  letter-spacing: 0.5px !important;\n` +
        `  word-spacing: 0.3px !important;\n` +
        `  text-decoration: none !important;\n` +
        `  font-style: normal !important;\n` +
        `}\n` +
        `/* Headings and emphasis */\n` +
        `.dyslexia-friendly h1, .dyslexia-friendly h2, .dyslexia-friendly h3, .dyslexia-friendly h4, .dyslexia-friendly h5, .dyslexia-friendly h6 {\n` +
        `  font-weight: 700 !important;\n` +
        `  text-transform: lowercase !important;\n` +
        `  margin-top: 1em !important;\n` +
        `  margin-bottom: 0.5em !important;\n` +
        `}\n` +
        `.dyslexia-friendly h1 { font-size: calc(var(--dyslexia-friendly-font-size) * 2) !important; }\n` +
        `.dyslexia-friendly h2 { font-size: calc(var(--dyslexia-friendly-font-size) * 1.75) !important; }\n` +
        `.dyslexia-friendly h3 { font-size: calc(var(--dyslexia-friendly-font-size) * 1.5) !important; }\n` +
        `\n` +
        `/* Strong/bold emphasis */\n` +
        `.dyslexia-friendly b, .dyslexia-friendly strong { font-weight: 700 !important; }\n` +
        `/* Avoid italics/underline for emphasis: prefer bold */\n` +
        `.dyslexia-friendly em, .dyslexia-friendly i { font-style: normal !important; text-decoration: none !important; font-weight: 700 !important; }\n` +
        `\n` +
        `/* Box utility for emphasis */\n` +
        `.dyslexia-friendly .dyslexia-box { border: 2px solid rgba(0,0,0,0.12) !important; padding: 0.6em !important; border-radius: 6px !important; background: rgba(0,0,0,0.02) !important; }`;

    injectStyle(css, 'dyslexia-friendly-style');

    // 4) Add class to <html> to apply styles globally
    document.documentElement.classList.add('dyslexia-friendly');
}

export function remove() {
    document.documentElement.classList.remove('dyslexic-friendly');
    const ids = ['dyslexic-friendly-style', 'dyslexic-friendly-face'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

export default { apply, remove };
