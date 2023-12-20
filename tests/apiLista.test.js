const request = require('supertest');
const express = require('express');
const Lista = require('../models/liste');
const listaRouter = require('../routes/lista.router');

const app = express();
app.use('/liste', listaRouter);

// Mocking the models
jest.mock('../models/liste');

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

const idConFormatoCorretto = '5f5f5f5f5f5f5f5f5f5f5f5f';

describe('GET /liste/:idAccount', () => {
  it('should return 400 if idAccount is not valid', async () => {
    const response = await request(app).get('/liste/invalidID');
    expect(response.status).toBe(400);
  });

  it('should return 404 if no lists are found for the given idAccount', async () => {

    Lista.find.mockResolvedValue([]);

    const nonExistentId = idConFormatoCorretto;
    const response = await request(app).get(`/liste/${nonExistentId}`);
    expect(response.status).toBe(404);
  });

  it('should return 200 and the lists for the given idAccount', async () => {

    const mockList = {
      titolo: 'TestList',
      oggetti: ['oggetto1', 'oggetto2'],
      idAccount: idConFormatoCorretto,
    };

    Lista.find.mockResolvedValue([mockList]);

    const response = await request(app).get(`/liste/${idConFormatoCorretto}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`Liste dell'account con id ${idConFormatoCorretto}`);
    expect(response.body.liste[0]).toEqual(mockList);
  });

  it('should return 500 if an error occurs during the retrieval of lists', async () => {

    Lista.find.mockRejectedValue(new Error('Errore simulato'));

    const response = await request(app).get(`/liste/${idConFormatoCorretto}`);
    expect(response.status).toBe(500);
  });
});

describe('POST /liste', () => {
  it('should return 400 if data is missing or invalid', async () => {
    // Dati mancanti
    const response1 = await request(app)
      .post('/liste')
      .send({});

    // Dati non validi 
    const response2 = await request(app)
      .post('/liste')
      .send({ titolo: 'TestList', oggetti: ['oggetto1', 'oggetto2'] });

    expect(response1.status).toBe(400);
    expect(response1.body).toEqual({ error: 'Nel body mancano i dati oppure sono presenti dati non validi' });

    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({ error: 'Nel body mancano i dati oppure sono presenti dati non validi' });
  });

  it('should return 500 if an error occurs during list creation', async () => {
    // Mock List.save to simulate an error during list creation
    Lista.prototype.save.mockRejectedValue(new Error('Simulated error'));

    const response = await request(app)
      .post('/liste')
      .send({ titolo: 'TestList', oggetti: ['oggetto1', 'oggetto2'], idAccount: 'accountID' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Errore durante l aggiunta di una nuova lista' });
  });

  it('should return 200 and the saved list if creation is successful', async () => {
    // Mock List.save to simulate successful list creation
    const mockSavedList = {
      _id: 'mockedListID',
      titolo: 'TestList',
      oggetti: ['oggetto1', 'oggetto2'],
      idAccount: 'accountID',
    };
    Lista.prototype.save.mockResolvedValue(mockSavedList);

    const response = await request(app)
      .post('/liste')
      .send({ titolo: 'TestList', oggetti: ['oggetto1', 'oggetto2'], idAccount: 'accountID' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Lista salvata con successo');
    expect(response.body.lista_salvata).toEqual(mockSavedList);
  });
});

describe('DELETE /liste/:idLista', () => {
  it('should return 400 if idLista is not a valid ObjectId', async () => {
    const response = await request(app).delete('/liste/invalidID');
    expect(response.status).toBe(400);
  });

  it('should return 404 if list is not found', async () => {

    Lista.findByIdAndDelete.mockResolvedValue(null);

    const response = await request(app).delete(`/liste/${idConFormatoCorretto}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Lista non trovata' });
  });

  it('should return 200 and delete list successfully', async () => {

    const existingList = {
      _id: '5c5c5c5c5c5c5c5c5c5c5c5c',
      titolo: 'TestList',
      oggetti: ['oggetto1', 'oggetto2'],
      idAccount: idConFormatoCorretto,
    };
    Lista.findByIdAndDelete.mockResolvedValue(existingList);

    const response = await request(app).delete(`/liste/${existingList._id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Lista eliminata con successo' });
  });

  it('should return 500 if an error occurs during list deletion', async () => {

    Lista.findByIdAndDelete.mockRejectedValue(new Error('Errore simulato'));

    const response = await request(app).delete(`/liste/${idConFormatoCorretto}`);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Errore durante l eliminazione della lista' });
  });
});

describe('PUT /liste/:idLista', () => {
  it('should return 400 if idLista is missing or not a valid ObjectId', async () => {
    const response = await request(app)
      .put('/liste/invalidID')
      .send({ titolo: 'Titolo', oggetti: ['oggetto1', 'oggetto2'] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'ID della lista mancante o non valido' });
  });

  it('should return 400 if titolo is missing', async () => {
    const response = await request(app)
      .put(`/liste/${idConFormatoCorretto}`)
      .send({ oggetti: ['oggetto1', 'oggetto2'] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'titolo non trovato' });
  });

  it('should return 400 if oggetti is missing', async () => {
    const response = await request(app)
      .put(`/liste/${idConFormatoCorretto}`)
      .send({ titolo: 'Titolo' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'oggetti della lista non trovati' });
  });

  it('should return 404 if list is not found', async () => {
    Lista.findByIdAndUpdate.mockResolvedValue(null);

    const response = await request(app)
      .put(`/liste/${idConFormatoCorretto}`)
      .send({ titolo: 'Titolo', oggetti: ['oggetto1', 'oggetto2'] });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Lista non trovata' });
  });

  it('should return 200 and modify the list successfully', async () => {
    // Mock List.findByIdAndUpdate to simulate successful list modification
    const existingList = {
      _id: idConFormatoCorretto,
      titolo: 'VecchioTitolo',
      oggetti: ['oggetto1', 'oggetto2'],
      idAccount: 'accountID',
    };
    const modifiedList = {
      _id: idConFormatoCorretto,
      titolo: 'NuovoTitolo',
      oggetti: ['oggetto1', 'oggetto2'],
      idAccount: 'accountID',
      dataUltimaModifica: Date.now(),
    };
    Lista.findByIdAndUpdate.mockResolvedValue(modifiedList);

    const response = await request(app)
      .put(`/liste/${existingList._id}`)
      .send({ titolo: 'NuovoTitolo', oggetti: ['oggetto1', 'oggetto2'] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Lista modificata con successo', lista_modificata: modifiedList });
  });

  it('should return 500 if an error occurs during list modification', async () => {
    Lista.findByIdAndUpdate.mockRejectedValue(new Error('Simulated error'));

    const response = await request(app)
      .put(`/liste/${idConFormatoCorretto}`)
      .send({ titolo: 'Titolo', oggetti: ['oggetto1', 'oggetto2'] });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Errore durante la modifica della lista' });
  });
});