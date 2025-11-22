export function initAIToolbar() {
    console.log("AI Toolbar initialized");

    createToolbarUI();
    attachToolbarEvents();
}

/* -----------------------------------------
   Create the toolbar HTML structure
----------------------------------------- */
function createToolbarUI() {

    // TOOLBAR ELEMENT
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

    // HANDLE BUTTON (separate!)
    const handle = document.createElement("button");
    handle.id = "ai-toolbar-handle";
    handle.textContent = "⮞";

    document.body.appendChild(toolbar);
    document.body.appendChild(handle);

    // load CSS
    const cssPath = chrome.runtime.getURL("ai/aiToolbar.css");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssPath;
    document.head.appendChild(link);
}


/* -----------------------------------------
   Add behavior (collapse / expand)
----------------------------------------- */
function attachToolbarEvents() {
    const toolbar = document.getElementById("ai-toolbar");
    const handle = document.getElementById("ai-toolbar-handle");

handle.addEventListener("click", () => {
    toolbar.classList.toggle("collapsed");
    handle.classList.toggle("collapsed");

    // REVERSED ARROW
    handle.textContent = toolbar.classList.contains("collapsed") ? "⮞" : "⮜";
});


    document.querySelectorAll(".ai-action").forEach(btn => {
        btn.addEventListener("click", () => {
            runAIAction(btn.dataset.action);
        });
    });
}



/* -----------------------------------------
   Placeholder for AI behavior
----------------------------------------- */
function runAIAction(action) {
    console.log("AI action requested:", action);

    // TODO: integrate with actual OpenAI / API call
    alert(`AI will now: ${action}`);
}
