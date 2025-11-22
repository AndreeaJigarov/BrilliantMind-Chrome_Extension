export function initAIToolbar() {
    createToolbarUI();
    attachToolbarEvents();
}

function createToolbarUI() {
    const toolbar = document.createElement("div");
    toolbar.id = "ai-toolbar";
    toolbar.innerHTML = `
        <div id="ai-toolbar-header">
            <span>AI Assistant</span>
        </div>
        <div id="ai-toolbar-body">
            <button class="ai-action" data-action="summarize">Summarize</button>
            <button class="ai-action" data-action="highlight">Highlight</button>
            <button class="ai-action" data-action="simplify">Simplify</button>
            <button class="ai-action" data-action="explain">Explain</button>
            <button class="ai-action" data-action="flashcards">Flashcards</button>
        </div>
    `;
    const loadingCss = chrome.runtime.getURL("ai/aiLoading.css");
    const loadingLink = document.createElement("link");
    loadingLink.rel = "stylesheet";
    loadingLink.href = loadingCss;
    document.head.appendChild(loadingLink);

    const handle = document.createElement("button");
    handle.id = "ai-toolbar-handle";
    handle.textContent = "⮜";

    document.body.appendChild(toolbar);
    document.body.appendChild(handle);

    // Load CSS
    const cssPath = chrome.runtime.getURL("ai/aiToolbar.css");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssPath;
    document.head.appendChild(link);

    const outCss = chrome.runtime.getURL("ai/aiOutput.css");
    const outLink = document.createElement("link");
    outLink.rel = "stylesheet";
    outLink.href = outCss;
    document.head.appendChild(outLink);
}

function attachToolbarEvents() {
    const toolbar = document.getElementById("ai-toolbar");
    const handle = document.getElementById("ai-toolbar-handle");

    handle.addEventListener("click", () => {
        toolbar.classList.toggle("collapsed");
        handle.classList.toggle("collapsed");
        handle.textContent = toolbar.classList.contains("collapsed") ? "⮞" : "⮜";
    });

    document.querySelectorAll(".ai-action").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            runAIAction(action);
        });
    });
}

function runAIAction(action) {
    const article = document.getElementById("reader-container");
    if (!article) {
        alert("Reader Mode must be enabled for AI to work.");
        return;
    }

    const text = article.innerText;

    // disable buttons
    const buttons = document.querySelectorAll(".ai-action");
    buttons.forEach(b => {
        b.disabled = true;
        b.style.opacity = "0.5";
        b.style.cursor = "not-allowed";
    });

    showLoadingPanel();  // NEW — show spinner

    chrome.runtime.sendMessage(
        {
            type: "ai_request",
            action: action,
            text: text
        },
        response => {
            // enable buttons again
            buttons.forEach(b => {
                b.disabled = false;
                b.style.opacity = "1";
                b.style.cursor = "pointer";
            });

            if (response.success) {
                showAIResult(response.result);
            } else {
                showAIResult("⚠️ AI Error: " + response.error);
            }
        }
    );
}


function showAIResult(text) {
    let panel = document.getElementById("ai-output-panel");

    if (!panel) {
        panel = document.createElement("div");
        panel.id = "ai-output-panel";
        document.body.appendChild(panel);
    }

    panel.innerHTML = `
        <h3>AI Result</h3>
        <div>${text.replace(/\n/g, "<br>")}</div>
    `;
}
function showLoadingPanel() {
    let panel = document.getElementById("ai-output-panel");

    if (!panel) {
        panel = document.createElement("div");
        panel.id = "ai-output-panel";
        document.body.appendChild(panel);
    }

    panel.innerHTML = `
        <h3>AI Result</h3>
        <div class="ai-loading">
            <div class="ai-spinner"></div>
            <span>Processing your request...</span>
        </div>
    `;
}

