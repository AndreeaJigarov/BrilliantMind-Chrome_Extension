let colorBlindnessEnabled = false;
let colorBlindnessType = null; 
// null | "protanopia" | "deuteranopia" | "tritanopia"

const svgFilter = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none;" id="color-blindness-filters">
  <filter id="protanopia-filter">
    <feColorMatrix type="matrix" values="0.567,0.433,0,0,0
                                         0.558,0.442,0,0,0
                                         0,0.242,0.758,0,0
                                         0,0,0,1,0"/>
  </filter>
  <filter id="deuteranopia-filter">
    <feColorMatrix type="matrix" values="0.625,0.375,0,0,0
                                         0.7,0.3,0,0,0
                                         0,0.3,0.7,0,0
                                         0,0,0,1,0"/>
  </filter>
  <filter id="tritanopia-filter">
    <feColorMatrix type="matrix" values="0.95,0.05,0,0,0
                                         0,0.433,0.567,0,0
                                         0,0.475,0.525,0,0
                                         0,0,0,1,0"/>
  </filter>
  <filter id="none-filter">
    <feColorMatrix type="matrix" values="1,0,0,0,0
                                         0,1,0,0,0
                                         0,0,1,0,0
                                         0,0,0,1,0"/>
  </filter>
</svg>`;

if (!document.getElementById('color-blindness-filters')) {
    document.body.insertAdjacentHTML('beforeend', svgFilter);
}

//main initialization function
function initColorBlindnessMode() {
    if (!colorBlindnessEnabled || !colorBlindnessType) return;

    applyFilterByType(colorBlindnessType);

    // Observer
    new MutationObserver(() => {
        if (!colorBlindnessEnabled) return;
        applyFilterByType(colorBlindnessType);
    }).observe(document.body, { childList: true, subtree: true });
}


//apply filter based on selected type
function applyFilterByType(type) {
    let filterId = 'none-filter';
    if (type === 'protanopia') filterId = 'protanopia-filter';
    if (type === 'deuteranopia') filterId = 'deuteranopia-filter';
    if (type === 'tritanopia') filterId = 'tritanopia-filter';

    document.documentElement.style.filter = `url(#${filterId})`;
}

//remove filter
function removeColorBlindnessMode() {
    colorBlindnessType = null;
    document.documentElement.style.filter = 'none';
}

//ui and interaction
function createColorBlindnessMenu() {
    if (document.getElementById("colorblind-menu")) return;

    const menu = document.createElement("div");
    menu.id = "colorblind-menu";

    menu.style = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        padding: 14px;
        background: rgba(30,30,30,0.85);
        border-radius: 10px;
        color: white;
        font-family: sans-serif;
        width: 180px;
        display: none;
        z-index: 999999999999;
    `;

    menu.innerHTML = `
        <div style="font-size:14px; margin-bottom:8px; font-weight:bold;">
            Color Blindness Mode
        </div>

        <button data-type="protanopia" class="cb-btn">Protanopia</button>
        <button data-type="deuteranopia" class="cb-btn">Deuteranopia</button>
        <button data-type="tritanopia" class="cb-btn">Tritanopia</button>
    `;

    document.body.appendChild(menu);

    document.querySelectorAll(".cb-btn").forEach(btn => {
        btn.style = `
            width: 100%;
            padding: 8px;
            margin-bottom: 6px;
            background: #555;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        `;

        btn.addEventListener("click", () => {
            colorBlindnessType = btn.dataset.type;
            initColorBlindnessMode();
        });
    });
}

function createColorBlindnessToggle() {
    if (document.getElementById("colorblind-toggle")) return;

    const btn = document.createElement("button");
    btn.id = "colorblind-toggle";
    btn.innerText = "Color Blind: OFF";

    btn.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 14px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        background: #444;
        color: white;
        z-index: 999999999999;
        cursor: pointer;
    `;

    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
        colorBlindnessEnabled = !colorBlindnessEnabled;
        const menu = document.getElementById("colorblind-menu");

        if (colorBlindnessEnabled) {
            btn.innerText = "Color Blind: ON";
            btn.style.background = "#2a8f2a";
            menu.style.display = "block";
            if (colorBlindnessType) initColorBlindnessMode();
        } else {
            btn.innerText = "Color Blind: OFF";
            btn.style.background = "#444";
            menu.style.display = "none";
            removeColorBlindnessMode();
        }
    });
}


export function apply() {
    createColorBlindnessToggle();
    createColorBlindnessMenu();
}
