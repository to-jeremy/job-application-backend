const express = require('express');
const router = express.Router();
const { getCandidatures, createCandidature, updateCandidature } = require('../controllers/candidatureController');

router.get('/', getCandidatures);
router.post('/', createCandidature);

router.put('/:id', updateCandidature);

module.exports = router;