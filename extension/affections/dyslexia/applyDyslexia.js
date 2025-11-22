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
    injectStyle(dyslexicFace, 'dyslexic-friendly-face');

    // 3) Inject main dyslexia-friendly CSS (uses CSS variable fallbacks)
    const css = `:root { --dyslexic-friendly-font-size: ${fontSizePx}px; }\n` +
        `.dyslexic-friendly, .dyslexic-friendly * {\n` +
        `  font-family: 'OpenDyslexic', 'Lexend', Arial, 'Comic Sans MS', Verdana, Tahoma, 'Century Gothic', 'Trebuchet MS', sans-serif !important;\n` +
        `  font-size: var(--dyslexic-friendly-font-size) !important;\n` +
        `  line-height: 1.5 !important;\n` +
        `  text-align: left !important;\n` +
        `  text-transform: none !important;\n` +
        `  letter-spacing: 0.2px !important;\n` +
        `  word-spacing: 0.2px !important;\n` +
        `}`;

    injectStyle(css, 'dyslexic-friendly-style');

    // 4) Add class to <html> to apply styles globally
    document.documentElement.classList.add('dyslexic-friendly');
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
