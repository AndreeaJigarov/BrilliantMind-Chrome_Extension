export function apply() {
	console.log("Autism module activated: applying color-reduction styles");
	const styleId = "autism-color-reduction-style";


		// Do not inject CSS dynamically here — the rules live in styles.css.
		function enableHideExtras() {
			document.documentElement.classList.add('autism-hide-extras');
		}

		function disableHideExtras() {
			document.documentElement.classList.remove('autism-hide-extras');
		}

		function toggleHideExtras() {
			document.documentElement.classList.toggle('autism-hide-extras');
		}

		function enableVerticalLayout() {
			document.documentElement.classList.add('autism-vertical-layout');
		}

		function disableVerticalLayout() {
			document.documentElement.classList.remove('autism-vertical-layout');
		}

		function toggleVerticalLayout() {
			document.documentElement.classList.toggle('autism-vertical-layout');
		}

		// ad-blocking removed: autism mode will no longer attempt DOM-based ad removal.

	function enable() {
		if (document.getElementById(styleId)) return;

		const link = document.createElement('link');
		link.id = styleId;
		link.rel = 'stylesheet';
		link.href = chrome.runtime.getURL('affections/autism/styles.css');
		document.head.appendChild(link);
		document.documentElement.classList.add('autism-color-reduced');
		// Apply hide-extras and vertical layout by default
		enableHideExtras();
		enableVerticalLayout();
		// No DOM-based ad blocking in autism view (conservative approach).
	}

	function disable() {
		const style = document.getElementById(styleId);
		if (style) style.remove();
		document.documentElement.classList.remove("autism-color-reduced");
		// Revert extras/layout when disabling
		disableHideExtras();
		disableVerticalLayout();
		// Nothing to stop: no DOM-based ad blocking active.
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

		// expose hide-extras and vertical layout controls
		window.__autismAccessibility.enableHideExtras = enableHideExtras;
		window.__autismAccessibility.disableHideExtras = disableHideExtras;
		window.__autismAccessibility.toggleHideExtras = toggleHideExtras;
		window.__autismAccessibility.hideExtrasEnabled = () => document.documentElement.classList.contains('autism-hide-extras');

		window.__autismAccessibility.enableVerticalLayout = enableVerticalLayout;
		window.__autismAccessibility.disableVerticalLayout = disableVerticalLayout;
		window.__autismAccessibility.toggleVerticalLayout = toggleVerticalLayout;
		window.__autismAccessibility.verticalLayoutEnabled = () => document.documentElement.classList.contains('autism-vertical-layout');

		// No ad controls exposed for autism module.
	} catch (e) {
		// ignore if pages forbid assigning to window
	}

	// Enable by default when module is applied
	enable();
}




