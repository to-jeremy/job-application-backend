const { readCandidatures, writeCandidatures } = require('../utils/fileHandler');
const { getNewCandidatureId } = require('../utils/idGenerator');

const getCandidatures = (req, res) => {
    const candidatures = readCandidatures();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < candidatures.length) {
        results.next = {
            page: page + 1,
            limit: limit
        };
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        };
    }

    results.totalCandidatures = candidatures.length;
    results.displayedCandidatures = candidatures.slice(startIndex, endIndex);
    results.currentCount = results.displayedCandidatures.length;

    res.json(results);
};

const createCandidature = (req, res) => {
    const candidatures = readCandidatures();
    const newCandidature = { id: getNewCandidatureId(), ...req.body };

    candidatures.push(newCandidature);
    writeCandidatures(candidatures);

    res.json(newCandidature);
};

const updateCandidature = (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;
    let candidatures = readCandidatures();

    const candidatureIndex = candidatures.findIndex(c => c.id === parseInt(id));

    if (candidatureIndex === -1) {
        return res.status(404).json({ error: 'Candidature non trouvée.' });
    }

    // Vérifier si la candidature provient de la ToDo List
    if (candidatures[candidatureIndex].isFromTodoList) {
        const restrictedFields = ['id', 'company', 'position', 'link', 'email', 'date', 'location'];
        const isRestrictedField = Object.keys(updatedFields).some(field => restrictedFields.includes(field));

        if (isRestrictedField) {
            return res.status(403).json({ error: 'Modification non autorisée pour les champs sensibles des candidatures provenant de la ToDo List.' });
        }
    }

    const updatedCandidature = { ...candidatures[candidatureIndex], ...updatedFields };
    candidatures[candidatureIndex] = updatedCandidature;

    writeCandidatures(candidatures);

    res.json(updatedCandidature);
};

module.exports = { getCandidatures, createCandidature, updateCandidature };