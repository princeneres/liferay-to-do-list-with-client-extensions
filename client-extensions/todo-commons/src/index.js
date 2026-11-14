const CATEGORIES_URL = '/o/c/categories';
const TASKS_URL = '/o/c/tasks';
const CHANGE_EVENT = 'todo:changed';

function getErrorMessage(data) {
	try {
		return JSON.parse(data.detail)
			.map(({errorMessage}) => errorMessage)
			.join(' ');
	}
	catch {
		return data.title || data.detail || 'Unexpected error';
	}
}

async function request(url, {body, method = 'GET'} = {}) {
	const response = await Liferay.Util.fetch(url, {
		body: body && JSON.stringify(body),
		headers: {
			'Accept': 'application/json',
			'Accept-Language': Liferay.ThemeDisplay.getBCP47LanguageId(),
			'Content-Type': 'application/json',
		},
		method,
	});

	if (response.status === 204) {
		return null;
	}

	const data = await response.json();

	if (!response.ok) {
		throw new Error(getErrorMessage(data));
	}

	return data;
}

function notifyChange() {
	Liferay.fire(CHANGE_EVENT);
}

export async function getCategories() {
	const {items} = await request(`${CATEGORIES_URL}?pageSize=100&sort=name:asc`);

	return items;
}

export async function getPicklist(externalReferenceCode) {
	const {listTypeEntries} = await request(
		`/o/headless-admin-list-type/v1.0/list-type-definitions/by-external-reference-code/${externalReferenceCode}`
	);

	const languageId = Liferay.ThemeDisplay.getBCP47LanguageId();

	// This admin API ignores Accept-Language: name is always the default locale.

	return listTypeEntries.map((entry) => ({
		...entry,
		name: entry.name_i18n?.[languageId] ?? entry.name,
	}));
}

export async function getTasks() {
	const {items} = await request(
		`${TASKS_URL}?pageSize=200&sort=dateCreated:desc`
	);

	return items;
}

export async function addTask(task) {
	const created = await request(TASKS_URL, {body: task, method: 'POST'});

	notifyChange();

	return created;
}

export async function updateTask(id, changes) {
	const updated = await request(`${TASKS_URL}/${id}`, {
		body: changes,
		method: 'PATCH',
	});

	notifyChange();

	return updated;
}

export async function deleteTask(id) {
	await request(`${TASKS_URL}/${id}`, {method: 'DELETE'});

	notifyChange();
}

export function onChange(callback) {
	const handle = Liferay.on(CHANGE_EVENT, callback);

	return () => handle.detach();
}
