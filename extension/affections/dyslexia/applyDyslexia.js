// Clean, single-file implementation for dyslexia-friendly presentation
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

// Heuristic: detect mostly ALL-CAPS string
function isMostlyAllCaps(s) {
    const letters = s.match(/[A-Za-z]/g);
    if (!letters || letters.length < 3) return false;
    const upper = letters.filter(c => c === c.toUpperCase()).length;
    return (upper / letters.length) >= 0.75;
}

// Preserve acronyms (e.g. "NASA") by replacing them with tokens, returning { text, acronyms }
function replaceAcronymsWithTokens(s) {
    const acronyms = [];
    let idx = 0;
    const text = s.replace(/\b([A-Z]{2,})\b/g, function (m) {
        acronyms.push(m);
        return `__ACR${idx++}__`;
    });
    return { text, acronyms };
}

function restoreAcronymsFromTokens(s, acronyms) {
    let out = s;
    acronyms.forEach((a, i) => {
        out = out.replace(new RegExp(`__ACR${i}__`, 'g'), a);
    });
    return out;
}

function toSentenceCasePreservingAcronyms(s) {
    const { text, acronyms } = replaceAcronymsWithTokens(s);
    const lowered = text.toLowerCase();
    const sentence = lowered.replace(/(^|\.|\?|\!|\n)\s*([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    return restoreAcronymsFromTokens(sentence, acronyms);
}

function convertHeadingTextNodesToSentenceCaseIfNeeded(el) {
    // Only operate on text node children (avoid changing interactive elements)
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }
    textNodes.forEach(node => {
        const v = node.nodeValue.trim();
        if (!v) return;
        if (isMostlyAllCaps(v)) {
            const converted = toSentenceCasePreservingAcronyms(v);
            node.nodeValue = converted;
        }
    });
}

function processAllHeadings(root = document) {
    const selector = '.dyslexia-friendly h1, .dyslexia-friendly h2, .dyslexia-friendly h3, .dyslexia-friendly h4, .dyslexia-friendly h5, .dyslexia-friendly h6';
    const headings = root.querySelectorAll(selector);
    headings.forEach(h => convertHeadingTextNodesToSentenceCaseIfNeeded(h));
}

// Preferences widget and helpers
let _dyslexia_originalBodyStyles = null;
let _dyslexia_prefsWidget = null;
let _dyslexia_pageIsDark = false;

// Safe storage wrapper to avoid crashes when chrome.storage isn't available
const storage = {
    get: (keys, cb) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync && chrome.storage.sync.get) {
            try { chrome.storage.sync.get(keys, cb); } catch (e) { setTimeout(() => cb({}), 0); }
        } else {
            setTimeout(() => cb({}), 0);
        }
    },
    set: (obj, cb) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync && chrome.storage.sync.set) {
            try { chrome.storage.sync.set(obj, cb || (() => {})); } catch (e) { if (cb) setTimeout(cb, 0); }
        } else {
            if (cb) setTimeout(cb, 0);
        }
    }
};

function applyBackgroundChoice(name, color) {
    try {
        const body = document.body;
        _dyslexia_originalBodyStyles = _dyslexia_originalBodyStyles || { backgroundColor: body.style.backgroundColor || '', color: body.style.color || '' };
        // Apply exactly the color the user chose (do not remap custom colors)
        const chosen = color;
        body.style.backgroundColor = chosen;
        body.style.color = body.style.color || '#111111';
        // expose CSS variables so inputs and other controls can inherit
        try { document.documentElement.style.setProperty('--dyslexia-bg', chosen); } catch (e) {}
        try { document.documentElement.style.setProperty('--dyslexia-fg', body.style.color || '#111111'); } catch (e) {}
    } catch (e) {
        console.warn('applyBackgroundChoice failed', e);
    }
}

// Color parsing helpers - return {r,g,b} or null
function hexToRgb(hex) {
    if (!hex) return null;
    const h = hex.replace('#', '').trim();
    if (h.length === 3) {
        const r = parseInt(h[0] + h[0], 16);
        const g = parseInt(h[1] + h[1], 16);
        const b = parseInt(h[2] + h[2], 16);
        return { r, g, b };
    }
    if (h.length === 6) {
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return { r, g, b };
    }
    return null;
}

function rgbStringToRgb(s) {
    if (!s || typeof s !== 'string') return null;
    const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return null;
    return { r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) };
}

