const express = require('express');
const router = express.Router();
const Lista = require('../models/liste');
const OggettiListe = require('../models/oggettiListe');

router.use(express.json());

// Endpoint per ottenere tutte le liste dato un preciso idUtente
router.get('/', async (req, res) => {
  const { idUtente } = req.query;

  if (!idUtente || !idUtente.match(/^[0-9a-fA-F]{24}$/)) { // verifico che l'id sia un objectID di mongodb
    return res.status(400).json({ error: 'ID utente non valido' });
  }

  try {
    const liste = await Lista.find({ idUtente });
    res.json({ message: `Liste dell'utente con id ${idUtente}`, liste: liste });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante il recupero delle liste relativa all utente: ${idUtente}` });
  }
});

// Endpoint per aggiungere una nuova lista. Contenuto preso dal body
// TODO: controllare che esista un utente con id = idUtente
router.post('/', async (req, res) => {
  if (!req.body || !req.body.titolo || !req.body.elementi || !req.body.idUtente) {
    return res.status(400).json({ error: 'Nel body mancano i dati oppure sono presenti dati non validi' });
  }
  const { titolo, elementi, idUtente } = req.body;
  
  try {
    const nuovaLista = new Lista({ titolo, elementi, idUtente });
    const listaSalvata = await nuovaLista.save();
    res.json({ message: 'Lista salvata con successo', lista_salvata: listaSalvata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante l aggiunta di una nuova lista' });
  }
});

// Endpoint per eliminare una lista dato l'id della lista
router.delete('/:idLista', async (req, res) => {
  const { idLista } = req.params;

  if (!idLista.match(/^[0-9a-fA-F]{24}$/)) { // verifico che l'id sia un objectID di mongodb
    return res.status(400).json({ error: 'ID della lista non valido' });
  }

  try {

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
  const { titolo, elementi } = req.body;
  
  if (!idLista.match(/^[0-9a-fA-F]{24}$/)) { //controllo che l'id sia del tipo objectId di mongodb
    return res.status(400).json({ error: 'ID della lista non valido' });
  }
  if (!titolo) {
    return res.status(400).json({ error: 'titolo non trovato' });
  }
  if (!elementi) {
    return res.status(400).json({ error: 'elementi della lista non trovati' });
  }

  try {

    const listaModificata = await Lista.findByIdAndUpdate(idLista, { titolo, elementi }, { new: true });

    if (!listaModificata) {
      return res.status(404).json({ error: 'Lista non trovata' });
    }

    res.json({ message: 'Lista modificata con successo', lista_modificata: listaModificata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la modifica della lista' });
  }
});

// Endpoint per ottenere tutti gli oggetti mai inseriti da un determinato utente
router.get('/oggetti/:idUtente', async (req, res) => {
  const { idUtente } = req.params;

  if (!idUtente.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'ID utente non valido' });
  }

  try {
    const oggetti = await OggettiListe.find({ idUtente });
    res.json({ message: `Oggetti inseriti da ${idUtente}`, oggetti: oggetti });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante il recupero degli oggetti relativi all utente: ${idUtente}` });
  }
});

// Endpoint per aggiungere un oggetto alla lista di oggetti mai inseriti da un determinato utente
// Se non esiste tale lista, viene creata
// TODO controllo duplicati
router.put('/oggetti/:idUtente', async (req, res) => {
  const { idUtente } = req.params;
  const { oggetto } = req.body;

  if (!idUtente.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'ID utente non valido' });
  }
  if (!oggetto || typeof oggetto !== 'string') {
    return res.status(400).json({ error: 'Oggetto mancante nel body'})
  }

  try {

    let listaOggettiModificata;

    const listaEsistente = await OggettiListe.findOne({ idUtente });

    if (listaEsistente) {
      listaOggettiModificata = await OggettiListe.findOneAndUpdate(
        { idUtente },
        { $push: { oggetti: oggetto } },
        { new: true }
      );
    } else {
      const nuovaLista = new OggettiListe({ idUtente, oggetti: [oggetto] });
      listaOggettiModificata = await nuovaLista.save();
    }

    res.json({ message: 'Lista modificata con successo', lista_modificata: listaOggettiModificata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante l aggiunta dell oggetto ${oggetto}` });
  }
});

// Endpoint per rimuovere un oggetto dalla lista di oggetti mai inseriti da un determinato utente
router.put('/oggetti/:idUtente/rimuovi', async (req, res) => {
  
  const { idUtente } = req.params;
  const { oggetto } = req.body;

  if (!idUtente.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'ID utente non valido' });
  }
  if (!oggetto) {
    return res.status(400).json({ error: 'Oggetto mancante nel body'});
  }

  try {

    const listaOggettiModificata = await OggettiListe.findOneAndUpdate(
      { idUtente },
      { $pull: { oggetti: oggetto } },
      { new: true }
    );

    if (listaOggettiModificata) {
      res.json({ message: 'Elemento eliminato con successo', lista_modificata: listaOggettiModificata });
    } else {
      res.status(404).json({ error: 'Nessun documento trovato con l ID utente specificato' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante la rimozione dell oggetto ${oggetto}` });
  }
});

// TOTEST Endpoint per eliminare la lista di oggetti mai inseriti da un utente
router.delete("/oggetti/:idUtente/rimuovitutti", async (req, res) => {
  const { idUtente } = req.params;

  if (!idUtente.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'ID utente non valido' });
  }

  try {
    const result = await OggettiListe.findByIdAndDelete('specificoID');

    if (result) {
      res.json({message: 'Eliminazione avvenuta con successo'});
    } else {
      res.status(404).json({error: 'lista con ID utente non trovato'})
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la rimozione della lista di oggetti' });
  }
});

module.exports = router;