const COOKIE_NAME = 'todo-profile';

const current = document.cookie
	.split('; ')
	.find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
	?.split('=')[1] || 'pessoa';

fragmentElement.querySelectorAll('[data-profile]').forEach((button) => {
	const selected = button.dataset.profile === current;

	button.classList.toggle('btn-primary', selected);
	button.classList.toggle('btn-secondary', !selected);
	button.setAttribute('aria-pressed', selected);

	button.addEventListener('click', () => {
		document.cookie = `${COOKIE_NAME}=${button.dataset.profile}; path=/; max-age=31536000; SameSite=Lax`;

		window.location.reload();
	});
});
