export function apply() {
	console.log("Autism module activated: applying color-reduction styles");

	const styleId = "autism-color-reduction-style";

	function enable() {
		if (document.getElementById(styleId)) return;

		fetch(chrome.runtime.getURL("affections/autism/styles.css"))
			.then(r => r.text())
			.then(css => {
				const style = document.createElement("style");
				style.id = styleId;
				style.textContent = css;
				document.head.appendChild(style);
				document.documentElement.classList.add("autism-color-reduced");
			})
			.catch(err => console.error("Failed to load autism styles:", err));
	}

	function disable() {
		const style = document.getElementById(styleId);
		if (style) style.remove();
		document.documentElement.classList.remove("autism-color-reduced");
	}

	function toggle() {
		if (document.getElementById(styleId)) disable(); else enable();
	}

	// Expose a small API on window so popup or other scripts can toggle the effect
	try {
		window.__autismAccessibility = window.__autismAccessibility || {};
		window.__autismAccessibility.enable = enable;
		window.__autismAccessibility.disable = disable;
		window.__autismAccessibility.toggle = toggle;
		window.__autismAccessibility.enabled = () => !!document.getElementById(styleId);
	} catch (e) {
		// ignore if pages forbid assigning to window
	}

	// Enable by default when module is applied
	enable();
}

