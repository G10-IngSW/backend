const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const {Utente} = require('../models/utente_schema');

router.use(express.json());

// ---API---

// Login to test
router.post('/login', async (req, res) => {

  const { email, password } = req.body;

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

// Registrazione to test
router.post('/registrazione', async (req, res) => {
  const { nome, email, password } = req.body;

  try {

    const utenteEsistente = await Utente.findOne({email});

    if (utenteEsistente) {
      return res.status(400).json({ error: 'Esiste gia un utente registrato con questa email' });
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

// Eliminazione account todo

// ---FINE API---

module.exports = router;