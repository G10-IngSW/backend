const request = require('supertest');
const express = require('express');
const OggettiListe = require('../models/oggettiListe')
const oggettiRouter = require('../routes/oggetti.router');

const app = express();
app.use('/oggetti', oggettiRouter);

// Mocking the models
jest.mock('../models/oggettiListe');

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

const idConFormatoCorretto = '5f5f5f5f5f5f5f5f5f5f5f5f';

describe('GET /oggetti/:idAccount', () => {
  it('should return 400 if idAccount is missing or not a valid ObjectId', async () => {
    const response = await request(app)
      .get('/oggetti/invalidID');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'ID account mancante o non valido' });
  });

  it('should return 500 if an error occurs during oggetti retrieval', async () => {
    OggettiListe.find.mockRejectedValue(new Error('Errore simulato'));

    const response = await request(app)
      .get(`/oggetti/${idConFormatoCorretto}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ 
      error: `Errore durante il recupero degli oggetti relativi all account: ${idConFormatoCorretto}` 
    });
  });

  it('should return 200 and the oggetti for the given idAccount', async () => {
    const mockOggetti = [
      { nome: 'Oggetto1', quantita: 2 },
      { nome: 'Oggetto2', quantita: 1 },
    ];
    OggettiListe.find.mockResolvedValue(mockOggetti);

    const response = await request(app)
      .get(`/oggetti/${idConFormatoCorretto}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`Oggetti inseriti da ${idConFormatoCorretto}`);
    expect(response.body.oggetti).toEqual(mockOggetti);
  });

  it('should return 200 with an empty array if no oggetti are found for the given idAccount', async () => {

    OggettiListe.find.mockResolvedValue([]);

    const response = await request(app)
      .get(`/oggetti/${idConFormatoCorretto}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`Oggetti inseriti da ${idConFormatoCorretto}`);
    expect(response.body.oggetti).toEqual([]);
  });
});

describe('PUT /oggetti/:idAccount', () => {

  it('should return 400 if idAccount is missing or not a valid ObjectId', async () => {
    const response = await request(app)
      .put('/oggetti/invalidID')
      .send({ oggetto: 'Prodotto1' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'ID account non valido' });
  });

  it('should return 400 if oggetto is missing or not a string', async () => {
    const response = await request(app)
      .put(`/oggetti/${idConFormatoCorretto}`)
      .send({ oggetto: 123 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Oggetto mancante nel body' });
  });

  it('should return 500 if an error occurs during oggetto addition', async () => {
    OggettiListe.findOne.mockRejectedValue(new Error('Simulated error'));

    const response = await request(app)
      .put(`/oggetti/${idConFormatoCorretto}`)
      .send({ oggetto: 'Prodotto1' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Errore durante l aggiunta dell oggetto Prodotto1' });
  });

  it('should return 200 and modify the lista with the added oggetto', async () => {
    
    const mockListaEsistente = {
      idAccount: idConFormatoCorretto,
      oggetti: ['Prodotto1', 'Prodotto2'],
    };
    OggettiListe.findOne.mockResolvedValue(mockListaEsistente);
    OggettiListe.findOneAndUpdate.mockResolvedValue({ 
      ...mockListaEsistente, 
      oggetti: ['Prodotto1', 'Prodotto2', 'Prodotto3'] 
    });

    const response = await request(app)
      .put(`/oggetti/${idConFormatoCorretto}`)
      .send({ oggetto: 'Prodotto3' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Lista modificata con successo');
    expect(response.body.lista_modificata.oggetti).toEqual(['Prodotto1', 'Prodotto2', 'Prodotto3']);
  });

  it('should return 200 and create a new lista with the added oggetto if no lista exists', async () => {

    OggettiListe.findOne.mockResolvedValue(null);
    OggettiListe.prototype.save.mockResolvedValue({ idAccount: idConFormatoCorretto, oggetti: ['Prodotto1'] });
  
    const response = await request(app)
      .put(`/oggetti/${idConFormatoCorretto}`)
      .send({ oggetto: 'Prodotto1' });
  
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Lista modificata con successo');
    expect(response.body.lista_modificata.oggetti).toEqual(['Prodotto1']);
  });
});

describe('PUT /oggetti/rimuovi/:idAccount', () => {
  it('should return 400 if idAccount is not valid', async () => {
    const response = await request(app)
      .put('/oggetti/rimuovi/invalidID')
      .send({ oggetto: 'Prodotto1' });

    expect(response.status).toBe(400);
  });

  it('should return 400 if oggetto is missing in the request body', async () => {
    const response = await request(app)
      .put(`/oggetti/rimuovi/${idConFormatoCorretto}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it('should return 404 if no document is found with the specified ID account', async () => {
    OggettiListe.findOneAndUpdate.mockResolvedValue(null);

    const response = await request(app)
      .put(`/oggetti/rimuovi/${idConFormatoCorretto}`)
      .send({ oggetto: 'Prodotto1' });

    expect(response.status).toBe(404);
  });

  it('should return 200 and remove the specified oggetto from lista_modificata', async () => {
    const mockListaModificata = {
      idAccount: idConFormatoCorretto,
      oggetti: ['Prodotto2'],
    };

    OggettiListe.findOneAndUpdate.mockResolvedValue(mockListaModificata);

    const response = await request(app)
      .put(`/oggetti/rimuovi/${idConFormatoCorretto}`)
      .send({ oggetto: 'Prodotto1' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Elemento eliminato con successo');
    expect(response.body.lista_modificata.oggetti).toEqual(['Prodotto2']);
  });

  it('should return 500 if an error occurs during the removal of the oggetto', async () => {
    OggettiListe.findOneAndUpdate.mockRejectedValue(new Error('Errore simulato'));

    const response = await request(app)
      .put(`/oggetti/rimuovi/${idConFormatoCorretto}`)
      .send({ oggetto: 'Prodotto1' });

    expect(response.status).toBe(500);
  });
});

describe('DELETE /oggetti/:idAccount', () => {
  it('should return 400 if idAccount is not valid', async () => {
    const response = await request(app)
      .delete('/oggetti/invalidID');

    expect(response.status).toBe(400);
  });

  it('should return 404 if no document is found with the specified ID account', async () => {
    OggettiListe.findOneAndDelete.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/oggetti/${idConFormatoCorretto}`);

    expect(response.status).toBe(404);
  });

  it('should return 200 and delete the specified lista_modificata', async () => {
    const mockDeletedResult = {
      idAccount: idConFormatoCorretto,
      oggetti: ['Prodotto1', 'Prodotto2'],
    };

    OggettiListe.findOneAndDelete.mockResolvedValue(mockDeletedResult);

    const response = await request(app)
      .delete(`/oggetti/${idConFormatoCorretto}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Eliminazione avvenuta con successo');
  });

  it('should return 500 if an error occurs during the deletion of the lista_modificata', async () => {
    OggettiListe.findOneAndDelete.mockRejectedValue(new Error('Errore simulato'));

    const response = await request(app)
      .delete(`/oggetti/${idConFormatoCorretto}`);

    expect(response.status).toBe(500);
  });
});