function isColorCloseToWhite(color) {
    if (!color) return false;
    let rgb = null;
    if (color.startsWith('#')) rgb = hexToRgb(color);
    else if (color.startsWith('rgb')) rgb = rgbStringToRgb(color);
    if (!rgb) return false;
    const { r, g, b } = rgb;
    // If all channels are very high (near 255) consider it white-ish
    if (r >= 245 && g >= 245 && b >= 245) return true;
    // compute relative luminance
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.95;
}

function isColorDark(color) {
    if (!color) return false;
    let rgb = null;
    if (typeof color === 'string' && color.startsWith('#')) rgb = hexToRgb(color);
    else if (typeof color === 'string' && color.startsWith('rgb')) rgb = rgbStringToRgb(color);
    if (!rgb) return false;
    const { r, g, b } = rgb;
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum < 0.15;
}

function createDyslexiaPrefsWidget() {
    if (_dyslexia_prefsWidget) return _dyslexia_prefsWidget;
    const widget = document.createElement('div');
    widget.id = 'dyslexia-pref-widget';
    widget.className = 'dyslexia-pref-widget';

    const title = document.createElement('div');
    title.className = 'dyslexia-pref-title';
    title.textContent = 'Dyslexia prefs';
    widget.appendChild(title);

    const desc = document.createElement('div');
    desc.className = 'dyslexia-pref-desc';
    desc.textContent = 'Background:';
    widget.appendChild(desc);

    const presets = [
        { id: 'offWhite', label: 'Off-White', color: '#F5F2EB' },
        { id: 'softCream', label: 'Soft Cream', color: '#F9F4DB' },
        { id: 'softGrayBlue', label: 'Soft Gray-Blue', color: '#B4C3CD' },
        { id: 'sageGrayGreen', label: 'Sage Gray-Green', color: '#B8C4B6' }
    ];

    const list = document.createElement('div');
    list.className = 'dyslexia-pref-list';
    presets.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'dyslexia-pref-swatch';
        btn.title = p.label;
        btn.setAttribute('data-bg', p.id);
        btn.style.background = p.color;
        btn.addEventListener('click', () => {
        applyBackgroundChoice(p.id, p.color);
        try { storage.set({ dyslexiaPrefs: { bgName: p.id } }); } catch (e) {}
        });
        list.appendChild(btn);
    });

    const customWrap = document.createElement('div');
    customWrap.className = 'dyslexia-pref-custom';
    const customInput = document.createElement('input');
    customInput.type = 'color';
    customInput.title = 'Custom background color';
    customInput.addEventListener('input', (e) => {
        const c = e.target.value;
        applyBackgroundChoice('custom', c);
        try { storage.set({ dyslexiaPrefs: { bgColor: c } }); } catch (err) {}
    });
    customWrap.appendChild(customInput);

    const close = document.createElement('button');
    close.className = 'dyslexia-pref-close';
    close.textContent = '×';
    close.title = 'Close';
    close.addEventListener('click', () => { widget.style.display = 'none'; });

    // Add a small tab to open/close the widget from the side
    const tab = document.createElement('button');
    tab.className = 'dyslexia-pref-tab';
    tab.setAttribute('aria-expanded', 'true');
    tab.title = 'Open dyslexia prefs';
    // initial: opened -> show right-pointing arrow
    tab.textContent = '\u25B6'; // right-pointing triangle ▶
    tab.addEventListener('click', () => {
        const closed = widget.classList.toggle('closed');
        // show ◀ when closed, ▶ when opened per user preference
        tab.textContent = closed ? '\u25C0' : '\u25B6';
        tab.setAttribute('aria-expanded', closed ? 'false' : 'true');
    });

    widget.appendChild(tab);
    widget.appendChild(list);
    widget.appendChild(customWrap);
    widget.appendChild(close);

    const widgetCss = `#dyslexia-pref-widget { position: fixed; right: 12px; bottom: 12px; z-index: 2147483647; background: rgba(255,255,255,0.95); color: #111; border: 1px solid rgba(0,0,0,0.08); padding: 8px 12px 12px 12px; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); font-family: sans-serif; font-size: 12px; width:220px; transition: transform 0.22s ease; }
#dyslexia-pref-widget.closed { transform: translateX(180px); }
#dyslexia-pref-widget .dyslexia-pref-title { font-weight: 700; margin-bottom: 6px; }
#dyslexia-pref-widget .dyslexia-pref-list { display:flex; gap:6px; margin-bottom:6px; }
#dyslexia-pref-widget .dyslexia-pref-swatch { width:28px; height:20px; border-radius:4px; border:1px solid rgba(0,0,0,0.06); cursor:pointer; }
#dyslexia-pref-widget .dyslexia-pref-custom { margin-bottom:6px; }
#dyslexia-pref-widget .dyslexia-pref-close { position: absolute; right:8px; top:6px; background:transparent; border:none; font-size:14px; cursor:pointer; }
#dyslexia-pref-widget .dyslexia-pref-tab { position:absolute; left:-28px; top:8px; width:24px; height:24px; border-radius:4px; border:1px solid rgba(0,0,0,0.08); background:rgba(255,255,255,0.95); cursor:pointer; display:flex; align-items:center; justify-content:center; }
`;

    injectStyle(widgetCss, 'dyslexia-pref-widget-style');
    document.body.appendChild(widget);
    _dyslexia_prefsWidget = widget;

    // Load stored pref (safe)
    try {
        storage.get(['dyslexiaPrefs'], (res = {}) => {
            const stored = (res && res.dyslexiaPrefs) || {};
            const presetsMap = { offWhite: '#F5F2EB', softCream: '#F9F4DB', softGrayBlue: '#B4C3CD', sageGrayGreen: '#B8C4B6' };
            if (stored.bgColor) applyBackgroundChoice('custom', stored.bgColor);
            else if (stored.bgName && presetsMap[stored.bgName]) applyBackgroundChoice(stored.bgName, presetsMap[stored.bgName]);
        });
    } catch (e) {}

    return widget;
}

export function apply(options = {}) {
    // Idempotent guard: avoid double-application when module is imported/executed multiple times
    if (window.__DYSLEXIA_MODE_APPLIED && !options.force) return;
    window.__DYSLEXIA_MODE_APPLIED = true;

    const fontSizePx = options.fontSizePx || 16;

    // Load fonts
    injectLink('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap');

    const dyslexicFace = `@font-face {\n` +
        `  font-family: 'OpenDyslexic';\n` +
        `  src: local('OpenDyslexic'), local('OpenDyslexic3-Regular'), url('https://cdn.jsdelivr.net/gh/antijingoist/open-dyslexic/OpenDyslexic3-Regular.woff2') format('woff2');\n` +
        `  font-weight: 400;\n` +
        `  font-style: normal;\n` +
        `  font-display: swap;\n` +
        `}`;
    injectStyle(dyslexicFace, 'dyslexia-friendly-face');

    // Main CSS
    const css = `:root{ --dyslexia-friendly-font-size: ${fontSizePx}px; }
.dyslexia-friendly, .dyslexia-friendly * { font-family: 'OpenDyslexic', 'Lexend', Arial, 'Comic Sans MS', Verdana, Tahoma, 'Century Gothic', 'Trebuchet MS', sans-serif !important; font-size: var(--dyslexia-friendly-font-size) !important; line-height:1.6 !important; text-align:left !important; text-transform:none !important; letter-spacing:0.5px !important; word-spacing:0.3px !important; text-shadow:none !important; }
.dyslexia-friendly h1{ font-weight:700 !important; font-size: calc(var(--dyslexia-friendly-font-size) * 2) !important; }
.dyslexia-friendly h2{ font-weight:700 !important; font-size: calc(var(--dyslexia-friendly-font-size) * 1.75) !important; }
.dyslexia-friendly h3{ font-weight:700 !important; font-size: calc(var(--dyslexia-friendly-font-size) * 1.5) !important; }
.dyslexia-friendly b, .dyslexia-friendly strong { font-weight:700 !important; }
.dyslexia-friendly em, .dyslexia-friendly i { font-style:normal !important; text-decoration:none !important; font-weight:700 !important; }
.dyslexia-friendly .dyslexia-box { border:2px solid rgba(0,0,0,0.12) !important; padding:0.6em !important; border-radius:6px !important; background:rgba(0,0,0,0.02) !important; }
.dyslexia-friendly p, .dyslexia-friendly li, .dyslexia-friendly blockquote, .dyslexia-friendly pre { max-width:60ch !important; margin-top:0 !important; margin-bottom:1rem !important; line-height:1.6 !important; text-align:left !important; }
.dyslexia-friendly ul, .dyslexia-friendly ol { list-style-position:outside !important; padding-left:1.25rem !important; }
.dyslexia-friendly li { margin-bottom:0.6rem !important; }
.dyslexia-friendly [role="column"], .dyslexia-friendly .column, .dyslexia-friendly .col { min-width:200px !important; }
/* Ensure form controls and editable areas use dyslexia font and follow chosen background */
.dyslexia-friendly input, .dyslexia-friendly textarea, .dyslexia-friendly select, .dyslexia-friendly [contenteditable] {
  font-family: 'OpenDyslexic', 'Lexend', Arial, sans-serif !important;
  font-size: inherit !important;
  color: var(--dyslexia-fg, inherit) !important;
  background-color: var(--dyslexia-bg, transparent) !important;
  caret-color: var(--dyslexia-fg, auto) !important;
  border-color: rgba(0,0,0,0.12) !important;
}
`;

    injectStyle(css, 'dyslexia-friendly-style');

    // Link styling: muted, underlined to reduce distraction
    const linkCss = `.dyslexia-friendly a { text-decoration: underline !important; text-underline-offset: 2px !important; text-decoration-thickness: 1px !important; color: var(--dyslexia-link, #2f4f4f) !important; }
.dyslexia-friendly a:visited { color: rgba(47,79,79,0.8) !important; }
.dyslexia-friendly a:hover, .dyslexia-friendly a:focus { box-shadow: 0 0 0 3px rgba(47,79,79,0.06) !important; outline:none !important; }
/* ensure widget swatches keep inline background by giving them higher specificity */
#dyslexia-pref-widget .dyslexia-pref-swatch { background-clip: padding-box !important; }
`;
    injectStyle(linkCss, 'dyslexia-friendly-links');

    // Apply background preference (options or stored)
    const presets = { offWhite: '#F5F2EB', softCream: '#F9F4DB', softGrayBlue: '#B4C3CD', sageGrayGreen: '#B8C4B6', pastelYellow: '#fffef0' };
    const bgName = options.bgName || options.bg || null;
    const bgColor = options.bgColor || null;

    try {
        const body = document.body;
        // detect whether the page is already using a dark background so we avoid overwriting it automatically
        const comp = window.getComputedStyle(body);
        const currentBg = comp && comp.backgroundColor ? comp.backgroundColor.trim() : '';
        _dyslexia_pageIsDark = isColorDark(currentBg);

        let chosen = null;
        if (bgColor && typeof bgColor === 'string') chosen = bgColor;
        else if (bgName && presets[bgName]) chosen = presets[bgName];

        // If an explicit choice was provided (via options or user action), apply it.
        // Otherwise only auto-apply a gentle off-white when the page is light (not dark).
        if (chosen) {
            _dyslexia_originalBodyStyles = { backgroundColor: body.style.backgroundColor || '', color: body.style.color || '' };
            body.style.backgroundColor = chosen;
            body.style.color = body.style.color || '#111111';
            try { document.documentElement.style.setProperty('--dyslexia-bg', chosen); } catch (e) {}
        } else {
            // If the page background is white-ish and not dark, apply the gentle cream preset
            if (!_dyslexia_pageIsDark && isColorCloseToWhite(currentBg)) {
                _dyslexia_originalBodyStyles = { backgroundColor: body.style.backgroundColor || '', color: body.style.color || '' };
                body.style.backgroundColor = body.style.backgroundColor || presets.offWhite;
                body.style.color = body.style.color || '#111111';
                try { document.documentElement.style.setProperty('--dyslexia-bg', body.style.backgroundColor || presets.offWhite); } catch (e) {}
            }
        }
    } catch (e) {
        console.warn('Dyslexia mode: background check failed', e);
    }

    // Add class and run heuristics
    document.documentElement.classList.add('dyslexia-friendly');
    try { processAllHeadings(document); } catch (e) { console.error('Error processing headings for dyslexia mode:', e); }

    // Create prefs widget
    try { createDyslexiaPrefsWidget(); } catch (e) { console.warn('Dyslexia mode: prefs widget creation failed', e); }
}

export function remove() {
    document.documentElement.classList.remove('dyslexia-friendly');
    const ids = ['dyslexia-friendly-style', 'dyslexia-friendly-face', 'dyslexia-friendly-links', 'dyslexia-pref-widget-style'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });

    try {
        const body = document.body;
        if (_dyslexia_originalBodyStyles && body) {
            body.style.backgroundColor = _dyslexia_originalBodyStyles.backgroundColor || '';
            body.style.color = _dyslexia_originalBodyStyles.color || '';
            _dyslexia_originalBodyStyles = null;
        }
    } catch (e) { console.warn('Dyslexia mode: failed to restore body styles', e); }

    try {
        if (_dyslexia_prefsWidget) { _dyslexia_prefsWidget.remove(); _dyslexia_prefsWidget = null; }
        else { const w = document.getElementById('dyslexia-pref-widget'); if (w) w.remove(); }
    } catch (e) {}
    try { window.__DYSLEXIA_MODE_APPLIED = false; } catch (e) {}
}

export default { apply, remove };
