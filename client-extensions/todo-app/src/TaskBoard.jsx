import ClayAlert from '@clayui/alert';
import ClayButton from '@clayui/button';
import ClayForm, {ClayInput, ClaySelectWithOption} from '@clayui/form';
import ClayLabel from '@clayui/label';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import ClayTable from '@clayui/table';
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

import {PRIORITY_DISPLAY_TYPES} from './displayTypes.js';

const EMPTY_TASK = {
	categoryId: '',
	description: '',
	dueDate: '',
	priority: 'medium',
	title: '',
};

function formatDate(date) {
	return date
		? new Date(date).toLocaleDateString(undefined, {timeZone: 'UTC'})
		: '—';
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
			?.name ?? '—';

	return (
		<div className="todo-app">
			<ClayForm className="card card-body mb-4" onSubmit={handleSubmit}>
				<div className="row">
					<ClayForm.Group className="col-md-4">
						<label htmlFor="todoTitle">Título</label>

						<ClayInput
							id="todoTitle"
							name="title"
							onChange={handleChange}
							required
							value={form.title}
						/>
					</ClayForm.Group>

					<ClayForm.Group className="col-md-8">
						<label htmlFor="todoDescription">Descrição</label>

						<ClayInput
							id="todoDescription"
							name="description"
							onChange={handleChange}
							value={form.description}
						/>
					</ClayForm.Group>

					<ClayForm.Group className="col-md-3">
						<label htmlFor="todoPriority">Prioridade</label>

						<ClaySelectWithOption
							id="todoPriority"
							name="priority"
							onChange={handleChange}
							options={toOptions(priorities, 'name')}
							value={form.priority}
						/>
					</ClayForm.Group>

					<ClayForm.Group className="col-md-3">
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
					</ClayForm.Group>

					<ClayForm.Group className="col-md-3">
						<label htmlFor="todoDueDate">Prazo</label>

						<ClayInput
							id="todoDueDate"
							name="dueDate"
							onChange={handleChange}
							type="date"
							value={form.dueDate}
						/>
					</ClayForm.Group>

					<div className="align-items-end col-md-3 d-flex form-group">
						<ClayButton block type="submit">
							Adicionar tarefa
						</ClayButton>
					</div>
				</div>
			</ClayForm>

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
			) : (
				<ClayTable hover responsive>
					<ClayTable.Head>
						<ClayTable.Row>
							<ClayTable.Cell headingCell>Título</ClayTable.Cell>
							<ClayTable.Cell headingCell>Categoria</ClayTable.Cell>
							<ClayTable.Cell headingCell>Prioridade</ClayTable.Cell>
							<ClayTable.Cell headingCell>Estado</ClayTable.Cell>
							<ClayTable.Cell headingCell>Prazo</ClayTable.Cell>
							<ClayTable.Cell headingCell>Integração</ClayTable.Cell>
							<ClayTable.Cell headingCell />
						</ClayTable.Row>
					</ClayTable.Head>

					<ClayTable.Body>
						{tasks.map((task) => (
							<ClayTable.Row key={task.id}>
								<ClayTable.Cell expanded headingTitle>
									{task.title}

									{task.description && (
										<div className="small text-secondary">
											{task.description}
										</div>
									)}
								</ClayTable.Cell>

								<ClayTable.Cell>{getCategoryName(task)}</ClayTable.Cell>

								<ClayTable.Cell>
									<ClayLabel
										displayType={
											PRIORITY_DISPLAY_TYPES[task.priority?.key]
										}
									>
										{task.priority?.name}
									</ClayLabel>
								</ClayTable.Cell>

								<ClayTable.Cell>
									<ClaySelectWithOption
										aria-label="Estado"
										onChange={({target}) =>
											run(() =>
												updateTask(task.id, {
													state: target.value,
												})
											)
										}
										options={toOptions(states, 'name')}
										sizing="sm"
										style={{minWidth: '10rem'}}
										value={task.state?.key}
									/>
								</ClayTable.Cell>

								<ClayTable.Cell>{formatDate(task.dueDate)}</ClayTable.Cell>

								<ClayTable.Cell className="text-nowrap">
									<code>{task.integrationCode || '—'}</code>
								</ClayTable.Cell>

								<ClayTable.Cell>
									<ClayButton
										displayType="secondary"
										onClick={() => run(() => deleteTask(task.id))}
										size="sm"
									>
										Excluir
									</ClayButton>
								</ClayTable.Cell>
							</ClayTable.Row>
						))}
					</ClayTable.Body>
				</ClayTable>
			)}
		</div>
	);
}
