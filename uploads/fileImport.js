const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const importFile = (file, res) => {
    const filePath = path.join(__dirname, '..', 'uploads', file.filename);

    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Charger les données existantes du fichier candidatures.json
        const candidaturesFilePath = path.join(__dirname, '..', 'data', 'candidatures.json');
        const idCounterPath = path.join(__dirname, '..', 'data', 'idCounter.json');

        let existingData = [];
        try {
            existingData = JSON.parse(fs.readFileSync(candidaturesFilePath, 'utf8'));
        } catch (error) {
            console.error('Erreur lors de la lecture des données existantes :', error);
        }

        // Trouver le dernier ID existant dans les données existantes
        /*let lastId = 0;
        if (existingData.length > 0) {
            lastId = existingData[existingData.length - 1].id;
        }*/

        const counterData = JSON.parse(fs.readFileSync(idCounterPath, 'utf-8'));
        let nextId = counterData.candidatureId + 1;

        const excelDateToJSDate = (serial) => {
            const millisecondsPerDay = 24 * 60 * 60 * 1000;
            const daysSinceEpoch = serial - 1; // Excel date serials are 1-based
            const epoch = Date.parse('1900-01-01'); // Date.parse returns milliseconds since Jan 1, 1970 (epoch)
            const offsetMilliseconds = daysSinceEpoch * millisecondsPerDay;

            return new Date(epoch + offsetMilliseconds);
        };

        const formatDate = (serial) => {
            const date = excelDateToJSDate(serial);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        };

        // Transformer les données en format souhaité et attribuer les nouveaux IDs
        const transformedData = jsonData.map((entry, index) => ({
            id: nextId + index,
            company: entry["Nom entreprise"] || '',
            position: entry["Nom du poste"] || '',
            link: entry["Lien internet du poste"] || '',
            email: entry["Email"] || '',
            date: formatDate(entry["Date postulé"]) || '',
            location: entry["Lieu"] || '',
            received: entry["Candidature reçu"] || '',
            tests: entry["Tests internet"] || '',
            call: entry["Appel"] || '',
            interview: entry["Entretien"] || '',
            status: entry["Status"] || '',
            isFromTodoList: false
        }));

        // Filtrer les données pour éviter les doublons
        const mergedData = [...existingData];

        transformedData.forEach(newCandidature => {
            const exists = mergedData.some(existingCandidature =>
                existingCandidature.company === newCandidature.company &&
                existingCandidature.link === newCandidature.link &&
                existingCandidature.date === newCandidature.date
            );

            if (!exists) {
                mergedData.push(newCandidature);
            }
        });

        // Enregistrer les données fusionnées dans le fichier candidatures.json
        fs.writeFileSync(candidaturesFilePath, JSON.stringify(mergedData, null, 2));

        // Mettre à jour le compteur candidatureId dans le fichier idCounter.json
        counterData.candidatureId = nextId + transformedData.length - 1;

        // Mettre à jour le compteur taskId dans le fichier idCounter.json
        counterData.taskId = nextId + transformedData.length - 1;
        fs.writeFileSync(idCounterPath, JSON.stringify(counterData, null, 2));

        // Supprimer le fichier une fois qu'il a été traité
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Erreur lors de la suppression du fichier :', err);
            }
        });

        // Envoyer une réponse au client
        res.status(200).json({ message: 'Fichier importé avec succès.' });
    } catch (error) {
        console.error('Une erreur s\'est produite lors de l\'importation du fichier :', error);
        res.status(500).json({ message: 'Une erreur s\'est produite lors de l\'importation du fichier.' });
    }
};

module.exports = { importFile };