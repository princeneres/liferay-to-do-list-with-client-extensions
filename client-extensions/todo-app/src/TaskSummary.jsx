import ClayAlert from '@clayui/alert';
import React, {useEffect, useState} from 'react';
import {getPicklist, getTasks, onChange} from 'todo-commons';

export default function TaskSummary() {
	const [error, setError] = useState(null);
	const [states, setStates] = useState([]);
	const [tasks, setTasks] = useState([]);

	useEffect(() => {
		const loadTasks = () =>
			getTasks()
				.then(setTasks)
				.catch((error) => setError(error.message));

		getPicklist('TASK_STATE')
			.then(setStates)
			.catch((error) => setError(error.message));

		loadTasks();

		return onChange(loadTasks);
	}, []);

	if (error) {
		return <ClayAlert displayType="danger">{error}</ClayAlert>;
	}

	const counts = states.map((state) => ({
		...state,
		count: tasks.filter((task) => task.state?.key === state.key).length,
	}));

	const doneCount = counts.find(({key}) => key === 'done')?.count ?? 0;

	return (
		<section aria-label="Resumo das tarefas" className="todo-summary">
			<p className="todo-summary-headline">
				<strong>{doneCount}</strong> de {tasks.length} concluídas
			</p>

			<div aria-hidden="true" className="todo-summary-bar">
				{counts.map(
					(state) =>
						state.count > 0 && (
							<span
								className={`todo-state-${state.key}`}
								key={state.key}
								style={{flexGrow: state.count}}
							/>
						)
				)}
			</div>

			<ul className="todo-summary-legend">
				{counts.map((state) => (
					<li key={state.key}>
						<span
							aria-hidden="true"
							className={`todo-summary-dot todo-state-${state.key}`}
						/>

						<strong>{state.count}</strong>

						{state.name}
					</li>
				))}
			</ul>
		</section>
	);
}
