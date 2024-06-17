const fs = require('fs');
const path = require('path');

const idPath = path.join(__dirname, '..', 'data', 'idCounter.json');

// Lire le compteur depuis le fichier
const readCounter = () => {
    if (!fs.existsSync(idPath)) {
        fs.writeFileSync(idPath, JSON.stringify({ taskId: 0, candidatureId: 0 }));
    }
    
    const data = fs.readFileSync(idPath, 'utf-8');
    return JSON.parse(data);
};

// Écrire le compteur dans le fichier
const writeCounter = (counter) => {
    fs.writeFileSync(idPath, JSON.stringify(counter, null, 2));
};

// Obtenir un nouvel identifiant pour les tâches
const getNewTaskId = () => {
    const counter = readCounter();
    counter.taskId += 1;

    writeCounter(counter);

    return counter.taskId;
};

// Obtenir un nouvel identifiant pour les candidatures
const getNewCandidatureId = () => {
    const counter = readCounter();
    counter.candidatureId += 1;

    writeCounter(counter);

    return counter.candidatureId;
};

module.exports = { getNewTaskId, getNewCandidatureId, readCounter, writeCounter };