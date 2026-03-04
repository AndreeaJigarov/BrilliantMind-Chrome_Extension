// dyslexia/applyDyslexia.js

let dyslexiaFilterActive = false;
let filterLevel = 0; // 0: Cream, 1: Off-White, 2: Soft Peach

const filterColors = [
    //"rgba(247, 240, 207, 0.45)", // Cream
    // "rgba(255, 255, 220, 0.4)", // Off-White
    "rgba(251, 205, 159, 0.59)"  // Soft Peach
];

const filterNames = ["ON", "Off-White", "Soft Peach"];

function updateFilterUI() {
    const filter = document.getElementById("dyslexia-calming-filter");
    const btn = document.getElementById("dyslexia-toggle-btn");
    
    if (!filter || !btn) return;

    if (dyslexiaFilterActive) {
        filter.style.display = "block";
        filter.style.backgroundColor = filterColors[filterLevel];
        btn.innerText = `Filter: ${filterNames[filterLevel]}`;
        btn.style.background = "#2a8f2a"; // Green for ON
    } else {
        filter.style.display = "none";
        btn.innerText = "Filter: OFF";
        btn.style.background = "#444"; // Grey for OFF
    }
}

function initDyslexiaFilter() {
    if (document.getElementById("dyslexia-calming-filter")) return;

    const filter = document.createElement("div");
    filter.id = "dyslexia-calming-filter";
    
    // Max z-index and fixed position to cover Wikipedia completely
    filter.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        mix-blend-mode: multiply !important;
        display: none;
    `;
    
    document.documentElement.appendChild(filter);
}

function createDyslexiaToggle() {
    if (document.getElementById("dyslexia-toggle-btn")) return;

    const btn = document.createElement("button");
    btn.id = "dyslexia-toggle-btn";
    btn.innerText = "Dyslexia Filter: OFF";
    
    // Using colleague's styling from applyEpilepsy.js
    btn.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        padding: 10px 14px !important;
        border-radius: 8px !important;
        border: none !important;
        background: #444 !important;
        color: white !important;
        cursor: pointer !important;
        z-index: 2147483647 !important;
        font-family: sans-serif !important;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
    `;

    document.documentElement.appendChild(btn);

    btn.addEventListener("click", () => {
        if (!dyslexiaFilterActive) {
            dyslexiaFilterActive = true;
            filterLevel = 0;
        } else {
            filterLevel++;
            if (filterLevel >= filterColors.length) {
                dyslexiaFilterActive = false;
            }
        }
        updateFilterUI();
    });
}

function splitLongParagraphs() {
    const paragraphs = document.querySelectorAll('html.dyslexia-mode p');
    paragraphs.forEach(p => {
        if (p.dataset.splitProcessed === "true" || p.innerText.length < 250) return;
        const text = p.innerText;
        const sentences = text.match(/[^.!?]+[.!?]+/g);
        if (sentences && sentences.length > 3) {
            p.innerHTML = ''; 
            p.dataset.splitProcessed = "true";
            for (let i = 0; i < sentences.length; i += 2) {
                const chunk = sentences.slice(i, i + 2).join(' ');
                const newP = document.createElement('span');
                newP.innerText = chunk;
                newP.style.display = "block";
                newP.style.marginBottom = "1.8em";
                p.appendChild(newP);
            }
        }
    });
}

// ... existing variables (dyslexiaFilterActive, filterLevel, etc.)

export function apply() {
    document.documentElement.classList.add('dyslexia-mode');
    
    if (!document.getElementById('dyslexia-dynamic-style')) {
        const style = document.createElement('style');
        style.id = 'dyslexia-dynamic-style';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Lexend&display=swap');
            
            html.dyslexia-mode body, html.dyslexia-mode p { 
                font-family: 'Lexend', sans-serif !important;
                font-size: 18px !important; 
                word-spacing: 0.3em !important;
                line-height: 1.9 !important;
                color: #2c2c2c !important;
            }

            /* Deep Blue Links, Bolded, No Underline */
            html.dyslexia-mode a {
                color: #002247 !important; /* Deep Blue */
                text-decoration: none !important;
                font-weight: bold !important;
                font-family: 'Lexend', sans-serif !important;
            }

            html.dyslexia-mode i, html.dyslexia-mode em { 
                font-style: normal !important; 
                font-weight: 700 !important; 
            }
        `;
        document.head.appendChild(style);
    }

    initDyslexiaFilter();
    createDyslexiaToggle();
    splitLongParagraphs();
}