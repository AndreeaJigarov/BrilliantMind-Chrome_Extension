export function apply() {
    // --- CSS ---
    const style = document.createElement("style");
    style.id = "simplify-style";
    style.textContent = `
        header, footer, nav { display: none !important; }

        a, a:visited {
            background-color: #E3F2FD !important;
            color: #1565C0 !important;
            border-radius: 4px;
            padding: 2px 4px;
            text-decoration: underline !important;
        }
        a:hover, a:focus {
            background-color: #BBDEFB !important;
            color: #0D47A1 !important;
        }

        p.adhd-focus { opacity: 1 !important; color: #111 !important; }
        p:not(.adhd-focus) {
            opacity: 0.4 !important;
            color: transparent !important;
            text-shadow: 0 0 8px #aaa !important;
            transition: opacity 0.25s, color 0.25s;
        }

        figure, figure *, img, video { opacity: 1 !important; filter: none !important; text-shadow: none !important; }

        body { background: #fff !important; }

        /* Table of Contents as table */
        #adhd-summary {
            border: 1px solid #ccc;
            padding: 12px;
            margin-bottom: 24px;
            background: #f9f9f9;
            font-family: sans-serif;
        }
        #adhd-summary h2 { margin-top: 0; font-size: 1.2em; }
        #adhd-summary table { width: 100%; border-collapse: collapse; }
        #adhd-summary td { padding: 4px 8px; border-bottom: 1px solid #ddd; }
    `;
    document.head.appendChild(style);

    // --- Create Table of Contents ---
    const summary = document.createElement("div");
    summary.id = "adhd-summary";

    const title = document.createElement("h2");
    title.innerText = "Summary";
    summary.appendChild(title);

    const table = document.createElement("table");

    const headers = Array.from(document.querySelectorAll("h1, h2, h3, h4"));
    headers.forEach(h => {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        // indent based on header level
        const level = parseInt(h.tagName.substring(1)) - 1;
        cell.style.paddingLeft = `${(level - 1) * 16}px`;
        cell.innerText = h.innerText;
        row.appendChild(cell);
        table.appendChild(row);
    });

    summary.appendChild(table);

    const firstElement = document.body.firstElementChild;
    document.body.insertBefore(summary, firstElement);

    // --- Paragraph focus system ---
    const paragraphs = Array.from(document.querySelectorAll("p"));
    if (!paragraphs.length) return;
    let current = 0;

    function setFocus(idx) {
        paragraphs.forEach((p, i) => p.classList.toggle("adhd-focus", i === idx));
        paragraphs[idx].scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setFocus(current);

    function nextPara() { if (current < paragraphs.length - 1) { current++; setFocus(current); } }
    function prevPara() { if (current > 0) { current--; setFocus(current); } }

    window.addEventListener("keydown", e => {
        if (e.key === "ArrowDown" || e.key === "PageDown") { nextPara(); e.preventDefault(); }
        if (e.key === "ArrowUp" || e.key === "PageUp") { prevPara(); e.preventDefault(); }
    });

    let lastScroll = 0;
    window.addEventListener("wheel", e => {
        const now = Date.now();
        if (now - lastScroll < 300) return;
        if (e.deltaY > 0) nextPara();
        else prevPara();
        lastScroll = now;
    }, { passive: false });

    // --- GIF pausing system ---
    async function getStaticFrame(img) {
        return new Promise(resolve => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const tempImg = new Image();
            tempImg.crossOrigin = "anonymous";
            tempImg.src = img.src;
            tempImg.onload = () => {
                canvas.width = tempImg.width;
                canvas.height = tempImg.height;
                try { ctx.drawImage(tempImg, 0, 0); resolve(canvas.toDataURL("image/png")); }
                catch { resolve(null); }
            };
            tempImg.onerror = () => resolve(null);
        });
    }

    async function replaceGif(img) {
        const staticSrc = await getStaticFrame(img);
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        wrapper.style.cursor = "pointer";

        const staticImg = document.createElement("img");
        staticImg.src = staticSrc || img.src;
        staticImg.style.width = img.width + "px";

        const overlay = document.createElement("div");
        overlay.innerText = "⚠ GIF – Click to play";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.55)";
        overlay.style.color = "white";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.fontSize = "14px";
        overlay.style.fontFamily = "sans-serif";

        wrapper.appendChild(staticImg);
        wrapper.appendChild(overlay);
        img.replaceWith(wrapper);

        let playing = false;
        wrapper.addEventListener("click", () => {
            if (!playing) {
                staticImg.src = img.src; // start GIF
                overlay.innerText = "✋ Click to stop";
                overlay.style.background = "rgba(0,0,0,0.35)";
            } else {
                staticImg.src = staticSrc; // stop GIF
                overlay.innerText = "⚠ GIF – Click to play";
                overlay.style.background = "rgba(0,0,0,0.55)";
            }
            playing = !playing;
        });
    }

    function detectAndReplaceAllGifs() {
        document.querySelectorAll("img").forEach(img => {
            if (img.src.toLowerCase().endsWith(".gif") && !img.dataset.gifReplaced) {
                img.dataset.gifReplaced = "true";
                replaceGif(img);
            }
        });
    }

    detectAndReplaceAllGifs();
    new MutationObserver(() => detectAndReplaceAllGifs())
        .observe(document.body, { subtree: true, childList: true });
}
