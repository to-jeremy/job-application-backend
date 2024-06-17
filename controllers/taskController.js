const { readTasks, writeTasks, readCandidatures, writeCandidatures } = require('../utils/fileHandler');
const { getNewTaskId, readCounter, writeCounter } = require('../utils/idGenerator');

const getTasks = (req, res) => {
    res.json(readTasks());
};

const createTask = (req, res) => {
    const tasks = readTasks();
    const newTask = { id: getNewTaskId(), ...req.body };

    tasks.push(newTask);
    writeTasks(tasks);

    // Mettre à jour le compteur candidatureId
    const counterData = readCounter();
    counterData.candidatureId += 1;
    writeCounter(counterData);

    // Si la tâche est marquée comme "faite", l'ajouter au fichier des candidatures
    if (newTask.candidatureFait) {
        const candidatureData = { ...newTask };
        candidatureData.id = newTask.id; // Utiliser le même ID que la tâche

        const candidatures = readCandidatures();
        candidatures.push(candidatureData);

        writeCandidatures(candidatures);
    }

    res.json(newTask);
};

const updateTask = (req, res) => {
    const taskId = parseInt(req.params.id);
    const updatedTaskData = req.body;
    let tasks = readTasks();

    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTaskData };
        writeTasks(tasks);

        let candidatures = readCandidatures();
        const candidatureIndex = candidatures.findIndex(cand => cand.id === taskId);

        if (updatedTaskData.candidatureFait) {
            if (candidatureIndex === -1) {
                const newCandidature = { ...tasks[taskIndex] };

                newCandidature.id = taskId; // Utiliser le même ID que la tâche
                
                candidatures.push(newCandidature);
            }
        } else {
            if (candidatureIndex !== -1) {
                candidatures.splice(candidatureIndex, 1);
            }
        }
        writeCandidatures(candidatures);

        res.json({ message: 'La tâche est mise à jour avec succès.' });
    } else {
        res.status(404).json({ message: 'Tâche inexistante.' });
    }
};

const deleteTask = (req, res) => {
    const taskId = parseInt(req.params.id);
    let tasks = readTasks();

    tasks = tasks.filter(task => task.id !== taskId);
    writeTasks(tasks);

    let candidatures = readCandidatures();
    candidatures = candidatures.filter(cand => cand.id !== taskId);
    writeCandidatures(candidatures);

    res.json({ message: 'La tâche est supprimée avec succès.' });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };