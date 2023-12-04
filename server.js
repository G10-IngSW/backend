require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes_lista = require('./routes/lista.router');
const routes_utenti = require('./routes/utenti.router');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express(); 
app.use(cors()); // permetto che si facciano richieste da qualunque indirizzo
mongoose.set('strictQuery', false);
app.use(express.json());

app.use('/liste', routes_lista);
app.use('/utenti', routes_utenti);

const PORT = process.env.PORT || 3000;

const swaggerDocument = YAML.load('./doc/PricePalDocs.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const connectToDB = async() => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME, 
    });
    console.log(`MongoDB connesso: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`In ascolto sulla porta ${PORT}`);
  });
});