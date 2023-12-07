const express = require('express');
const router = express.Router();
const Lista = require('../models/liste');
const Account = require('../models/account');

router.use(express.json());

// Endpoint per ottenere tutte le liste dato un preciso idAccount
router.get('/:idAccount', async (req, res) => {
  const { idAccount } = req.params;

  if (!idAccount || !idAccount.match(/^[0-9a-fA-F]{24}$/)) { // verifico che l'id sia un objectID di mongodb
    return res.status(400).json({ error: 'ID account non valido' });
  }

  try {
    const liste = await Lista.find({ idAccount: idAccount });
    if (liste.length == 0) {
      res.status(404).json({ error: 'Liste non trovate' });
    } else {
      res.json({ message: `Liste dell'account con id ${idAccount}`, liste: liste });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante il recupero delle liste relativa all account: ${idAccount}` });
  }
});

// Endpoint per aggiungere una nuova lista. Contenuto preso dal body
router.post('/', async (req, res) => {
  if (!req.body || !req.body.titolo || !req.body.oggetti || !req.body.idAccount) {
    return res.status(400).json({ error: 'Nel body mancano i dati oppure sono presenti dati non validi' });
  }
  const { titolo, oggetti, idAccount } = req.body;
  
  try {


    const nuovaLista = new Lista({ titolo, oggetti, idAccount });
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
// TO TEST
router.put('/:idLista', async (req, res) => {
  const { idLista } = req.params;
  const { titolo, oggetti } = req.body;
  
  if (!idLista || !idLista.match(/^[0-9a-fA-F]{24}$/)) { //controllo che l'id sia del tipo objectId di mongodb
    return res.status(400).json({ error: 'ID della lista mancante o non valido' });
  }
  if (!titolo) {
    return res.status(400).json({ error: 'titolo non trovato' });
  }
  if (!oggetti) {
    return res.status(400).json({ error: 'oggetti della lista non trovati' });
  }

  try {

    const dataUltimaModifica = Date.now();
    const listaModificata = await Lista.findByIdAndUpdate(idLista, { titolo, oggetti, dataUltimaModifica }, { new: true });

    if (!listaModificata) {
      return res.status(404).json({ error: 'Lista non trovata' });
    }

    res.json({ message: 'Lista modificata con successo', lista_modificata: listaModificata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la modifica della lista' });
  }
});

module.exports = router;