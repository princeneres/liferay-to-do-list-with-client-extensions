const COOKIE_NAME = 'todo-profile';

const current = document.cookie
	.split('; ')
	.find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
	?.split('=')[1] || 'pessoa';

fragmentElement.querySelectorAll('[data-profile]').forEach((button) => {
	button.setAttribute('aria-pressed', button.dataset.profile === current);

	button.addEventListener('click', () => {
		document.cookie = `${COOKIE_NAME}=${button.dataset.profile}; path=/; max-age=31536000; SameSite=Lax`;

		window.location.reload();
	});
});
