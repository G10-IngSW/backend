const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const Account = require('../models/account');
const app = express();
const accountRouter = require('../routes/account.router');
app.use('/account', accountRouter);

const mockAccountId = '656d99094e20e227874eac45';

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('POST /account/login', () => {
  it('should return 400 if data is missing', async () => {
    const response = await request(app)
      .post('/account/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Dati mancanti' });
  });

  it('should return 400 if data is not of type string', async () => {
    const response = await request(app)
      .post('/account/login')
      .send({ email: 123, password: 456 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'I dati non sono di tipo string' });
  });

  it('should return 404 if no account is associated with the email', async () => {
    // Mock Account.findOne to simulate no account found
    jest.spyOn(require('../models/account'), 'findOne').mockResolvedValue(null);

    const response = await request(app)
      .post('/account/login')
      .send({ email: 'nonexistent@example.com', password: 'password' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Nessun account associato alla mail: nonexistent@example.com' });
  });

  it('should return 401 if the password is incorrect', async () => {
    // Mock Account.findOne to simulate an existing account
    jest.spyOn(require('../models/account'), 'findOne').mockResolvedValue({
      email: 'existing@example.com',
      password: await bcrypt.hash('correctpassword', 10),
    });
  
    // Mock bcrypt.compare to simulate incorrect password
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
  
    const response = await request(app)
      .post('/account/login')
      .send({ email: 'existing@example.com', password: 'incorrectpassword' });
  
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Password errata' });
  });

  it('should return 200 and account data if login is successful', async () => {
    // Mock Account.findOne and bcrypt.compare to simulate successful login
    jest.spyOn(require('../models/account'), 'findOne').mockResolvedValue({
      email: 'existing@example.com',
      password: await bcrypt.hash('correctpassword', 10),
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const response = await request(app)
      .post('/account/login')
      .send({ email: 'existing@example.com', password: 'correctpassword' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login effettuato con successo');
    expect(response.body).toHaveProperty('account');
  });

  it('should return 500 if an error occurs during login', async () => {
    // Mock Account.findOne to simulate an error during login
    jest.spyOn(require('../models/account'), 'findOne').mockRejectedValue(new Error('Simulated error'));

    const response = await request(app)
      .post('/account/login')
      .send({ email: 'existing@example.com', password: 'correctpassword' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Errore durante il login' });
  });
});

describe('POST /account/registra', () => {
  it('should return 400 if data is missing', async () => {
    const response = await request(app)
      .post('/account/registra')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Dati mancanti' });
  });

  it('should return 400 if data is not of type string', async () => {
    const response = await request(app)
      .post('/account/registra')
      .send({ nome: 123, email: 'test@example.com', password: 456 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'I dati non sono di tipo string' });
  });

  it('should return 409 if an account already exists with the given email', async () => {
    // Mock Account.findOne to simulate an existing account
    jest.spyOn(require('../models/account'), 'findOne').mockResolvedValue({});

    const response = await request(app)
      .post('/account/registra')
      .send({ nome: 'Test', email: 'existing@example.com', password: 'password' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Esiste gia un account registrato con questa email' });
  });

  it('should return 200 and register a new account successfully', async () => {
    // Mock Account.findOne to simulate no existing account
    jest.spyOn(require('../models/account'), 'findOne').mockResolvedValue(null);

    // Mock bcrypt.hash to simulate successful password hashing
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

    // Mock Account.save to simulate successful account creation
    jest.spyOn(require('../models/account').prototype, 'save').mockResolvedValue({
      nome: 'Test',
      email: 'test@example.com',
      password: 'hashedPassword',
    });

    const response = await request(app)
      .post('/account/registra')
      .send({ nome: 'Test', email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Account registrato con successo');
    expect(response.body).toHaveProperty('account');
  });

  it('should return 500 if an error occurs during registration', async () => {
    // Mock Account.findOne to simulate no existing account
    jest.spyOn(require('../models/account'), 'findOne').mockResolvedValue(null);

    // Mock bcrypt.hash to simulate successful password hashing
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

    // Mock Account.save to simulate an error during account creation
    jest.spyOn(require('../models/account').prototype, 'save').mockRejectedValue(new Error('Simulated error'));

    const response = await request(app)
      .post('/account/registra')
      .send({ nome: 'Test', email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Errore durante la registrazione' });
  });
});

describe('DELETE /account/elimina/:idAccount', () => {

  it('should return 400 if idAccount is not a valid ObjectId', async () => {
    const response = await request(app).delete('/account/elimina/invalidId');
    expect(response.status).toBe(400);
  });

  it('should return 404 if account is not found', async () => {
    const nonExistentId = '5f5f5f5f5f5f5f5f5f5f5f5f';
    jest.spyOn(require('../models/account'), 'findByIdAndDelete').mockResolvedValue(null);

    const response = await request(app).delete(`/account/elimina/${nonExistentId}`);
    expect(response.status).toBe(404);
  });

  it('should return 200 and delete account and related lists successfully', async () => {
    const existingAccount = { _id: '5f5f5f5f5f5f5f5f5f5f5f5f' };
    jest.spyOn(require('../models/account'), 'findByIdAndDelete').mockResolvedValue(existingAccount);
    jest.spyOn(require('../models/liste'), 'deleteMany').mockResolvedValue({});
    jest.spyOn(require('../models/oggettiListe'), 'deleteMany').mockResolvedValue({});

    const response = await request(app).delete(`/account/elimina/${existingAccount._id}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Account e relative liste eliminate con successo');
  });

  it('should return 500 if an error occurs during account deletion', async () => {
    jest.spyOn(require('../models/account'), 'findByIdAndDelete').mockRejectedValue(new Error('Errore simulato'));
    
    const response = await request(app).delete('/account/elimina/656d99094e20e227874eac45');
    expect(response.status).toBe(500);
  });
});

describe('PUT /account/modifica/:idAccount', () => {

  it('should return 400 if idAccount is not defined or invalid', async () => {
    const response = await request(app)
      .put(`/account/modifica/invalidID`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'idAccount non definito o non valido' });
  });

  it('should return 404 if account is not found', async () => {

    jest.spyOn(require('../models/account'), 'findById').mockResolvedValue(null);
  
    const response = await request(app)
      .put(`/account/modifica/${mockAccountId}`)
      .send({});
  
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Account non trovato' });
  });

  it('should return 401 if vecchiaPassword is missing', async () => {
    jest.spyOn(require('../models/account'), 'findById').mockResolvedValue({
      vecchiaPassword: await bcrypt.hash('password', 10),
    });
  
    const response = await request(app)
      .put(`/account/modifica/${mockAccountId}`)
      .send({ 
        email: 'example.name@gmail.com', 
        nome: 'ExampleName', 
        nuovaPassword: 'password', 
        vecchiaPassword: '' 
      });
  
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Password mancante' });
  });

  it('should return 401 if vecchiaPassword is incorrect', async () => {
    jest.spyOn(require('../models/account'), 'findById').mockResolvedValue({
      _id: mockAccountId,
      email: 'example.name@gmail.com',
      nome: 'ExampleName',
      password: await bcrypt.hash('correctPassword', 10),
    });
  
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
  
    const response = await request(app)
      .put(`/account/modifica/${mockAccountId}`)
      .send({ 
        vecchiaPassword: 'incorrectPassword',
        nome: 'NewName',
        nuovaPassword: 'newPassword',
        email: 'newemail@example.com',
      });
  
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Vecchia password non corretta' });
  });

  it('should return 200 and modify the account successfully', async () => {
    const existingAccount = new Account({
      _id: mockAccountId,
      email: 'example.name@gmail.com',
      nome: 'ExampleName',
      password: await bcrypt.hash('password', 10),
    });
    
    // Simulo di trovare un account esistente
    jest.spyOn(Account, 'findById').mockResolvedValue(existingAccount);
    
    // Simulo di ritornare un account esistente modificato
    jest.spyOn(Account.prototype, 'save').mockResolvedValue(new Account({
      _id: mockAccountId,
      email: 'nuova.email@example.com',
      nome: 'NuovoNome',
      password: await bcrypt.hash('nuovaPassword', 10),
    }));
  
    const response = await request(app)
      .put(`/account/modifica/${mockAccountId}`)
      .send({
        vecchiaPassword: 'password',
        nome: 'NuovoNome',
        nuovaPassword: 'nuovaPassword',
        email: 'nuova.email@example.com',
      });
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Account modificato con successo');
    expect(response.body).toHaveProperty('account');
  });

  it('should return 500 if an error occurs during account modification', async () => {
    // Simulo errore
    jest.spyOn(require('../models/account'), 'findById').mockRejectedValue(new Error('Errore simulato'));

    const response = await request(app)
      .put(`/account/modifica/${mockAccountId}`)
      .send({
        vecchiaPassword: 'correctPassword',
        nome: 'NewName',
        nuovaPassword: 'newPassword',
        email: 'newemail@example.com',
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Errore durante la modifica dell account' });
  });
});