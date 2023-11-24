const express = require('express');
const router = express.Router();
const Lista = require('../models/liste');

// Endpoint per ottenere tutte le liste
router.get('/', async (req, res) => {
  try {
    const liste = await Lista.find();
    console.log('Liste trovate:', liste);
    res.json(liste);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero delle liste.' });
  }
});

module.exports = router;