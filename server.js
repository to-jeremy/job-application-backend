const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const candidatureRoutes = require('./routes/candidatureRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { importFile } = require('./uploads/fileImport');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

app.use('/api/candidatures', candidatureRoutes);
app.use('/api/tasks', taskRoutes);

//Pour les fichiers candidatures.json et taches.json
app.post('/api/upload', upload.single('file'), (req, res) => {
    const fileHandler = require('./utils/fileHandler');
    fileHandler.importFile(req.file, res);
});

app.post('/api/uploadFileExcel', upload.single('file'), (req, res) => {
    importFile(req.file, res);
});

app.listen(5000, () => {
    console.log('Le serveur démarre sur le port 5000');
});