const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Account = require('../models/account');
const Lista = require('../models/liste');
const OggettiListe = require('../models/oggettiListe');

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
    
    const account = await Account.findOne({email});
    if(!account){
      return res.status(404).json({error: `Nessun account associato alla mail: ${email}`});
    }

    const passwordCorretta = await bcrypt.compare(password, account.password);
    if (!passwordCorretta) {
      return res.status(401).json({ error: 'Password errata' });
    }

    res.json({ message: 'Login effettuato con successo', account });
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
    const accountEsistente = await Account.findOne({email});
    if (accountEsistente) {
      return res.status(409).json({ error: 'Esiste gia un account registrato con questa email' });
    }

    const passwordCriptata = await bcrypt.hash(password, 10);

    const nuovoAccount = new Account({ nome, email, password: passwordCriptata });
    
    const accountSalvato = await nuovoAccount.save();
    res.json({ message: 'Account registrato con successo', account: accountSalvato });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la registrazione' }); 
  }
});

// Eliminazione account 
router.delete('/elimina/:idAccount', async (req, res) => {
  const { idAccount } = req.params;

  if (!idAccount) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }
  if (typeof idAccount !== 'string' || !idAccount.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'I dati non sono di tipo string' });
  }

  try {

    const eliminatoAccount = await Account.findByIdAndDelete(idAccount);

    if (!eliminatoAccount) {
      return res.status(404).json({ error: 'Account non trovato' });
    }

    await Lista.deleteMany({ idAccount });

    await OggettiListe.deleteMany({ idAccount });

    res.json({ message: 'Account e relative liste eliminate con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante l eliminazione dell account' });
  }
});

// Modifica account
router.put('/modifica/:idAccount', async (req, res) => {
  const { email, nome, nuovaPassword, vecchiaPassword } = req.body;
  const { idAccount } = req.params;

  if (!idAccount || !idAccount.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'idAccount non definito o non valido' })
  }

  try {
    const account = await Account.findById(idAccount);
    if (!account) {
      return res.status(404).json({ error: 'Account non trovato' });
    }

    if (!vecchiaPassword) {
      return res.status(401).json({ error: 'Password mancante'});
    }
    if (vecchiaPassword) { 
      const passwordCorretta = await bcrypt.compare(vecchiaPassword, account.password);
      if (!passwordCorretta) {
        return res.status(401).json({ error: 'Vecchia password non corretta' });
      }
    }

    if (nome) {
      account.nome = nome;
    }

    if (nuovaPassword) {
      const passwordCriptata = await bcrypt.hash(nuovaPassword, 10);
      account.password = passwordCriptata;
    }

    if (email) {
      account.email = email;
    }

    const accountModificato = await account.save();

    res.json({ message: 'Account modificato con successo', account: accountModificato });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la modifica dell account' });
  }
});

// ---FINE API---

module.exports = router;