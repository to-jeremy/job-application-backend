const fs = require('fs');
const path = require('path');

const tasksPath = path.join(__dirname, '../data/taches.json');
const candidaturesPath = path.join(__dirname, '../data/candidatures.json');

const readData = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Erreur lors de la lecture du fichier ${filePath}:`, err);
        return [];
    }
};

const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Erreur lors de l'écriture du fichier ${filePath}:`, err);
    }
};

const readTasks = () => readData(tasksPath);
const writeTasks = (data) => writeData(tasksPath, data);
const readCandidatures = () => readData(candidaturesPath);
const writeCandidatures = (data) => writeData(candidaturesPath, data);

module.exports = { readTasks, writeTasks, readCandidatures, writeCandidatures };