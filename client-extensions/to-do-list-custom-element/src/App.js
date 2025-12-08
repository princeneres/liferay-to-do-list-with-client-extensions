import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Form from "./components/Form";
import Grid from "./components/Grid";
import { getPriorityList, getTasks } from "./commons/api";
import "react-toastify/dist/ReactToastify.css";

function App({ appTitle = "To-Do List" }) {
    const [tasks, setTasks] = useState([]);
    const [priorities, setPriorities] = useState([
        { key: "low", label: "Low" },
        { key: "medium", label: "Medium" },
        { key: "high", label: "High" },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            const [fetchedTasks, fetchedPriorities] = await Promise.all([
                getTasks(),
                getPriorityList(),
            ]);
            setTasks(fetchedTasks);
            setPriorities(fetchedPriorities);
        };

        fetchData();
    }, []);

    return (
        <div className="App">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-5">
                <h2 className="text-2xl font-bold">{appTitle}</h2>
                <Form
                    tasks={tasks}
                    priorities={priorities}
                    setTasks={setTasks}
                />
                <Grid
                    tasks={tasks}
                    priorities={priorities}
                    setTasks={setTasks}
                />
            </div>
            <ToastContainer autoClose={3000} position="top-center" />
        </div>
    );
}

export default App;
