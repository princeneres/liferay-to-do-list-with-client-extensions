import ClayAlert from '@clayui/alert';
import ClayButton from '@clayui/button';
import {ClayInput, ClaySelectWithOption} from '@clayui/form';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import React, {useCallback, useEffect, useState} from 'react';
import {
	addTask,
	deleteTask,
	getCategories,
	getPicklist,
	getTasks,
	onChange,
	updateTask,
} from 'todo-commons';

const EMPTY_TASK = {
	categoryId: '',
	description: '',
	dueDate: '',
	priority: 'medium',
	title: '',
};

function formatDate(date) {
	return new Date(date).toLocaleDateString(
		Liferay.ThemeDisplay.getBCP47LanguageId(),
		{day: 'numeric', month: 'short', timeZone: 'UTC'}
	);
}

function toOptions(entries, labelKey) {
	return entries.map((entry) => ({
		label: entry[labelKey],
		value: String(entry.key ?? entry.id),
	}));
}

export default function TaskBoard() {
	const [categories, setCategories] = useState([]);
	const [error, setError] = useState(null);
	const [form, setForm] = useState(EMPTY_TASK);
	const [priorities, setPriorities] = useState([]);
	const [states, setStates] = useState([]);
	const [tasks, setTasks] = useState(null);

	const run = useCallback(async (action) => {
		setError(null);

		try {
			await action();
		}
		catch (error) {
			setError(error.message);
		}
	}, []);

	const loadTasks = useCallback(() => run(async () => setTasks(await getTasks())), [run]);

	useEffect(() => {
		run(async () => {
			const [categories, priorities, states] = await Promise.all([
				getCategories(),
				getPicklist('TASK_PRIORITY'),
				getPicklist('TASK_STATE'),
			]);

			setCategories(categories);
			setPriorities(priorities);
			setStates(states);
		});

		loadTasks();

		return onChange(loadTasks);
	}, [loadTasks, run]);

	const handleChange = ({target: {name, value}}) =>
		setForm((form) => ({...form, [name]: value}));

	const handleSubmit = (event) => {
		event.preventDefault();

		run(async () => {
			await addTask({
				description: form.description,
				dueDate: form.dueDate || undefined,
				priority: form.priority,
				r_categoryTasks_c_categoryId: form.categoryId
					? Number(form.categoryId)
					: undefined,
				title: form.title,
			});

			setForm(EMPTY_TASK);
		});
	};

	const getCategoryName = (task) =>
		categories.find(({id}) => id === task.r_categoryTasks_c_categoryId)
			?.name;

	return (
		<div className="todo-board">
			<form className="todo-composer" onSubmit={handleSubmit}>
				<div className="todo-composer-main">
					<label className="sr-only" htmlFor="todoTitle">
						Título
					</label>

					<ClayInput
						className="todo-composer-title"
						id="todoTitle"
						name="title"
						onChange={handleChange}
						placeholder="O que precisa ser feito?"
						required
						value={form.title}
					/>

					<ClayButton type="submit">Adicionar</ClayButton>
				</div>

				<div className="todo-composer-details">
					<div className="todo-composer-description">
						<label htmlFor="todoDescription">Descrição</label>

						<ClayInput
							id="todoDescription"
							name="description"
							onChange={handleChange}
							placeholder="Opcional"
							value={form.description}
						/>
					</div>

					<div>
						<label htmlFor="todoPriority">Prioridade</label>

						<ClaySelectWithOption
							id="todoPriority"
							name="priority"
							onChange={handleChange}
							options={toOptions(priorities, 'name')}
							value={form.priority}
						/>
					</div>

					<div>
						<label htmlFor="todoCategory">Categoria</label>

						<ClaySelectWithOption
							id="todoCategory"
							name="categoryId"
							onChange={handleChange}
							options={[
								{label: 'Sem categoria', value: ''},
								...toOptions(categories, 'name'),
							]}
							value={form.categoryId}
						/>
					</div>

					<div>
						<label htmlFor="todoDueDate">Prazo</label>

						<ClayInput
							id="todoDueDate"
							name="dueDate"
							onChange={handleChange}
							type="date"
							value={form.dueDate}
						/>
					</div>
				</div>
			</form>

			{error && (
				<ClayAlert
					displayType="danger"
					onClose={() => setError(null)}
					title="Erro"
				>
					{error}
				</ClayAlert>
			)}

			{tasks === null ? (
				<ClayLoadingIndicator />
			) : tasks.length === 0 ? (
				<p className="todo-empty">
					Nenhuma tarefa por aqui. Escreva a primeira no campo acima.
				</p>
			) : (
				<ul className="todo-list">
					{tasks.map((task) => (
						<li
							className={`todo-item todo-state-${task.state?.key}`}
							key={task.id}
						>
							<span aria-hidden="true" className="todo-item-mark" />

							<div className="todo-item-body">
								<p className="todo-item-title">{task.title}</p>

								{task.description && (
									<p className="todo-item-description">
										{task.description}
									</p>
								)}

								<p className="todo-item-meta">
									<span
										className={`todo-item-priority todo-priority-${task.priority?.key}`}
									>
										Prioridade {task.priority?.name?.toLocaleLowerCase()}
									</span>

									{getCategoryName(task) && (
										<span>{getCategoryName(task)}</span>
									)}

									{task.dueDate && (
										<span>Prazo {formatDate(task.dueDate)}</span>
									)}

									{task.integrationCode ? (
										<code>{task.integrationCode}</code>
									) : (
										<span>Integração pendente</span>
									)}
								</p>
							</div>

							<div className="todo-item-actions">
								<ClaySelectWithOption
									aria-label={`Estado de ${task.title}`}
									onChange={({target}) =>
										run(() =>
											updateTask(task.id, {
												state: target.value,
											})
										)
									}
									options={toOptions(states, 'name')}
									sizing="sm"
									value={task.state?.key}
								/>

								<ClayButton
									aria-label={`Excluir ${task.title}`}
									className="todo-item-delete"
									displayType="unstyled"
									onClick={() => run(() => deleteTask(task.id))}
									size="sm"
								>
									Excluir
								</ClayButton>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
