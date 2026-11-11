import ClayAlert from '@clayui/alert';
import ClayLabel from '@clayui/label';
import React, {useEffect, useState} from 'react';
import {getPicklist, getTasks, onChange} from 'todo-commons';

import {STATE_DISPLAY_TYPES} from './displayTypes.js';

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

	return (
		<div className="row">
			{states.map((state) => (
				<div className="col-md-4" key={state.key}>
					<div className="card card-body text-center">
						<div className="display-4">
							{tasks.filter((task) => task.state?.key === state.key).length}
						</div>

						<ClayLabel displayType={STATE_DISPLAY_TYPES[state.key]}>
							{state.name}
						</ClayLabel>
					</div>
				</div>
			))}
		</div>
	);
}
