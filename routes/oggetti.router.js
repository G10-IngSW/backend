const express = require('express');
const router = express.Router();
const OggettiListe = require('../models/oggettiListe');

router.use(express.json());

// Endpoint per ottenere tutti gli oggetti mai inseriti da un determinato account
router.get('/:idAccount', async (req, res) => {
  const { idAccount } = req.params;

  if (!idAccount || !idAccount.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'ID account mancante o non valido' });
  }

  try {
    const oggetti = await OggettiListe.find({ idAccount });
    res.json({ message: `Oggetti inseriti da ${idAccount}`, oggetti: oggetti });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante il recupero degli oggetti relativi all account: ${idAccount}` });
  }
});

// Endpoint per aggiungere un oggetto alla lista di oggetti mai inseriti da un determinato account
// Se non esiste tale lista, viene creata
router.put('/:idAccount', async (req, res) => {
  const { idAccount } = req.params;
  const { oggetto } = req.body;

  if (!idAccount || !idAccount.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'ID account non valido' });
  }
  if (!oggetto || typeof oggetto !== 'string') {
    return res.status(400).json({ error: 'Oggetto mancante nel body'})
  }

  try {

    let listaOggettiModificata;

    const listaEsistente = await OggettiListe.findOne({ idAccount });

    if (listaEsistente) {
      listaOggettiModificata = await OggettiListe.findOneAndUpdate(
        { idAccount },
        { $addToSet: { oggetti: oggetto } },
        { new: true }
      );
    } else {
      const nuovaLista = new OggettiListe({ idAccount, oggetti: [oggetto] });
      listaOggettiModificata = await nuovaLista.save();
    }

    res.json({ message: 'Lista modificata con successo', lista_modificata: listaOggettiModificata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante l aggiunta dell oggetto ${oggetto}` });
  }
});

// Endpoint per rimuovere un oggetto dalla lista di oggetti mai inseriti da un determinato account
router.put('/rimuovi/:idAccount', async (req, res) => {
  
  const { idAccount } = req.params;
  const { oggetto } = req.body;

  if (!idAccount || !idAccount.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'ID account non valido' });
  }
  if (!oggetto) {
    return res.status(400).json({ error: 'Oggetto mancante nel body'});
  }

  try {

    const listaOggettiModificata = await OggettiListe.findOneAndUpdate(
      { idAccount },
      { $pull: { oggetti: oggetto } },
      { new: true }
    );

    if (listaOggettiModificata) {
      res.json({ message: 'Elemento eliminato con successo', lista_modificata: listaOggettiModificata });
    } else {
      res.status(404).json({ error: 'Nessun documento trovato con l ID account specificato' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Errore durante la rimozione dell oggetto ${oggetto}` });
  }
});

// Endpoint per eliminare la lista di oggetti mai inseriti da un account
router.delete("/:idAccount", async (req, res) => {
  const { idAccount } = req.params;

  if (!idAccount || !idAccount.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'ID account non valido' });
  }

  try {
    const result = await OggettiListe.findOneAndDelete({idAccount});

    if (result) {
      res.json({message: 'Eliminazione avvenuta con successo'});
    } else {
      res.status(404).json({error: 'Lista non trovata'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la rimozione della lista di oggetti' });
  }
});

module.exports = router;