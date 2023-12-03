const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Utente = require('../models/utente');

router.use(express.json());

// ---API---

// Login
router.post('/login', async (req, res) => {

  const { email, password } = req.body;

  if (!password || !email) {
    return res.status(400).json({ error: 'Dati mancanti' })
  }
  if (typeof password !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ error: 'I dati non sono di tipo string' });
  }

  try {
    
    const utente = await Utente.findOne({email});
    if(!utente){
      return res.status(404).json({error: `Nessun utente associato alla mail: ${email}`});
    }

    const passwordCorretta = await bcrypt.compare(password, utente.password);
    if (!passwordCorretta) {
      return res.status(401).json({ error: 'Password errata' });
    }

    res.json({ message: 'Login effettuato con successo', utente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

// Registrazione
router.post('/registra', async (req, res) => {
  const { nome, email, password } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }
  if (typeof nome !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'I dati non sono di tipo string' });
  }

  try {
    const utenteEsistente = await Utente.findOne({email});
    if (utenteEsistente) {
      return res.status(409).json({ error: 'Esiste gia un utente registrato con questa email' });
    }

    const passwordCriptata = await bcrypt.hash(password, 10);

    const nuovoUtente = new Utente({ nome, email, password: passwordCriptata });
    
    const utenteSalvato = await nuovoUtente.save();
    res.json({ message: 'Utente registrato con successo', utente: utenteSalvato });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la registrazione' }); 
  }
});

// Eliminazione account 
router.delete('/elimina/:email', async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }
  if (typeof email !== 'string') {
    return res.status(400).json({ error: 'I dati non sono di tipo string' });
  }

  try {
    const utente = await Utente.findOne({ email });

    if (!utente) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const eliminato = await Utente.deleteOne({ email });

    if (eliminato) {
      res.json({ message: 'Account eliminato con successo' });
    } else {
      res.status(500).json({ error: 'Errore durante l eliminazione dell account' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante l eliminazione dell account' });
  }
});

// Modifica account
router.put('/modifica/:idUtente', async (req, res) => {
  const { email, nome, nuovaPassword, vecchiaPassword } = req.body;
  const { idUtente } = req.params;

  if (!idUtente || !idUtente.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400).json({ error: 'idUtente non definito o non valido' })
  }

  try {
    const utente = await Utente.findById(idUtente);
    if (!utente) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (vecchiaPassword) {
      const passwordCorretta = await bcrypt.compare(vecchiaPassword, utente.password);
      if (!passwordCorretta) {
        return res.status(401).json({ error: 'Vecchia password non corretta' });
      }
    }

    if (nome) {
      utente.nome = nome;
    }

    if (nuovaPassword) {
      const passwordCriptata = await bcrypt.hash(nuovaPassword, 10);
      utente.password = passwordCriptata;
    }

    const utenteModificato = await utente.save();

    res.json({ message: 'Account modificato con successo', utente: utenteModificato });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la modifica dell account' });
  }
});

// ---FINE API---

module.exports = router;