(function () {
	const STORAGE_KEY = 'todo-accessibility';
	const TOOLBAR_ID = 'todoAccessibilityToolbar';

	const root = document.documentElement;

	function read() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
		}
		catch {
			return {};
		}
	}

	const settings = {contrast: false, fontScale: 1, ...read()};

	function apply() {
		root.classList.toggle('todo-high-contrast', settings.contrast);
		root.style.fontSize =
			settings.fontScale === 1 ? '' : `${settings.fontScale * 100}%`;

		document
			.querySelector(`#${TOOLBAR_ID} [data-action="contrast"]`)
			?.setAttribute('aria-pressed', settings.contrast);

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		}
		catch {
			// Private browsing: the settings just won't persist.
		}
	}

	const ACTIONS = [
		{
			action: 'decrease',
			label: 'A-',
			run: () => (settings.fontScale = Math.max(0.875, settings.fontScale - 0.125)),
			title: 'Diminuir fonte',
		},
		{
			action: 'increase',
			label: 'A+',
			run: () => (settings.fontScale = Math.min(1.5, settings.fontScale + 0.125)),
			title: 'Aumentar fonte',
		},
		{
			action: 'contrast',
			label: 'Contraste',
			run: () => (settings.contrast = !settings.contrast),
			title: 'Alto contraste',
		},
	];

	function render() {
		if (document.getElementById(TOOLBAR_ID)) {
			return;
		}

		const toolbar = document.createElement('div');

		toolbar.className = 'todo-accessibility-toolbar';
		toolbar.id = TOOLBAR_ID;
		toolbar.setAttribute('aria-label', 'Acessibilidade');
		toolbar.setAttribute('role', 'toolbar');

		for (const {action, label, run, title} of ACTIONS) {
			const button = document.createElement('button');

			button.dataset.action = action;
			button.setAttribute('aria-label', title);
			button.textContent = label;
			button.title = title;
			button.type = 'button';

			button.addEventListener('click', () => {
				run();
				apply();
			});

			toolbar.appendChild(button);
		}

		document.body.appendChild(toolbar);

		apply();
	}

	apply();

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', render);
	}
	else {
		render();
	}
})();
