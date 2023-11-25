const express = require('express');
const router = express.Router();
const Lista = require('../models/liste');
const OggettiListe = require('../models/oggettiListe');

router.use(express.json());

// Endpoint per ottenere tutte le liste
router.get('/', async (req, res) => {
  try {
    const liste = await Lista.find();
    res.json(liste);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero di tutte le liste' });
  }
});

// Endpoint per ottenere tutte le liste dato un preciso idUtente
router.get('/:idUtente', async (req, res) => {
  const { idUtente } = req.params;

  try {
    const liste = await Lista.find({ idUtente });
    res.json(liste);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante il recupero delle liste relativa all utente: ${idUtente}` });
  }
});

// Endpoint per aggiungere una nuova lista. Contenuto preso dal body
router.post('/', async (req, res) => {
  try {
    if (!req.body || !req.body.titolo || !req.body.elementi || !req.body.idUtente) {
      return res.status(400).json({ error: 'Nel body mancano i dati oppure sono presenti dati non validi' });
    }

    const { titolo, elementi, idUtente } = req.body;

    const nuovaLista = new Lista({ titolo, elementi, idUtente });
    const listaSalvata = await nuovaLista.save();
    res.json(listaSalvata);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante l aggiunta di una nuova lista' });
  }
});

// Endpoint per eliminare una lista dato l'id della lista
router.delete('/:idLista', async (req, res) => {
  const { idLista } = req.params;

  try {
    if (!idLista.match(/^[0-9a-fA-F]{24}$/)) { // verifico che l'id sia un objectID di mongodb
      return res.status(400).json({ error: 'ID della lista non valido' });
    }

    const listaEliminata = await Lista.findByIdAndDelete(idLista);

    if (listaEliminata) {
      res.json({ message: 'Lista eliminata con successo' });
    } else {
      res.status(404).json({ error: 'Lista non trovata' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante l eliminazione della lista' });
  }
});

// Endpoint per modificare una lista gia creata in precedenza
router.put('/:idLista', async (req, res) => {
  const { idLista } = req.params;

  try {
    if (!idLista.match(/^[0-9a-fA-F]{24}$/)) { //controllo che l'id sia del tipo objectId di mongodb
      return res.status(400).json({ error: 'ID della lista non valido' });
    }

    const { titolo, elementi } = req.body;
    const listaModificata = await Lista.findByIdAndUpdate(idLista, { titolo, elementi }, { new: true });

    if (!listaModificata) {
      return res.status(404).json({ error: 'Lista non trovata' });
    }

    res.json(listaModificata);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la modifica della lista' });
  }
});

// Endpoint per ottenere tutti gli oggetti mai inseriti da un determinato utente
router.get('/oggetti/:idUtente', async (req, res) => {
  const { idUtente } = req.params;

  try {
    const oggetti = await OggettiListe.find({ idUtente });
    res.json(oggetti);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante il recupero degli oggetti relativi all utente: ${idUtente}` });
  }
});

// Endpoint per aggiungere un oggetto alla lista di oggetti mai inseriti da un determinato utente
router.put('/oggetti/:idUtente', async (req, res) => {
  try {
    const { idUtente } = req.params;
    const { oggetto } = req.body;

    if (!idUtente) {
      return res.status(400).json({ error: 'ID dell utente mancante' });
    }
    if (!oggetto) {
      return res.status(400).json({ error: 'Oggetto mancante nel body'})
    }

    const listaOggettiModificata = await OggettiListe.findOneAndUpdate(
      { idUtente },
      { $push: { oggetti: oggetto } },
      { new: true }
    );

    if (listaOggettiModificata) {
      res.json(listaOggettiModificata);
    } else {
      res.status(404).json({ error: 'Nessun documento trovato con l ID utente specificato' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante l aggiunta dell oggetto ${oggetto}` });
  }
});

// Endpoint per rimuovere un oggetto dalla lista di oggetti mai inseriti da un determinato utente
router.put('/oggetti/:idUtente/rimuovi', async (req, res) => {
  try {
    const { idUtente } = req.params;
    const { oggetto } = req.body;

    if (!idUtente) {
      return res.status(400).json({ error: 'ID dell utente mancante'});
    }
    if (!oggetto) {
      return res.status(400).json({ error: 'Oggetto mancante nel body'});
    }

    const listaOggettiModificata = await OggettiListe.findOneAndUpdate(
      { idUtente },
      { $pull: { oggetti: oggetto } },
      { new: true }
    );

    if (listaOggettiModificata) {
      res.json(listaOggettiModificata);
    } else {
      res.status(404).json({ error: 'Nessun documento trovato con l ID utente specificato' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante la rimozione dell oggetto ${oggetto}` });
  }
});

module.exports = router;